#!/usr/bin/env python3
"""
SRP Vision — GoPro Hero 13 Frame Capture & Analysis Client
===========================================================

Captura frames de la GoPro Hero 13 y los envía al backend SRP Vision
para análisis en tiempo real con Gemini 2.5 Flash.

Modos de operación:
  1. gopro-wifi  : Conecta vía WiFi al preview stream de la GoPro
  2. gopro-usb   : GoPro en modo webcam USB (aparece como cámara)
  3. webcam       : Cualquier cámara del sistema (para pruebas)
  4. file         : Analiza un archivo de imagen o video (para demos)

Uso:
  python gopro_vision.py --mode webcam --server ws://localhost:3000/ws
  python gopro_vision.py --mode gopro-wifi --server ws://tu-servidor:3000/ws
  python gopro_vision.py --mode file --input video.mp4 --server ws://localhost:3000/ws
"""

import argparse
import base64
import json
import sys
import time
import threading
from io import BytesIO
from pathlib import Path

try:
    import cv2
    import requests
    import websocket
except ImportError:
    print("Instala dependencias: pip install -r requirements.txt")
    sys.exit(1)

# ── Config ────────────────────────────────────────────────────────────────────

GOPRO_IP = "10.5.5.9"
GOPRO_PORT = 8080
GOPRO_BASE = f"http://{GOPRO_IP}:{GOPRO_PORT}"

# Preview stream: la GoPro envía MPEG-TS por UDP en port 8554
GOPRO_STREAM_URL = f"udp://{GOPRO_IP}:8554"

FRAME_WIDTH = 720
FRAME_HEIGHT = 405
JPEG_QUALITY = 70  # 0-100, menos = más compresión
DEFAULT_FPS = 1.0  # frames por segundo a enviar

# ── GoPro Control ─────────────────────────────────────────────────────────────

def gopro_command(path: str) -> dict | None:
    """Envía un comando HTTP a la GoPro."""
    try:
        r = requests.get(f"{GOPRO_BASE}{path}", timeout=5)
        r.raise_for_status()
        return r.json() if r.content else {}
    except Exception as e:
        print(f"[GoPro] Error en {path}: {e}")
        return None

def gopro_start_preview():
    """Inicia el preview stream de la GoPro vía WiFi."""
    print("[GoPro] Iniciando preview stream...")
    result = gopro_command("/gopro/camera/stream/start")
    if result is not None:
        print("[GoPro] Preview stream iniciado")
        # Darle tiempo a la GoPro para empezar el stream
        time.sleep(2)
    return result

def gopro_stop_preview():
    """Detiene el preview stream."""
    gopro_command("/gopro/camera/stream/stop")
    print("[GoPro] Preview stream detenido")

def gopro_start_webcam():
    """Pone la GoPro en modo webcam (USB)."""
    print("[GoPro] Iniciando modo webcam...")
    result = gopro_command("/gopro/webcam/start")
    if result is not None:
        print("[GoPro] Modo webcam activo")
    return result

# ── Frame Capture ─────────────────────────────────────────────────────────────

def frame_to_jpeg(frame, width=FRAME_WIDTH, height=FRAME_HEIGHT) -> bytes:
    """Redimensiona y comprime un frame OpenCV a JPEG."""
    resized = cv2.resize(frame, (width, height))
    _, buffer = cv2.imencode('.jpg', resized, [cv2.IMWRITE_JPEG_QUALITY, JPEG_QUALITY])
    return buffer.tobytes()

def open_capture(mode: str, input_path: str = None) -> cv2.VideoCapture:
    """Abre la fuente de video según el modo."""
    if mode == "gopro-wifi":
        gopro_start_preview()
        cap = cv2.VideoCapture(GOPRO_STREAM_URL, cv2.CAP_FFMPEG)
        if not cap.isOpened():
            # Fallback: intentar con RTSP
            alt_url = f"rtsp://{GOPRO_IP}:8554/live"
            print(f"[Capture] UDP falló, intentando {alt_url}")
            cap = cv2.VideoCapture(alt_url, cv2.CAP_FFMPEG)

    elif mode == "gopro-usb":
        # La GoPro en modo webcam aparece como última cámara agregada
        # Probar índices 0, 1, 2...
        for idx in range(5):
            cap = cv2.VideoCapture(idx)
            if cap.isOpened():
                print(f"[Capture] Cámara encontrada en índice {idx}")
                break
        else:
            print("[Capture] No se encontró la GoPro como webcam")
            sys.exit(1)

    elif mode == "webcam":
        cap = cv2.VideoCapture(0)

    elif mode == "file":
        if not input_path:
            print("[Capture] Necesitas --input para modo file")
            sys.exit(1)
        cap = cv2.VideoCapture(input_path)

    else:
        print(f"[Capture] Modo desconocido: {mode}")
        sys.exit(1)

    if not cap.isOpened():
        print(f"[Capture] No se pudo abrir la fuente de video ({mode})")
        sys.exit(1)

    print(f"[Capture] Fuente abierta: {mode}")
    return cap

# ── WebSocket Client ──────────────────────────────────────────────────────────

class VisionClient:
    """Cliente WebSocket para SRP Vision backend."""

    def __init__(self, server_url: str, phone: str, equipment: str):
        self.server_url = server_url
        self.phone = phone
        self.equipment = equipment
        self.session_id = None
        self.ws = None
        self.connected = False
        self.processing = False  # backpressure: no enviar si estamos esperando respuesta
        self.frame_count = 0
        self.last_analysis = None

    def connect(self):
        """Conecta al backend y crea sesión de visión."""
        print(f"[WS] Conectando a {self.server_url}...")

        self.ws = websocket.WebSocketApp(
            self.server_url,
            on_open=self._on_open,
            on_message=self._on_message,
            on_error=self._on_error,
            on_close=self._on_close,
        )

        # Ejecutar WebSocket en thread separado
        self.ws_thread = threading.Thread(target=self.ws.run_forever, daemon=True)
        self.ws_thread.start()

        # Esperar conexión
        for _ in range(50):
            if self.connected:
                return True
            time.sleep(0.1)

        print("[WS] Timeout esperando conexión")
        return False

    def _on_open(self, ws):
        self.connected = True
        print("[WS] Conectado")

        # Iniciar sesión de visión
        ws.send(json.dumps({
            "type": "session:start",
            "technicianPhone": self.phone,
            "equipmentTag": self.equipment,
        }))

    def _on_message(self, ws, message):
        try:
            msg = json.loads(message)
        except json.JSONDecodeError:
            return

        msg_type = msg.get("type")

        if msg_type == "session:started":
            self.session_id = msg["session"]["id"]
            print(f"[Vision] Sesión iniciada: {self.session_id}")

        elif msg_type == "vision:result":
            self.processing = False
            analysis = msg.get("analysis", {})
            self.last_analysis = analysis

            risk = analysis.get("risk_level", "none")
            instruction = analysis.get("instruction", "")
            components = analysis.get("detected_components", [])
            confidence = analysis.get("confidence", 0)

            risk_icon = {"none": "✅", "low": "🟢", "medium": "🟡", "high": "🟠", "critical": "🔴"}.get(risk, "❓")

            print(f"\n{risk_icon} [{risk.upper()}] (conf: {confidence:.0%})")
            print(f"   📋 {instruction}")
            if components:
                print(f"   🔧 Componentes: {', '.join(components)}")
            anomalies = analysis.get("anomalies", [])
            if anomalies:
                print(f"   ⚠️  Anomalías: {', '.join(anomalies)}")
            print()

        elif msg_type == "senior:instruction":
            content = msg.get("content", "")
            print(f"\n👷 [SUPERVISOR]: {content}\n")

    def _on_error(self, ws, error):
        print(f"[WS] Error: {error}")

    def _on_close(self, ws, close_status_code, close_msg):
        self.connected = False
        print("[WS] Desconectado")

    def send_frame(self, jpeg_bytes: bytes):
        """Envía un frame JPEG al backend como blob binario."""
        if not self.connected or not self.ws or self.processing:
            return False

        self.processing = True  # backpressure
        self.ws.send(jpeg_bytes, opcode=websocket.ABNF.OPCODE_BINARY)
        self.frame_count += 1
        return True

    def send_question(self, question: str, jpeg_bytes: bytes):
        """Envía un frame con pregunta del técnico."""
        if not self.connected or not self.ws:
            return False

        b64 = base64.b64encode(jpeg_bytes).decode('utf-8')
        self.ws.send(json.dumps({
            "type": "frame",
            "imageBase64": b64,
            "query": question,
        }))
        self.processing = True
        return True

    def end_session(self):
        """Cierra la sesión de visión."""
        if self.ws and self.connected and self.session_id:
            self.ws.send(json.dumps({
                "type": "session:end",
                "sessionId": self.session_id,
            }))
            time.sleep(0.5)
        if self.ws:
            self.ws.close()

# ── Main Loop ─────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="SRP Vision — GoPro Capture Client")
    parser.add_argument("--mode", choices=["gopro-wifi", "gopro-usb", "webcam", "file"],
                        default="webcam", help="Fuente de video")
    parser.add_argument("--server", default="ws://localhost:3000/ws",
                        help="URL del WebSocket del backend")
    parser.add_argument("--phone", default="+56900000000",
                        help="Teléfono del técnico")
    parser.add_argument("--equipment", default="CAEX-930E-001",
                        help="Tag del equipo (ej: CAEX-930E-001, PALA-4100XPC-002)")
    parser.add_argument("--fps", type=float, default=DEFAULT_FPS,
                        help="Frames por segundo a enviar (default: 1)")
    parser.add_argument("--input", default=None,
                        help="Archivo de video/imagen para modo 'file'")
    parser.add_argument("--show", action="store_true",
                        help="Mostrar ventana de preview local")
    args = parser.parse_args()

    # Conectar al backend
    client = VisionClient(args.server, args.phone, args.equipment)
    if not client.connect():
        print("No se pudo conectar al backend. ¿Está corriendo el servidor?")
        sys.exit(1)

    # Esperar sesión
    for _ in range(30):
        if client.session_id:
            break
        time.sleep(0.1)

    if not client.session_id:
        print("No se recibió confirmación de sesión")
        sys.exit(1)

    # Abrir fuente de video
    cap = open_capture(args.mode, args.input)
    interval = 1.0 / args.fps

    print(f"\n{'='*60}")
    print(f"  SRP Vision — Captura activa")
    print(f"  Modo: {args.mode}")
    print(f"  Equipo: {args.equipment}")
    print(f"  FPS: {args.fps}")
    print(f"  Servidor: {args.server}")
    print(f"  Sesión: {client.session_id}")
    print(f"  [Q] Hacer pregunta | [Ctrl+C] Salir")
    print(f"{'='*60}\n")

    try:
        while True:
            t0 = time.time()

            ret, frame = cap.read()
            if not ret:
                if args.mode == "file":
                    print("[Capture] Fin del archivo")
                    break
                print("[Capture] Error leyendo frame, reintentando...")
                time.sleep(1)
                continue

            # Comprimir y enviar
            jpeg = frame_to_jpeg(frame)
            sent = client.send_frame(jpeg)

            status = "📤" if sent else "⏳"  # ⏳ = esperando respuesta anterior
            sys.stdout.write(f"\r{status} Frame #{client.frame_count} | {len(jpeg)//1024}KB | "
                             f"{'procesando...' if client.processing else 'listo'}    ")
            sys.stdout.flush()

            # Preview local
            if args.show:
                # Overlay de último análisis
                display = frame.copy()
                if client.last_analysis:
                    risk = client.last_analysis.get("risk_level", "none")
                    instruction = client.last_analysis.get("instruction", "")[:80]
                    color = {"none": (0,255,0), "low": (0,255,0), "medium": (0,255,255),
                             "high": (0,165,255), "critical": (0,0,255)}.get(risk, (255,255,255))
                    cv2.putText(display, f"[{risk.upper()}] {instruction}",
                                (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                cv2.imshow("SRP Vision - GoPro", display)
                key = cv2.waitKey(1) & 0xFF
                if key == ord('q'):
                    break

            # Mantener FPS deseado
            elapsed = time.time() - t0
            if elapsed < interval:
                time.sleep(interval - elapsed)

    except KeyboardInterrupt:
        print("\n\n[Vision] Cerrando sesión...")

    finally:
        client.end_session()
        cap.release()
        if args.show:
            cv2.destroyAllWindows()
        if args.mode == "gopro-wifi":
            gopro_stop_preview()

        print(f"\n📊 Resumen: {client.frame_count} frames enviados")


if __name__ == "__main__":
    main()
