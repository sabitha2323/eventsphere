# EventSphere - Git Commit & Push Script
# ========================================
# One-click workflow to stage, commit, and push all changes to GitHub.

param(
    [string]$Message = "",
    [switch]$Pull
)

$ErrorActionPreference = "Stop"
$RepoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Push-Location $RepoRoot

function Write-Step($icon, $text) {
    Write-Host "`n[$icon] " -ForegroundColor Cyan -NoNewline
    Write-Host $text -ForegroundColor White
}

function Write-Success($text) {
    Write-Host "  [OK] $text" -ForegroundColor Green
}

function Write-Warn($text) {
    Write-Host "  [WARN] $text" -ForegroundColor Yellow
}

function Write-Err($text) {
    Write-Host "  [ERROR] $text" -ForegroundColor Red
}

try {
    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "  EventSphere - Git Sync" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta

    # 1. Check Git
    Write-Step "CHECK" "Checking git installation..."
    $gitVersion = git --version
    Write-Success "Git found: $gitVersion"

    # 2. Check Remote
    Write-Step "REMOTE" "Checking remote repository..."
    $remotes = git remote -v
    if (-not $remotes) {
        Write-Err "No remote configured."
        Pop-Location
        exit 1
    }
    $originUrl = git remote get-url origin
    Write-Success "Remote origin: $originUrl"

    # 3. Check Current Branch
    $branch = git branch --show-current
    Write-Step "BRANCH" "Current branch: $branch"

    # 4. Check for changes
    Write-Step "STATUS" "Checking local changes..."
    $status = git status --porcelain
    if (-not $status) {
        Write-Warn "No changes to commit. Working tree is clean."
        
        # If no changes, try to push anyway (just in case there are unpushed commits)
        Write-Step "PUSH" "Checking for unpushed commits..."
        git push origin $branch
        Write-Success "Push checked."
        Pop-Location
        exit 0
    }

    $changeCount = ($status | Measure-Object).Count
    Write-Success "Found $changeCount changed file(s)."

    # 5. Stage all changes
    Write-Step "STAGE" "Staging all changes..."
    git add -A
    Write-Success "All changes staged."

    # 6. Generate commit message if not provided
    if (-not $Message) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        $modifiedFiles = ($status | ForEach-Object { ($_ -replace '^\s*\S+\s+', '') | Split-Path -Leaf }) -join ", "
        if ($modifiedFiles.Length -gt 80) {
            $modifiedFiles = $modifiedFiles.Substring(0, 77) + "..."
        }
        $Message = "chore: update $changeCount file(s) - $modifiedFiles [$timestamp]"
    }

    # 7. Commit
    Write-Step "COMMIT" "Committing..."
    Write-Host "    Message: $Message" -ForegroundColor DarkGray
    git commit -m $Message
    Write-Success "Commit created."

    # 8. Pull if requested
    if ($Pull) {
        Write-Step "PULL" "Pulling latest changes from origin/$branch..."
        git pull --rebase origin $branch
        Write-Success "Pull complete."
    }

    # 9. Push to remote
    Write-Step "PUSH" "Pushing to origin/$branch..."
    git push origin $branch
    Write-Success "Push successful!"

    # 10. Verify
    Write-Step "VERIFY" "Verifying push..."
    $lastCommit = git log --oneline -1
    Write-Success "Latest commit: $lastCommit"
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  All changes synced to GitHub!" -ForegroundColor Green
    Write-Host "  URL: $originUrl" -ForegroundColor DarkGray
    Write-Host "========================================`n" -ForegroundColor Green

} catch {
    Write-Err "An error occurred during synchronization: $_"
    Write-Warn "If push failed due to remote changes, run: .\git-sync.ps1 -Pull"
    Write-Warn "If you have merge conflicts, resolve them in your editor first."
    Pop-Location
    exit 1
} finally {
    Pop-Location
}
