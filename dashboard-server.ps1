$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerConfig = Join-Path $Root "data\server.xml"

[xml]$ConfigXml = Get-Content -LiteralPath $ServerConfig -Raw
$Port = [int]$ConfigXml.server.port
$DefaultPage = [string]$ConfigXml.server.defaultPage

$MimeTypes = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "text/javascript; charset=utf-8"
  ".xml" = "application/xml; charset=utf-8"
  ".png" = "image/png"
  ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif" = "image/gif"
  ".webp" = "image/webp"
  ".svg" = "image/svg+xml"
  ".mp4" = "video/mp4"
  ".ico" = "image/x-icon"
}

function Get-ContentType {
  param([string]$Path)
  $Extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
  if ($MimeTypes.ContainsKey($Extension)) {
    return $MimeTypes[$Extension]
  }
  return "application/octet-stream"
}

function Resolve-DashboardPath {
  param([string]$RequestPath)

  $Path = [System.Uri]::UnescapeDataString($RequestPath)
  $Path = $Path -replace "\\", "/"
  $Path = $Path.TrimStart("/")

  if ($Path -eq "" -or $Path -eq "dashboard" -or $Path -eq "dashboard/") {
    $Path = $DefaultPage
  }

  if ($Path.StartsWith("dashboard/")) {
    $Path = $Path.Substring("dashboard/".Length)
    if ($Path -eq "") {
      $Path = $DefaultPage
    }
  }

  $FullPath = [System.IO.Path]::GetFullPath((Join-Path $Root $Path))
  $RootPath = [System.IO.Path]::GetFullPath($Root)

  if (-not $FullPath.StartsWith($RootPath, [System.StringComparison]::OrdinalIgnoreCase)) {
    return $null
  }

  if ([System.IO.Directory]::Exists($FullPath)) {
    $FullPath = Join-Path $FullPath $DefaultPage
  }

  return $FullPath
}

$Listener = $null
$StartedPort = $Port

for ($TryPort = $Port; $TryPort -le ($Port + 10); $TryPort++) {
  try {
    $Listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $TryPort)
    $Listener.Start()
    $StartedPort = $TryPort
    break
  }
  catch {
    if ($Listener -ne $null) {
      try { $Listener.Stop() } catch {}
    }
    $Listener = $null
  }
}

if ($Listener -eq $null) {
  Write-Host "Could not start the local dashboard server."
  Write-Host "Please restart the media player, then run START-DASHBOARD.bat again."
  Write-Host "If it still fails, change data\server.xml port to 8080."
  exit 1
}

Write-Host "Starting DS Global Corporate Center Dashboard..."
Write-Host ""
Write-Host "Dashboard running at http://127.0.0.1:$StartedPort/"
Write-Host "OpenKiosk URL: http://127.0.0.1:$StartedPort/"
Write-Host ""
Write-Host "Keep this window open. Press Ctrl+C to stop."

while ($true) {
  $Client = $Listener.AcceptTcpClient()

  try {
    $Stream = $Client.GetStream()
    $Reader = [System.IO.StreamReader]::new($Stream, [System.Text.Encoding]::ASCII, $false, 1024, $true)
    $RequestLine = $Reader.ReadLine()

    if ([string]::IsNullOrWhiteSpace($RequestLine)) {
      $Client.Close()
      continue
    }

    while ($true) {
      $HeaderLine = $Reader.ReadLine()
      if ([string]::IsNullOrEmpty($HeaderLine)) { break }
    }

    $Parts = $RequestLine.Split(" ")
    $RequestPath = if ($Parts.Length -ge 2) { $Parts[1].Split("?")[0] } else { "/" }
    $FilePath = Resolve-DashboardPath $RequestPath

    if ($null -eq $FilePath) {
      $Body = [System.Text.Encoding]::UTF8.GetBytes("Forbidden")
      $Header = "HTTP/1.1 403 Forbidden`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
      $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
      $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
      $Stream.Write($Body, 0, $Body.Length)
      $Client.Close()
      continue
    }

    if (-not [System.IO.File]::Exists($FilePath)) {
      $Body = [System.Text.Encoding]::UTF8.GetBytes("Not found")
      $Header = "HTTP/1.1 404 Not Found`r`nContent-Length: $($Body.Length)`r`nConnection: close`r`n`r`n"
      $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
      $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
      $Stream.Write($Body, 0, $Body.Length)
      $Client.Close()
      continue
    }

    $Bytes = [System.IO.File]::ReadAllBytes($FilePath)
    $ContentType = Get-ContentType $FilePath
    $Header = "HTTP/1.1 200 OK`r`nContent-Type: $ContentType`r`nContent-Length: $($Bytes.Length)`r`nCache-Control: no-store, no-cache, must-revalidate`r`nConnection: close`r`n`r`n"
    $HeaderBytes = [System.Text.Encoding]::ASCII.GetBytes($Header)
    $Stream.Write($HeaderBytes, 0, $HeaderBytes.Length)
    $Stream.Write($Bytes, 0, $Bytes.Length)
  }
  catch {
    Write-Host "Request error: $($_.Exception.Message)"
  }
  finally {
    $Client.Close()
  }
}
