$path = (Get-Location).Path
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:8080/")
$listener.Start()
Write-Host "Server listening on http://127.0.0.1:8080/"
while ($listener.IsListening) {
    $context = $listener.GetContext()
    $req = $context.Request.Url.LocalPath
    if ($req -eq "/") { $req = "/工地管理.html" }
    
    $req = [System.Uri]::UnescapeDataString($req)
    $fullPath = $path + $req.Replace("/", "\")
    
    if (Test-Path $fullPath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        $context.Response.ContentLength64 = $bytes.Length
        if ($fullPath -match "\.html$") { $context.Response.ContentType = "text/html; charset=utf-8" }
        if ($fullPath -match "\.json$") { $context.Response.ContentType = "application/json; charset=utf-8" }
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $context.Response.StatusCode = 404
    }
    $context.Response.OutputStream.Close()
}
