# Cloudflare Workers — Estandares MCCO

## Estructura de Endpoints

- Todo Worker debe tener `/health` (200 + uptime) y `/health/ready` (verifica conexion DB)
- Agrupar endpoints por dominio: `/api/pipeline/*`, `/api/agent-comms/*`, etc.
- Formato de respuesta consistente:
  - Exito: `{ ok: true, data: ... }`
  - Error: `{ ok: false, error: "mensaje" }`

## D1 Database

- SIEMPRE usar prepared statements:
  ```typescript
  env.DB.prepare("SELECT * FROM tabla WHERE id = ?").bind(id).first()
  ```
- NUNCA concatenar variables en strings SQL
- Usar `ON CONFLICT` para upserts (operaciones idempotentes)
- Migraciones numeradas: `0001_initial.sql`, `0002_add_index.sql`
- Probar migraciones localmente antes de deploy:
  `wrangler d1 migrations apply --local`
- Batch queries cuando se necesitan multiples operaciones:
  `env.DB.batch([stmt1, stmt2, stmt3])`

## Validacion de Input

- Validar route params contra whitelist (ej: nombres de agentes validos)
- Validar JSON body antes de procesar
- Retornar 400 con mensaje claro ante input invalido
- Verificar tamano maximo del body antes de parsear

## CORS Middleware

```typescript
function corsHeaders(origin: string): Record<string, string> {
  const allowed = ['https://admin.mccogroup.cl'];
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}
```

- Aplicar en todas las rutas publicas
- Manejar preflight OPTIONS devolviendo 204

## Manejo de Errores

- Envolver cada handler en try/catch
- Devolver 500 con mensaje generico al cliente:
  `{ ok: false, error: "Internal server error" }`
- Loguear el error detallado server-side con `console.error`
- NUNCA exponer stack traces ni mensajes internos al cliente

## Performance

- Bundle final debe quedar bajo 1 MB
- Usar streaming para respuestas grandes (listas de CAs, etc.)
- Cache responses estaticas con Cache API donde aplique
- Agrupar queries D1 para reducir round-trips

## Autenticacion

- Validar header `Authorization: Bearer <token>` en rutas privadas
- Tokens almacenados en Secrets de Cloudflare (no en `wrangler.toml`)
- Retornar 401 ante token ausente o invalido — nunca 403 para no revelar existencia
