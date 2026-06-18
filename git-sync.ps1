<# 
  EventSphere — Git Commit & Push Script
  ========================================
  One-click workflow to stage, commit, and push all changes to GitHub.
  
  Usage:
    .\git-sync.ps1                          # Auto-generates commit message
    .\git-sync.ps1 "Your commit message"    # Custom commit message
    .\git-sync.ps1 -Pull                    # Pull remote changes first, then push
#>

param(
    [string]$Message = "",
    [switch]$Pull
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

Push-Location $RepoRoot

function Write-Step($icon, $text) {
    Write-Host "`n$icon " -ForegroundColor Cyan -NoNewline
    Write-Host $text -ForegroundColor White
}

function Write-Success($text) {
    Write-Host "  ✅ $text" -ForegroundColor Green
}

function Write-Warn($text) {
    Write-Host "  ⚠️  $text" -ForegroundColor Yellow
}

function Write-Err($text) {
    Write-Host "  ❌ $text" -ForegroundColor Red
}

try {
    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "  EventSphere — Git Sync" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta

    # ── Step 1: Verify git is available ──
    Write-Step "🔍" "Checking git installation..."
    $gitVersion = git --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Git is not installed or not in PATH."
        exit 1
    }
    Write-Success "Git found: $gitVersion"

    # ── Step 2: Check remote is configured ──
    Write-Step "🌐" "Checking remote repository..."
    $remotes = git remote -v 2>&1
    if (-not $remotes -or $remotes -notmatch "origin") {
        Write-Err "No remote 'origin' configured. Run: git remote add origin <YOUR_GITHUB_URL>"
        exit 1
    }
    $originUrl = (git remote get-url origin 2>&1)
    Write-Success "Remote origin: $originUrl"

    # ── Step 3: Check authentication ──
    Write-Step "🔑" "Verifying GitHub authentication..."
    try {
        git ls-remote --exit-code origin HEAD 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { throw "Auth check failed" }
        Write-Success "Authentication verified — remote is reachable."
    } catch {
        Write-Err "Cannot reach remote. Check your credentials."
        Write-Host "    Try: gh auth login  OR  git credential-manager configure" -ForegroundColor DarkGray
        exit 1
    }

    # ── Step 4: Get current branch ──
    $branch = git branch --show-current 2>&1
    Write-Step "🌿" "Current branch: $branch"

    # ── Step 5: Pull remote changes (if requested or if behind) ──
    if ($Pull) {
        Write-Step "⬇️" "Pulling latest changes from origin/$branch..."
        try {
            git pull --rebase origin $branch 2>&1
            if ($LASTEXITCODE -ne 0) { throw "Pull failed" }
            Write-Success "Pull complete."
        } catch {
            Write-Err "Pull failed — you may have merge conflicts."
            Write-Host "    Fix conflicts, then run: git rebase --continue" -ForegroundColor DarkGray
            exit 1
        }
    }

    # ── Step 6: Check for changes ──
    Write-Step "📋" "Checking for changes..."
    $status = git status --porcelain 2>&1
    if (-not $status) {
        Write-Warn "No changes to commit. Working tree is clean."
        Pop-Location
        exit 0
    }

    $changeCount = ($status | Measure-Object).Count
    Write-Success "Found $changeCount changed file(s)."

    # Show summary
    Write-Host "`n  Changed files:" -ForegroundColor DarkGray
    $status | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }

    # ── Step 7: Stage all changes ──
    Write-Step "📦" "Staging all changes..."
    git add -A 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Failed to stage changes."
        exit 1
    }
    Write-Success "All changes staged."

    # ── Step 8: Generate commit message ──
    if (-not $Message) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $modifiedFiles = ($status | ForEach-Object { ($_ -replace '^\s*\S+\s+', '') | Split-Path -Leaf }) -join ", "
        if ($modifiedFiles.Length -gt 80) {
            $modifiedFiles = $modifiedFiles.Substring(0, 77) + "..."
        }
        $Message = "chore: update $changeCount file(s) — $modifiedFiles [$timestamp]"
    }

    Write-Step "💾" "Committing..."
    Write-Host "    Message: $Message" -ForegroundColor DarkGray
    git commit -m $Message 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Err "Commit failed."
        exit 1
    }
    Write-Success "Commit created."

    # ── Step 9: Push to remote ──
    Write-Step "🚀" "Pushing to origin/$branch..."
    try {
        $pushOutput = git push origin $branch 2>&1
        if ($LASTEXITCODE -ne 0) {
            # Check if we need to pull first
            if ($pushOutput -match "rejected" -or $pushOutput -match "non-fast-forward") {
                Write-Warn "Push rejected — remote has newer changes."
                Write-Host "    Attempting pull --rebase and retry..." -ForegroundColor DarkGray
                git pull --rebase origin $branch 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Err "Rebase failed — merge conflicts detected."
                    Write-Host "    Fix conflicts, run: git rebase --continue" -ForegroundColor DarkGray
                    Write-Host "    Then run this script again." -ForegroundColor DarkGray
                    exit 1
                }
                git push origin $branch 2>&1
                if ($LASTEXITCODE -ne 0) {
                    Write-Err "Push still failed after rebase."
                    exit 1
                }
            } else {
                throw "Push failed: $pushOutput"
            }
        }
        Write-Success "Push successful!"
    } catch {
        Write-Err "Push failed: $_"
        exit 1
    }

    # ── Step 10: Verify ──
    Write-Step "✅" "Verifying push..."
    $lastCommit = git log --oneline -1 2>&1
    Write-Success "Latest commit: $lastCommit"
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  🎉 All changes synced to GitHub!" -ForegroundColor Green
    Write-Host "  📎 $originUrl" -ForegroundColor DarkGray
    Write-Host "========================================`n" -ForegroundColor Green

} catch {
    Write-Err "Unexpected error: $_"
    exit 1
} finally {
    Pop-Location
}
