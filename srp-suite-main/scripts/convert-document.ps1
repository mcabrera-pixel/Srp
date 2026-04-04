# convert-document.ps1
# Convierte PDF o Word a Markdown
# Uso: .\convert-document.ps1 -InputFile "ruta\al\archivo.pdf" [-OutputDir "ruta\salida"]

param(
    [Parameter(Mandatory=$true)]
    [string]$InputFile,

    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "$PSScriptRoot\..\Data Procedimientos\converted"
)

# Verificar que el archivo existe
if (-not (Test-Path $InputFile)) {
    Write-Error "Archivo no encontrado: $InputFile"
    exit 1
}

# Crear directorio de salida si no existe
if (-not (Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

$fileName = [System.IO.Path]::GetFileNameWithoutExtension($InputFile)
$extension = [System.IO.Path]::GetExtension($InputFile).ToLower()
$outputFile = Join-Path $OutputDir "$fileName.md"

Write-Host "Convirtiendo: $InputFile" -ForegroundColor Cyan
Write-Host "Extension: $extension" -ForegroundColor Gray

switch ($extension) {
    ".pdf" {
        # Usar pdftotext (disponible en Git for Windows)
        $pdftotext = "C:\Program Files\Git\mingw64\bin\pdftotext.exe"
        if (Test-Path $pdftotext) {
            $tempTxt = [System.IO.Path]::GetTempFileName()
            & $pdftotext -layout $InputFile $tempTxt

            # Convertir a Markdown básico
            $content = Get-Content $tempTxt -Raw -Encoding UTF8

            # Limpiar y formatear
            $mdContent = @"
# $fileName

> Documento convertido automáticamente desde PDF

---

$content
"@
            $mdContent | Out-File -FilePath $outputFile -Encoding UTF8
            Remove-Item $tempTxt -Force

            Write-Host "OK: PDF convertido" -ForegroundColor Green
        } else {
            Write-Error "pdftotext no encontrado"
            exit 1
        }
    }

    {$_ -in ".docx", ".doc"} {
        # Verificar si pandoc está disponible
        $pandoc = Get-Command pandoc -ErrorAction SilentlyContinue
        if ($pandoc) {
            & pandoc $InputFile -o $outputFile --wrap=none
            Write-Host "OK: Word convertido con pandoc" -ForegroundColor Green
        } else {
            # Alternativa: Usar Word COM si está disponible
            try {
                $word = New-Object -ComObject Word.Application
                $word.Visible = $false
                $doc = $word.Documents.Open($InputFile)

                # Extraer texto
                $text = $doc.Content.Text
                $doc.Close()
                $word.Quit()

                # Crear Markdown básico
                $mdContent = @"
# $fileName

> Documento convertido automáticamente desde Word

---

$text
"@
                $mdContent | Out-File -FilePath $outputFile -Encoding UTF8
                Write-Host "OK: Word convertido via COM" -ForegroundColor Green
            } catch {
                Write-Error "No se pudo convertir Word. Instalar pandoc: winget install pandoc"
                exit 1
            }
        }
    }

    default {
        Write-Error "Formato no soportado: $extension (solo .pdf, .docx, .doc)"
        exit 1
    }
}

Write-Host ""
Write-Host "Archivo generado: $outputFile" -ForegroundColor Green
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Yellow
Write-Host "  Ejecutar: /procesar-documento $outputFile" -ForegroundColor Yellow
