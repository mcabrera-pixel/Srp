# SRP Vision — GoPro Capture Client

Captura frames de la GoPro Hero 13 y los envía al backend SRP Vision.

## Setup

```bash
pip install -r requirements.txt
```

## Uso

### Modo webcam (para probar sin GoPro)
```bash
python gopro_vision.py --mode webcam --show
```

### Modo GoPro WiFi (producción)
1. Enciende la GoPro Hero 13
2. Conecta tu PC al WiFi de la GoPro (GP-XXXX)
3. Ejecuta:
```bash
python gopro_vision.py --mode gopro-wifi --equipment CAEX-930E-001 --show
```

### Modo GoPro USB (webcam)
1. Conecta la GoPro por USB-C
2. En la GoPro: Preferencias > Conexiones > USB > GoPro Connect
3. Ejecuta:
```bash
python gopro_vision.py --mode gopro-usb --equipment CAEX-930E-001 --show
```

### Analizar video grabado
```bash
python gopro_vision.py --mode file --input video_mantencion.mp4 --fps 0.5 --show
```

## Opciones

| Flag | Default | Descripción |
|------|---------|-------------|
| `--mode` | webcam | gopro-wifi, gopro-usb, webcam, file |
| `--server` | ws://localhost:3000/ws | URL del backend |
| `--phone` | +56900000000 | ID del técnico |
| `--equipment` | CAEX-930E-001 | Tag del equipo |
| `--fps` | 1.0 | Frames por segundo |
| `--input` | - | Archivo para modo file |
| `--show` | false | Mostrar preview local con overlay |
