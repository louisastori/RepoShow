param(
  [string]$Owner = "louisastori",
  [string]$Destination = "repo"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$destinationPath = Resolve-Path -LiteralPath . -ErrorAction SilentlyContinue
if (-not $destinationPath) {
  throw "Current directory cannot be resolved."
}

$targetRoot = Join-Path -Path $destinationPath.Path -ChildPath $Destination
New-Item -ItemType Directory -Force -Path $targetRoot | Out-Null

$repositories = @()
$source = "GitHub API"
$hasGitHubCli = $false

try {
  Get-Command gh -ErrorAction Stop | Out-Null
  $hasGitHubCli = $true
} catch {
  $hasGitHubCli = $false
}

if ($hasGitHubCli) {
  $ghOutput = gh repo list $Owner --limit 1000 --json name,nameWithOwner,url,isPrivate,isArchived,isFork
  if ($LASTEXITCODE -eq 0 -and $ghOutput) {
    $repositories = @()
    foreach ($repository in ($ghOutput | ConvertFrom-Json)) {
      $repositories += $repository
    }

    $source = "GitHub CLI"
  }
}

if ($repositories.Count -eq 0) {
  $headers = @{
    "User-Agent" = "RepoShow-sync"
    "Accept" = "application/vnd.github+json"
  }

  $page = 1

  while ($true) {
    $uri = "https://api.github.com/users/$Owner/repos?per_page=100&page=$page&sort=updated"
    $items = @(Invoke-RestMethod -Headers $headers -Uri $uri)

    if ($items.Count -eq 0) {
      break
    }

    $repositories += $items
    $page += 1
  }
}

if ($repositories.Count -eq 0) {
  Write-Host "No public repositories found for $Owner."
  exit 0
}

Write-Host "Using $source. Found $($repositories.Count) repositories for $Owner."

foreach ($repository in ($repositories | Sort-Object name)) {
  $name = [string]$repository.name
  $repoPath = Join-Path -Path $targetRoot -ChildPath $name
  $gitPath = Join-Path -Path $repoPath -ChildPath ".git"

  if (Test-Path -LiteralPath $gitPath) {
    Write-Host "Fetching $name"
    git -C $repoPath fetch --all --prune
    if ($LASTEXITCODE -ne 0) {
      throw "git fetch failed for $name"
    }

    $statusLine = git -C $repoPath status --porcelain=v1 -b | Select-Object -First 1
    if ($statusLine -like "## No commits yet*") {
      $remoteBranches = @(
        git -C $repoPath branch -r |
          ForEach-Object { $_.Trim() } |
          Where-Object { $_ -and ($_ -notmatch "->") }
      )

      if ($remoteBranches.Count -eq 0) {
        Write-Host "Skipping pull for $name because it has no commits yet."
        continue
      }

      $branch = $remoteBranches[0] -replace "^origin/", ""
      git -C $repoPath checkout -B $branch "origin/$branch"
      if ($LASTEXITCODE -ne 0) {
        throw "git checkout failed for $name"
      }
    }

    Write-Host "Pulling $name"
    git -C $repoPath pull --ff-only
    if ($LASTEXITCODE -ne 0) {
      throw "git pull failed for $name"
    }

    continue
  }

  if (Test-Path -LiteralPath $repoPath) {
    Write-Warning "Skipping $name because $repoPath exists but is not a Git repository."
    continue
  }

  Write-Host "Cloning $name"
  if ($source -eq "GitHub CLI") {
    $nameWithOwner = [string]$repository.nameWithOwner
    gh repo clone $nameWithOwner $repoPath
  } else {
    $cloneUrl = [string]$repository.clone_url
    git clone $cloneUrl $repoPath
  }

  if ($LASTEXITCODE -ne 0) {
    throw "git clone failed for $name"
  }
}

Write-Host "Synced $($repositories.Count) repositories into $Destination/."
