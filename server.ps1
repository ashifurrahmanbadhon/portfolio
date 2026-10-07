$port = 3000
$prefix = "http://localhost:$port/"
$folder = $PSScriptRoot

if (-not $folder) {
    $folder = (Get-Location).Path
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host "  Portfolio Web Server is running at: $prefix" -ForegroundColor Cyan
    Write-Host "  Serving files from: $folder" -ForegroundColor Yellow
    Write-Host "  Press Ctrl+C to stop the server." -ForegroundColor Gray
    Write-Host "==========================================================" -ForegroundColor Green
    
    # Auto-open browser
    Start-Process $prefix

    while ($listener.IsListening) {
        try {
            $context = $listener.GetContext()
            $request = $context.Request
            $response = $context.Response

            $rawUrl = $request.Url.LocalPath
            if ($rawUrl -eq "/" -or [string]::IsNullOrWhiteSpace($rawUrl)) {
                $filePath = Join-Path $folder "index.html"
            } else {
                $relPath = [System.Uri]::UnescapeDataString($rawUrl.TrimStart("/")).Replace("/", [System.IO.Path]::DirectorySeparatorChar)
                $filePath = Join-Path $folder $relPath
            }

            if (Test-Path $filePath -PathType Leaf) {
                $bytes = [System.IO.File]::ReadAllBytes($filePath)
                $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
                
                $mime = switch ($ext) {
                    ".html" { "text/html; charset=utf-8" }
                    ".htm"  { "text/html; charset=utf-8" }
                    ".css"  { "text/css; charset=utf-8" }
                    ".js"   { "application/javascript; charset=utf-8" }
                    ".jsx"  { "text/plain; charset=utf-8" }
                    ".json" { "application/json; charset=utf-8" }
                    ".png"  { "image/png" }
                    ".jpg"  { "image/jpeg" }
                    ".jpeg" { "image/jpeg" }
                    ".svg"  { "image/svg+xml" }
                    ".pdf"  { "application/pdf" }
                    default { "application/octet-stream" }
                }

                $response.ContentType = $mime
                $response.ContentLength64 = $bytes.Length
                $response.StatusCode = 200

                if ($ext -eq ".pdf") {
                    if ($request.Url.Query -like "*view*") {
                        $response.ContentType = "application/pdf"
                        $response.AddHeader("Content-Disposition", "inline; filename=`"Ashifur_Rahman_Resume.pdf`"")
                    } else {
                        $response.ContentType = "application/octet-stream"
                        $response.AddHeader("Content-Disposition", "attachment; filename=`"Ashifur_Rahman_Resume.pdf`"")
                    }
                }

                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($bytes, 0, $bytes.Length)
                }
            } else {
                $notFound = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
                $response.StatusCode = 404
                $response.ContentType = "text/plain; charset=utf-8"
                $response.ContentLength64 = $notFound.Length
                if ($request.HttpMethod -ne "HEAD") {
                    $response.OutputStream.Write($notFound, 0, $notFound.Length)
                }
            }

            $response.OutputStream.Close()
        } catch {
            Write-Host "Request warning: $_" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "Server Error: $_" -ForegroundColor Red
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
