# Vercel CI/CD 自动化配置脚本 (PowerShell)
# 运行此脚本前请确保:
# 1. 已安装 vercel CLI (npm i -g vercel)
# 2. 已登录 vercel (vercel login)
# 3. 已安装 gh CLI

Write-Host "`n🚀 开始配置 CI/CD..." -ForegroundColor Cyan

# 1. 检查登录状态
Write-Host "`n📝 检查 Vercel 登录状态..." -ForegroundColor Yellow
try {
    $tokenOutput = vercel tokens ls 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 未登录 Vercel,请先运行: vercel login" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Vercel 已登录" -ForegroundColor Green
} catch {
    Write-Host "❌ 检查失败: $_" -ForegroundColor Red
    exit 1
}

# 2. 链接 Vercel 项目
Write-Host "`n🔗 链接 Vercel 项目..." -ForegroundColor Yellow
vercel link --yes --scope personal --project-name image-compressor-web

if (Test-Path ".vercel/project.json") {
    $projectJson = Get-Content ".vercel/project.json" | ConvertFrom-Json
    $VERCEL_PROJECT_ID = $projectJson.projectId
    $VERCEL_ORG_ID = $projectJson.orgId
    
    Write-Host "✅ 项目链接成功" -ForegroundColor Green
    Write-Host "   Project ID: $VERCEL_PROJECT_ID" -ForegroundColor Gray
    Write-Host "   Org ID: $VERCEL_ORG_ID" -ForegroundColor Gray
} else {
    Write-Host "❌ 项目链接失败" -ForegroundColor Red
    exit 1
}

# 3. 获取 Token
Write-Host "`n🔑 获取 Vercel Token..." -ForegroundColor Yellow
$tokens = vercel tokens ls --output json | ConvertFrom-Json
$VERCEL_TOKEN = $tokens[0].token

if (-not $VERCEL_TOKEN) {
    Write-Host "❌ 未找到 Token" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Token 获取成功" -ForegroundColor Green

# 4. 设置 GitHub Secrets
Write-Host "`n🔐 设置 GitHub Secrets..." -ForegroundColor Yellow

$env:VERCEL_TOKEN = $VERCEL_TOKEN
cmd /c "echo `$env:VERCEL_TOKEN | gh secret set VERCEL_TOKEN"
Write-Host "✅ VERCEL_TOKEN 已设置" -ForegroundColor Green

$env:VERCEL_ORG_ID = $VERCEL_ORG_ID
cmd /c "echo `$env:VERCEL_ORG_ID | gh secret set VERCEL_ORG_ID"
Write-Host "✅ VERCEL_ORG_ID 已设置" -ForegroundColor Green

$env:VERCEL_PROJECT_ID = $VERCEL_PROJECT_ID
cmd /c "echo `$env:VERCEL_PROJECT_ID | gh secret set VERCEL_PROJECT_ID"
Write-Host "✅ VERCEL_PROJECT_ID 已设置" -ForegroundColor Green

Write-Host "`n✨ CI/CD 配置完成!" -ForegroundColor Green
Write-Host "`n📦 推送代码触发自动部署:" -ForegroundColor Cyan
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host "`n🌐 查看部署状态:" -ForegroundColor Cyan
Write-Host "   gh run list" -ForegroundColor Gray
