param(
  [string]$Model = "gemma4:26b",
  [string]$OllamaHost = "http://127.0.0.1:11434",
  [string]$OutputDir = "reports/coverage",
  [string]$CoverageCommand = "npm run coverage",
  [double]$MinLinePercent = 100,
  [double]$MinBranchPercent = 100,
  [double]$MinFunctionPercent = 100,
  [int]$AiTimeoutSeconds = 420
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

function Invoke-CommandCapture {
  param(
    [string]$Command,
    [string]$Directory
  )

  Write-Host "Running coverage command in $Directory"
  $startedAt = Get-Date
  $previousCi = $env:CI
  $previousNoColor = $env:NO_COLOR
  $stdoutPath = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath "reposhow-coverage-$([guid]::NewGuid()).out"
  $stderrPath = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath "reposhow-coverage-$([guid]::NewGuid()).err"

  Push-Location -LiteralPath $Directory
  try {
    $env:CI = "true"
    $env:NO_COLOR = "1"
    $wrappedCommand = "$Command; if (`$null -eq `$LASTEXITCODE) { exit 0 } else { exit `$LASTEXITCODE }"
    $process = Start-Process `
      -FilePath "powershell" `
      -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-Command", $wrappedCommand) `
      -Wait `
      -PassThru `
      -NoNewWindow `
      -RedirectStandardOutput $stdoutPath `
      -RedirectStandardError $stderrPath

    $outputParts = @()
    if (Test-Path -LiteralPath $stdoutPath) {
      $outputParts += Get-Content -Raw -Encoding utf8 -LiteralPath $stdoutPath
    }

    if (Test-Path -LiteralPath $stderrPath) {
      $stderr = Get-Content -Raw -Encoding utf8 -LiteralPath $stderrPath
      if (-not [string]::IsNullOrWhiteSpace($stderr)) {
        $outputParts += $stderr
      }
    }

    $output = $outputParts -join "`n"
  } finally {
    if ($null -eq $previousCi) {
      Remove-Item Env:\CI -ErrorAction SilentlyContinue
    } else {
      $env:CI = $previousCi
    }

    if ($null -eq $previousNoColor) {
      Remove-Item Env:\NO_COLOR -ErrorAction SilentlyContinue
    } else {
      $env:NO_COLOR = $previousNoColor
    }

    Remove-Item -LiteralPath $stdoutPath, $stderrPath -ErrorAction SilentlyContinue
    Pop-Location
  }

  $finishedAt = Get-Date

  return [pscustomobject]@{
    command = $Command
    exitCode = $process.ExitCode
    startedAt = $startedAt.ToString("o")
    finishedAt = $finishedAt.ToString("o")
    durationSeconds = [Math]::Round(($finishedAt - $startedAt).TotalSeconds, 2)
    output = ([string]$output).Trim()
  }
}

function Parse-CoverageOutput {
  param([string]$Output)

  $summary = $null
  $files = @()
  $currentDirectory = ""

  foreach ($line in ($Output -split "`r?`n")) {
    if ($line -match "^#\s+all files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|") {
      $summary = [pscustomobject]@{
        linePercent = [double]$matches[1]
        branchPercent = [double]$matches[2]
        functionPercent = [double]$matches[3]
      }
      continue
    }

    if ($line -match "^#\s+([^\|]+?)\s+\|\s+\|\s+\|\s+\|") {
      $currentDirectory = $matches[1].Trim()
      continue
    }

    if ($line -match "^#\s+([^\|]+?)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s*(.*)$") {
      $fileName = $matches[1].Trim()
      if ($fileName -eq "all files") {
        continue
      }

      $relativePath = if ($currentDirectory) { Join-Path -Path $currentDirectory -ChildPath $fileName } else { $fileName }
      $files += [pscustomobject]@{
        path = $relativePath -replace "\\", "/"
        linePercent = [double]$matches[2]
        branchPercent = [double]$matches[3]
        functionPercent = [double]$matches[4]
        uncoveredLines = $matches[5].Trim()
      }
    }
  }

  return [pscustomobject]@{
    summary = $summary
    files = $files
  }
}

function Get-TextSnapshot {
  param(
    [string]$Root,
    [string[]]$Directories,
    [int]$MaxCharacters = 30000
  )

  $blocks = @()
  $usedCharacters = 0

  foreach ($directory in $Directories) {
    $path = Join-Path -Path $Root -ChildPath $directory
    if (-not (Test-Path -LiteralPath $path)) {
      continue
    }

    foreach ($file in (Get-ChildItem -LiteralPath $path -Recurse -File | Where-Object { $_.Extension -in @(".js", ".mjs", ".ts", ".tsx") } | Sort-Object FullName)) {
      $relativePath = Resolve-Path -LiteralPath $file.FullName -Relative
      $content = Get-Content -Raw -Encoding utf8 -LiteralPath $file.FullName
      $block = @"
--- $relativePath ---
$content
"@

      if (($usedCharacters + $block.Length) -gt $MaxCharacters) {
        $remaining = $MaxCharacters - $usedCharacters
        if ($remaining -gt 500) {
          $blocks += $block.Substring(0, $remaining)
        }

        return ($blocks -join "`n")
      }

      $blocks += $block
      $usedCharacters += $block.Length
    }
  }

  return ($blocks -join "`n")
}

function Invoke-OllamaReview {
  param(
    [string]$BaseUrl,
    [string]$ModelName,
    [string]$Prompt,
    [int]$TimeoutSeconds
  )

  $cleanPrompt = $Prompt -replace "[\x00-\x08\x0B\x0C\x0E-\x1F]", ""
  $body = @{
    model = $ModelName
    prompt = $cleanPrompt
    stream = $false
    options = @{
      temperature = 0.15
    }
  } | ConvertTo-Json -Depth 10 -Compress

  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
  $response = Invoke-RestMethod -Uri "$BaseUrl/api/generate" -Method Post -ContentType "application/json; charset=utf-8" -Body $bodyBytes -TimeoutSec $TimeoutSeconds
  return [string]$response.response
}

$root = (Resolve-Path -LiteralPath ".").Path
$baseUrl = Normalize-OllamaHost -Value $OllamaHost

& "$PSScriptRoot\ensure-ollama.ps1" -OllamaHost $baseUrl | Write-Host

$modelNames = @((Invoke-RestMethod -Uri "$baseUrl/api/tags" -TimeoutSec 10).models | ForEach-Object { $_.name })
if ($modelNames -notcontains $Model) {
  throw "Ollama model '$Model' was not found. Available models: $($modelNames -join ', ')"
}

$coverageRun = Invoke-CommandCapture -Command $CoverageCommand -Directory $root
$coverage = Parse-CoverageOutput -Output $coverageRun.output

if ($null -eq $coverage.summary) {
  throw "Coverage summary could not be parsed from command output."
}

$thresholds = [pscustomobject]@{
  linePercent = $MinLinePercent
  branchPercent = $MinBranchPercent
  functionPercent = $MinFunctionPercent
}

$passedThresholds =
  $coverageRun.exitCode -eq 0 -and
  $coverage.summary.linePercent -ge $MinLinePercent -and
  $coverage.summary.branchPercent -ge $MinBranchPercent -and
  $coverage.summary.functionPercent -ge $MinFunctionPercent

$context = if ($passedThresholds) {
  "Coverage thresholds are already passing. Source context omitted to keep the AI review fast."
} else {
  Get-TextSnapshot -Root $root -Directories @("src", "test") -MaxCharacters 12000
}

$reportForPrompt = [pscustomobject]@{
  command = $coverageRun.command
  exitCode = $coverageRun.exitCode
  thresholds = $thresholds
  passedThresholds = $passedThresholds
  summary = $coverage.summary
  files = $coverage.files
} | ConvertTo-Json -Depth 10

$prompt = @"
Tu es un reviewer coverage local pour RepoShow. Reponds court, en francais.

Rapport coverage JSON:
$reportForPrompt

Contexte:
$context

Format obligatoire:
1. Verdict coverage.
2. Seuils demandes / valeurs obtenues.
3. Lignes non couvertes.
4. Tests a ajouter si utile.
5. Commandes a relancer.
6. Decision Git. Ne recommande pas de push si le coverage echoue.
"@

$aiReview = Invoke-OllamaReview -BaseUrl $baseUrl -ModelName $Model -Prompt $prompt -TimeoutSeconds $AiTimeoutSeconds

$report = [pscustomobject]@{
  generatedAt = (Get-Date).ToString("o")
  model = $Model
  ollamaHost = $baseUrl
  success = $passedThresholds
  thresholds = $thresholds
  coverage = $coverage
  coverageRun = $coverageRun
  aiReview = $aiReview
}

$resolvedOutputDir = Join-Path -Path $root -ChildPath $OutputDir
New-Item -ItemType Directory -Force -Path $resolvedOutputDir | Out-Null

$jsonPath = Join-Path -Path $resolvedOutputDir -ChildPath "latest.json"
$markdownPath = Join-Path -Path $resolvedOutputDir -ChildPath "latest.md"

$report | ConvertTo-Json -Depth 16 | Set-Content -LiteralPath $jsonPath -Encoding utf8

$markdown = @()
$markdown += "# RepoShow AI Coverage Report"
$markdown += ""
$markdown += "- Generated at: $($report.generatedAt)"
$markdown += "- Ollama model: $Model"
$markdown += "- Command: $CoverageCommand"
$markdown += "- Success: $($report.success)"
$markdown += "- Thresholds: line $MinLinePercent%, branch $MinBranchPercent%, function $MinFunctionPercent%"
$markdown += "- Result: line $($coverage.summary.linePercent)%, branch $($coverage.summary.branchPercent)%, function $($coverage.summary.functionPercent)%"
$markdown += ""
$markdown += "## Files"

foreach ($file in $coverage.files) {
  $markdown += ""
  $markdown += ('- `{0}`: line {1}%, branch {2}%, function {3}%, uncovered `{4}`' -f $file.path, $file.linePercent, $file.branchPercent, $file.functionPercent, $file.uncoveredLines)
}

$markdown += ""
$markdown += "## Coverage Output"
$markdown += ""
$markdown += '```text'
$markdown += $coverageRun.output
$markdown += '```'
$markdown += ""
$markdown += "## Gemma Coverage Review"
$markdown += ""
$markdown += $aiReview.Trim()

$markdown -join "`n" | Set-Content -LiteralPath $markdownPath -Encoding utf8

Write-Host "AI coverage report written to $markdownPath"
Write-Host "AI coverage JSON written to $jsonPath"

if (-not $passedThresholds) {
  exit 1
}
