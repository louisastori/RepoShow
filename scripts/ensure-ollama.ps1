param(
  [string]$OllamaHost = "http://127.0.0.1:11434",
  [int]$TimeoutSeconds = 45
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Normalize-OllamaHost {
  param([string]$Value)

  if ($Value -notmatch "^https?://") {
    return "http://$Value"
  }

  return $Value.TrimEnd("/")
}

function Test-OllamaApi {
  param([string]$BaseUrl)

  try {
    Invoke-RestMethod -Uri "$BaseUrl/api/tags" -TimeoutSec 2 | Out-Null
    return $true
  } catch {
    return $false
  }
}

$baseUrl = Normalize-OllamaHost -Value $OllamaHost

if (Test-OllamaApi -BaseUrl $baseUrl) {
  Write-Host "Ollama is already running at $baseUrl."
  exit 0
}

$ollama = Get-Command ollama -ErrorAction Stop
Write-Host "Starting Ollama at $baseUrl."
Start-Process -FilePath $ollama.Source -ArgumentList "serve" -WindowStyle Hidden

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while ((Get-Date) -lt $deadline) {
  if (Test-OllamaApi -BaseUrl $baseUrl) {
    Write-Host "Ollama is ready at $baseUrl."
    exit 0
  }

  Start-Sleep -Seconds 1
}

throw "Ollama did not become ready after $TimeoutSeconds seconds."
