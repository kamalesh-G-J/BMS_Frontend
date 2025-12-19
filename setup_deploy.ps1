# BookMyShow Frontend - Quick Setup for Deployment

Write-Host "`n🎬 BookMyShow Frontend - Git Setup for Deployment" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
try {
    git --version | Out-Null
} catch {
    Write-Host "❌ Git is not installed!" -ForegroundColor Red
    Write-Host "Please install Git from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git is installed" -ForegroundColor Green
Write-Host ""

# Navigate to frontend-deploy folder
$frontendPath = "D:\System Design\BookMyShow\frontend-deploy"
if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Frontend folder not found at: $frontendPath" -ForegroundColor Red
    exit 1
}

Set-Location $frontendPath
Write-Host "📁 Working directory: $frontendPath" -ForegroundColor Cyan
Write-Host ""

# Initialize git repository
Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
if (Test-Path .git) {
    Write-Host "⚠️  Git repository already exists" -ForegroundColor Yellow
} else {
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
}
Write-Host ""

# Show backend URL
Write-Host "🔗 Backend URL: https://bms-backend1-1.onrender.com" -ForegroundColor Cyan
Write-Host "   (Already configured in src/api.js)" -ForegroundColor White
Write-Host ""

# Show files to be committed
Write-Host "📋 Files prepared for deployment:" -ForegroundColor Cyan
Write-Host "  ✓ src/App.js (Main React component)" -ForegroundColor Green
Write-Host "  ✓ src/index.js (Entry point)" -ForegroundColor Green
Write-Host "  ✓ src/index.css (Styling)" -ForegroundColor Green
Write-Host "  ✓ src/api.js (API client - Backend configured)" -ForegroundColor Green
Write-Host "  ✓ public/index.html (HTML template)" -ForegroundColor Green
Write-Host "  ✓ package.json (Dependencies)" -ForegroundColor Green
Write-Host "  ✓ vercel.json (Vercel config)" -ForegroundColor Green
Write-Host "  ✓ netlify.toml (Netlify config)" -ForegroundColor Green
Write-Host ""

# Stage files
Write-Host "📦 Staging files for commit..." -ForegroundColor Yellow
git add . 2>$null
Write-Host "✅ Files staged" -ForegroundColor Green
Write-Host ""

# Check git status
Write-Host "📊 Git Status:" -ForegroundColor Cyan
git status --short
Write-Host ""

# Commit
Write-Host "💾 Creating commit..." -ForegroundColor Yellow
git commit -m "BookMyShow Frontend - Connected to deployed backend"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  No changes to commit or commit failed" -ForegroundColor Yellow
    Write-Host "   This might be okay if files are already committed" -ForegroundColor White
}
Write-Host ""

# Prompt for GitHub username
Write-Host "🔗 GitHub Setup" -ForegroundColor Cyan
Write-Host "===============" -ForegroundColor Cyan
$username = Read-Host "Enter your GitHub username"

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "❌ Username cannot be empty!" -ForegroundColor Red
    exit 1
}

$repoName = "bookmyshow-frontend"
$repoUrl = "https://github.com/$username/$repoName.git"

Write-Host ""
Write-Host "📝 Repository Details:" -ForegroundColor Yellow
Write-Host "  Username: $username" -ForegroundColor White
Write-Host "  Repository: $repoName" -ForegroundColor White
Write-Host "  URL: $repoUrl" -ForegroundColor Cyan
Write-Host ""

# Ask if repo exists
Write-Host "❓ Does the repository '$repoName' already exist on GitHub?" -ForegroundColor Yellow
Write-Host "   1. No, I need to create it first" -ForegroundColor White
Write-Host "   2. Yes, it exists (I'll push to it)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "1") {
    Write-Host ""
    Write-Host "📝 Create Repository First:" -ForegroundColor Yellow
    Write-Host "   1. Go to: https://github.com/new" -ForegroundColor Cyan
    Write-Host "   2. Repository name: $repoName" -ForegroundColor Cyan
    Write-Host "   3. Keep it Public or Private" -ForegroundColor White
    Write-Host "   4. DO NOT initialize with README" -ForegroundColor Red
    Write-Host "   5. Click 'Create repository'" -ForegroundColor White
    Write-Host ""
    Write-Host "After creating the repository, press Enter to continue..." -ForegroundColor Yellow
    $null = Read-Host
}

Write-Host ""
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""

# Set branch to main
git branch -M main

# Remove existing remote if present
git remote remove origin 2>&1 | Out-Null

# Add remote
git remote add origin $repoUrl

# Push
Write-Host "⬆️  Pushing to GitHub..." -ForegroundColor White
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 Your frontend repository is ready!" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📍 Repository URL: https://github.com/$username/$repoName" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🚀 Next: Deploy to Vercel" -ForegroundColor Yellow
    Write-Host "=========================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option A: Deploy to Vercel (Recommended)" -ForegroundColor Cyan
    Write-Host "  1. Go to: https://vercel.com/new" -ForegroundColor White
    Write-Host "  2. Import repository: $username/$repoName" -ForegroundColor Cyan
    Write-Host "  3. Framework: Create React App (auto-detected)" -ForegroundColor White
    Write-Host "  4. No environment variables needed" -ForegroundColor Green
    Write-Host "  5. Click 'Deploy'" -ForegroundColor White
    Write-Host "  6. Wait 2-3 minutes ☕" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Option B: Deploy to Netlify" -ForegroundColor Cyan
    Write-Host "  1. Go to: https://app.netlify.com/start" -ForegroundColor White
    Write-Host "  2. Import repository: $username/$repoName" -ForegroundColor Cyan
    Write-Host "  3. Build command: npm run build" -ForegroundColor White
    Write-Host "  4. Publish directory: build" -ForegroundColor White
    Write-Host "  5. Click 'Deploy site'" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 Your app will be live at:" -ForegroundColor Green
    Write-Host "   Vercel: https://your-project.vercel.app" -ForegroundColor White
    Write-Host "   Netlify: https://your-site.netlify.app" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 Test Backend Connection:" -ForegroundColor Cyan
    Write-Host "   https://bms-backend1-1.onrender.com/api/cities" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 For detailed instructions, see: README.md" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Failed to push to GitHub" -ForegroundColor Red
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "1. Repository doesn't exist - create it at: https://github.com/new" -ForegroundColor White
    Write-Host "2. Wrong username - check your GitHub username" -ForegroundColor White
    Write-Host "3. Authentication failed - you may need to set up Git credentials" -ForegroundColor White
    Write-Host ""
    Write-Host "Manual push command:" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor White
    Write-Host ""
}

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
