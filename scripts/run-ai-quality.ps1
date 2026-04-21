param(
  [string]$Model = "gemma4:26b",
  [string]$OllamaHost = "http://127.0.0.1:11434",
  [string]$OutputDir = "reports/quality",
  [switch]$IncludeClonedRepos,
  [string]$ClonedReposPath = "repo"
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

function Invoke-QualityCommand {
  param(
    [string]$Name,
    [string]$Command,
    [string]$Directory
  )

  Write-Host "Running $Name in $Directory"
  $startedAt = Get-Date
  $previousCi = $env:CI
  $previousNoColor = $env:NO_COLOR
  $stdoutPath = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath "reposhow-quality-$([guid]::NewGuid()).out"
  $stderrPath = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath "reposhow-quality-$([guid]::NewGuid()).err"

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
    $exitCode = $process.ExitCode
    $outputParts = @()

    if (Test-Path -LiteralPath $stdoutPath) {
      $outputParts += (Get-Content -Raw -Encoding utf8 -LiteralPath $stdoutPath)
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
    name = $Name
    command = $Command
    directory = $Directory
    exitCode = $exitCode
    startedAt = $startedAt.ToString("o")
    finishedAt = $finishedAt.ToString("o")
    durationSeconds = [Math]::Round(($finishedAt - $startedAt).TotalSeconds, 2)
    output = ([string]$output).Trim()
  }
}

function Get-NodeCommands {
  param(
    [string]$Directory,
    [bool]$IsRoot
  )

  $packagePath = Join-Path -Path $Directory -ChildPath "package.json"
  if (-not (Test-Path -LiteralPath $packagePath)) {
    return @()
  }

  $package = Get-Content -Raw -LiteralPath $packagePath | ConvertFrom-Json
  $scriptNames = @()

  if ($package.PSObject.Properties.Name -contains "scripts") {
    $scriptNames = @($package.scripts.PSObject.Properties.Name)
  }

  $commands = @()

  if ($IsRoot -and ($scriptNames -contains "validate")) {
    $commands += [pscustomobject]@{ name = "manifest validation"; command = "npm run validate" }
  }

  if ($scriptNames -contains "test") {
    $commands += [pscustomobject]@{ name = "unit tests"; command = "npm run test" }
  }

  if ($scriptNames -contains "coverage") {
    $commands += [pscustomobject]@{ name = "coverage"; command = "npm run coverage" }
  } elseif ($scriptNames -contains "test:coverage") {
    $commands += [pscustomobject]@{ name = "coverage"; command = "npm run test:coverage" }
  }

  return $commands
}

function Get-Targets {
  param(
    [string]$Root,
    [switch]$WithClonedRepos,
    [string]$ReposPath
  )

  $targets = @(
    [pscustomobject]@{
      name = "RepoShow"
      path = $Root
      isRoot = $true
    }
  )

  if (-not $WithClonedRepos) {
    return $targets
  }

  $resolvedReposPath = Join-Path -Path $Root -ChildPath $ReposPath
  if (-not (Test-Path -LiteralPath $resolvedReposPath)) {
    return $targets
  }

  foreach ($directory in (Get-ChildItem -LiteralPath $resolvedReposPath -Directory | Sort-Object Name)) {
    $gitPath = Join-Path -Path $directory.FullName -ChildPath ".git"
    if (Test-Path -LiteralPath $gitPath) {
      $targets += [pscustomobject]@{
        name = $directory.Name
        path = $directory.FullName
        isRoot = $false
      }
    }
  }

  return $targets
}

function ConvertTo-ShortOutput {
  param(
    [string]$Text,
    [int]$MaxLines = 80
  )

  if ([string]::IsNullOrWhiteSpace($Text)) {
    return ""
  }

  $lines = $Text -split "`r?`n"
  if ($lines.Count -le $MaxLines) {
    return $Text
  }

  $head = $lines | Select-Object -First ([Math]::Floor($MaxLines / 2))
  $tail = $lines | Select-Object -Last ([Math]::Ceiling($MaxLines / 2))
  return (($head + "... output truncated ..." + $tail) -join "`n")
}

function Invoke-OllamaReview {
  param(
    [string]$BaseUrl,
    [string]$ModelName,
    [string]$Prompt
  )

  $cleanPrompt = $Prompt -replace "[\x00-\x08\x0B\x0C\x0E-\x1F]", ""
  $body = @{
    model = $ModelName
    prompt = $cleanPrompt
    stream = $false
    options = @{
      temperature = 0.2
    }
  } | ConvertTo-Json -Depth 10 -Compress

  $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($body)
  $response = Invoke-RestMethod -Uri "$BaseUrl/api/generate" -Method Post -ContentType "application/json; charset=utf-8" -Body $bodyBytes -TimeoutSec 900
  return [string]$response.response
}

$root = (Resolve-Path -LiteralPath ".").Path
$baseUrl = Normalize-OllamaHost -Value $OllamaHost

& "$PSScriptRoot\ensure-ollama.ps1" -OllamaHost $baseUrl | Write-Host

$modelNames = @((Invoke-RestMethod -Uri "$baseUrl/api/tags" -TimeoutSec 10).models | ForEach-Object { $_.name })
if ($modelNames -notcontains $Model) {
  throw "Ollama model '$Model' was not found. Available models: $($modelNames -join ', ')"
}

$targets = Get-Targets -Root $root -WithClonedRepos:$IncludeClonedRepos -ReposPath $ClonedReposPath
$results = @()

foreach ($target in $targets) {
  $commands = Get-NodeCommands -Directory $target.path -IsRoot ([bool]$target.isRoot)

  if ($target.isRoot -and (Test-Path -LiteralPath (Join-Path -Path $target.path -ChildPath "openspec"))) {
    $commands += [pscustomobject]@{ name = "openspec validation"; command = "npx @fission-ai/openspec@latest validate --all" }
  }

  if ($commands.Count -eq 0) {
    $results += [pscustomobject]@{
      target = $target.name
      path = $target.path
      skipped = $true
      reason = "No supported test or coverage command was detected."
      commands = @()
    }

    continue
  }

  $commandResults = @()
  foreach ($command in $commands) {
    $commandResults += Invoke-QualityCommand -Name $command.name -Command $command.command -Directory $target.path
  }

  $results += [pscustomobject]@{
    target = $target.name
    path = $target.path
    skipped = $false
    commands = $commandResults
  }
}

$failedCommands = @(
  $results |
    Where-Object { -not $_.skipped } |
    ForEach-Object { $_.commands | Where-Object { $_.exitCode -ne 0 } }
)

$report = [pscustomobject]@{
  generatedAt = (Get-Date).ToString("o")
  model = $Model
  ollamaHost = $baseUrl
  includeClonedRepos = [bool]$IncludeClonedRepos
  success = ($failedCommands.Count -eq 0)
  failedCommandCount = $failedCommands.Count
  results = $results
}

$reportJsonForPrompt = $report | ConvertTo-Json -Depth 12
$prompt = @"
Tu es un assistant local de qualite logicielle pour RepoShow.

Objectif: pousser les tests au sens renforcer la couverture, sans inventer de resultats.

A partir du rapport ci-dessous, reponds en francais avec:
1. Verdict court.
2. Tests ou suites qui passent.
3. Echecs ou manques de coverage.
4. Tests a ajouter en priorite.
5. Commandes exactes a relancer.
6. Recommendation Git: indique si un commit/push est raisonnable, mais ne demande jamais de push automatique si des tests echouent.

Rapport JSON:
$reportJsonForPrompt
"@

$aiReview = Invoke-OllamaReview -BaseUrl $baseUrl -ModelName $Model -Prompt $prompt
$report | Add-Member -NotePropertyName aiReview -NotePropertyValue $aiReview

$resolvedOutputDir = Join-Path -Path $root -ChildPath $OutputDir
New-Item -ItemType Directory -Force -Path $resolvedOutputDir | Out-Null

$jsonPath = Join-Path -Path $resolvedOutputDir -ChildPath "latest.json"
$markdownPath = Join-Path -Path $resolvedOutputDir -ChildPath "latest.md"

$report | ConvertTo-Json -Depth 16 | Set-Content -LiteralPath $jsonPath -Encoding utf8

$markdown = @()
$markdown += "# RepoShow Quality Report"
$markdown += ""
$markdown += "- Generated at: $($report.generatedAt)"
$markdown += "- Ollama model: $Model"
$markdown += "- Include cloned repos: $([bool]$IncludeClonedRepos)"
$markdown += "- Success: $($report.success)"
$markdown += "- Failed commands: $($report.failedCommandCount)"
$markdown += ""
$markdown += "## Commands"

foreach ($result in $results) {
  $markdown += ""
  $markdown += "### $($result.target)"

  if ($result.skipped) {
    $markdown += ""
    $markdown += "Skipped: $($result.reason)"
    continue
  }

  foreach ($command in $result.commands) {
    $markdown += ""
    $markdown += "#### $($command.name)"
    $markdown += ""
    $markdown += "- Command: ``$($command.command)``"
    $markdown += "- Exit code: $($command.exitCode)"
    $markdown += "- Duration: $($command.durationSeconds)s"
    $markdown += ""
    $markdown += '```text'
    $markdown += ConvertTo-ShortOutput -Text $command.output
    $markdown += '```'
  }
}

$markdown += ""
$markdown += "## Gemma Review"
$markdown += ""
$markdown += $aiReview.Trim()

$markdown -join "`n" | Set-Content -LiteralPath $markdownPath -Encoding utf8

Write-Host "Quality report written to $markdownPath"
Write-Host "Quality JSON written to $jsonPath"

if ($failedCommands.Count -ne 0) {
  exit 1
}
