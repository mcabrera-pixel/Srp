# Troubleshooting - Mining RAG

Guía de resolución de problemas comunes.

---

## 🔴 El bot no responde a WhatsApp

### Síntomas
- Mensajes enviados al bot no generan respuesta
- No hay logs en `wrangler tail`

### Soluciones

1. **Verificar configuración Wasender**
   ```bash
   # Probar envío manual
   curl "https://mining-rag.xxx.workers.dev/debug/send-message?phone=56912345678"
   ```

2. **Verificar webhook secret**
   - El header `X-Webhook-Secret` debe coincidir con `WASENDER_SECRET`
   - Revisar configuración en panel Wasender

3. **Revisar logs**
   ```bash
   wrangler tail --format=pretty
   ```

4. **Verificar que no sea mensaje propio**
   - El sistema ignora mensajes con `fromMe: true`

---

## 🔴 Timeout en generación de procedimientos

### Síntomas
- Usuario confirma pero no recibe PDF
- Logs muestran "timeout" o proceso incompleto

### Causa
La generación con LLM + PDF puede tomar 30-60 segundos.

### Soluciones

1. **Verificar background processing**
   - El código usa `ctx.waitUntil()` para evitar timeout HTTP
   - Si falla, revisar errores en logs

2. **Verificar estado de solicitud**
   ```bash
   curl https://mining-rag.xxx.workers.dev/admin/status
   ```

3. **Limpiar sesiones atascadas**
   ```bash
   curl -X POST https://mining-rag.xxx.workers.dev/admin/clear-stuck
   ```

---

## 🔴 Error de transcripción de audio

### Síntomas
- "Error procesando audio"
- Audio no se transcribe

### Soluciones

1. **Verificar binding de AI**
   ```bash
   curl https://mining-rag.xxx.workers.dev/debug-bindings
   # Debe mostrar "hasAI": true
   ```

2. **Límites de audio**
   - Whisper tiene límite de duración (~30 min)
   - Formatos soportados: ogg, mp3, wav, m4a

3. **Verificar URL del audio**
   - La URL de Wasender debe ser accesible

---

## 🔴 PDF no se genera o está corrupto

### Síntomas
- Error 404 al descargar PDF
- PDF en blanco o corrupto

### Soluciones

1. **Probar generación manual**
   ```bash
   curl https://mining-rag.xxx.workers.dev/debug/pdf -o test.pdf
   ```

2. **Verificar R2 binding**
   ```bash
   curl https://mining-rag.xxx.workers.dev/debug-bindings
   # Debe mostrar "hasR2": true
   ```

3. **Revisar logs de error**
   - Buscar errores de jsPDF o R2 en `wrangler tail`

---

## 🔴 RAG no retorna contexto relevante

### Síntomas
- Procedimientos genéricos sin contexto específico
- Logs muestran "No relevant context found"

### Soluciones

1. **Verificar documentos indexados**
   ```bash
   curl https://mining-rag.xxx.workers.dev/admin/status
   # Revisar "total_documents" en stats
   ```

2. **Reingestar documentos**
   ```bash
   node scripts/ingest.cjs "https://mining-rag.xxx.workers.dev" "SECRET" "./documents"
   ```

3. **Verificar Vectorize**
   ```bash
   wrangler vectorize list
   ```

---

## 🔴 Error de parsing JSON del LLM

### Síntomas
- "SyntaxError: Unexpected token"
- Respuesta del LLM no parsea

### Causa
Claude a veces incluye markdown o texto extra.

### Solución
El código sanitiza respuestas:
```typescript
const cleaned = response.replace(/```json/g, '').replace(/```/g, '').trim();
```

Si persiste, revisar el prompt para ser más explícito sobre formato.

---

## 🛠️ Monitor CLI

Usa el monitor para ver estado en tiempo real:

```bash
node scripts/monitor.cjs
```

Opciones:
```bash
# URL personalizada
WORKER_URL=https://mining-rag.xxx.workers.dev node scripts/monitor.cjs

# Intervalo de polling
POLL_INTERVAL=5000 node scripts/monitor.cjs
```

---

## 📋 Checklist de Diagnóstico

| Verificación | Comando |
|--------------|---------|
| Worker online | `curl https://mining-rag.xxx.workers.dev/` |
| Bindings OK | `curl .../debug-bindings` |
| DB conectada | Revisar `stats` en `/admin/status` |
| Wasender funcionando | `curl .../debug/send-message?phone=X` |
| Logs disponibles | `wrangler tail` |

---

## Contacto

Si el problema persiste, revisar:
1. [Cloudflare Status](https://www.cloudflarestatus.com/)
2. Logs completos con `wrangler tail --format=json`
3. Estado de OpenRouter para disponibilidad de Claude
