Add-Type -AssemblyName System.Web
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8333/")
$listener.Start()
Write-Host "Server listening on http://localhost:8333/"
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $requestUrl = $context.Request.Url.LocalPath
    if ($requestUrl -eq "/") { $requestUrl = "/工地管理.html" }
    
    $requestUrl = [System.Web.HttpUtility]::UrlDecode($requestUrl)
    $filePath = Join-Path (Get-Location) $requestUrl
    
    if ((Test-Path $filePath) -and (!(Get-Item $filePath -ErrorAction SilentlyContinue).PSIsContainer)) {
        $content = [System.IO.File]::ReadAllBytes($filePath)
        $context.Response.ContentLength64 = $content.Length
        if ($filePath -match "\.html$") {
            $context.Response.ContentType = "text/html; charset=utf-8"
        } elseif ($filePath -match "\.json$") {
            $context.Response.ContentType = "application/json; charset=utf-8"
        }
        $context.Response.OutputStream.Write($content, 0, $content.Length)
    } else {
        $context.Response.StatusCode = 404
    }
    $context.Response.OutputStream.Close()
}
