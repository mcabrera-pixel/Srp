# Data Procedimientos

Carpeta de documentos fuente para el pipeline NotebookLM.

## Estructura

```
Data Procedimientos/
├── converted/              # Markdown convertidos (output)
├── Mapa de Proceso POX/    # PDFs de mapas de proceso
├── Miper POX/              # PDFs de MIPER
├── Peligros inherentes POX/
├── SIGO y otros/
├── Bow-Tie RC y Peligros Generales Asociados/
└── ...
```

## Flujo de Trabajo

### Opción 1: Conversión Manual + Skill (Recomendado)

1. **Convertir documento a Markdown:**
   ```bash
   # Desde la raíz del proyecto
   .\scripts\convertir.bat "Data Procedimientos\SIGO y otros\PRO.0908.MPER1 (1).pdf"
   ```
   Genera: `Data Procedimientos/converted/PRO.0908.MPER1 (1).md`

2. **Optimizar para NotebookLM:**
   ```
   /procesar-documento PRO.0908.MPER1
   ```
   Genera: `loro-suite/docs/notebooklm/pro-0908-mper1.md`

3. **Subir a NotebookLM** (manual)

4. **Obtener prompts:**
   ```
   /notebooklm-prompts
   ```

### Opción 2: Skill Todo-en-Uno

Si Claude puede leer el PDF directamente:
```
/procesar-documento "Data Procedimientos\SIGO y otros\PRO.0908.MPER1 (1).pdf"
```

## Formatos Soportados

| Formato | Herramienta | Estado |
|---------|-------------|--------|
| PDF     | pdftotext   | ✅ Listo |
| DOCX    | pandoc/COM  | ⚠️ Requiere pandoc |
| DOC     | Word COM    | ⚠️ Requiere Word |
| MD      | Directo     | ✅ Listo |

## Instalar Pandoc (Opcional)

Para mejor soporte de Word:
```bash
winget install pandoc
```

## Skills Disponibles

| Skill | Uso |
|-------|-----|
| `/procesar-documento [archivo]` | Convierte y optimiza para NotebookLM |
| `/notebooklm-documento [nombre]` | Genera .md desde datos TypeScript |
| `/notebooklm-prompts` | Muestra prompts para Video Overview |
