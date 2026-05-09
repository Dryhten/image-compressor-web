#!/bin/bash

# Vercel CI/CD 自动化配置脚本
# 运行此脚本前请确保:
# 1. 已安装 vercel CLI (npm i -g vercel)
# 2. 已登录 vercel (vercel login)
# 3. 已安装 gh CLI

echo "🚀 开始配置 CI/CD..."

# 1. 获取 Vercel Token
echo "\n📝 获取 Vercel Token..."
VERCEL_TOKEN=$(vercel tokens ls --output json | jq -r '.[0].token')

if [ -z "$VERCEL_TOKEN" ]; then
  echo "❌ 未找到 Vercel Token,请先运行: vercel login"
  exit 1
fi

echo "✅ Token 获取成功"

# 2. 链接或创建 Vercel 项目
echo "\n🔗 链接 Vercel 项目..."
vercel link --yes --scope personal --project-name image-compressor-web

# 读取项目 ID
if [ -f .vercel/project.json ]; then
  VERCEL_PROJECT_ID=$(jq -r '.projectId' .vercel/project.json)
  VERCEL_ORG_ID=$(jq -r '.orgId' .vercel/project.json)
  echo "✅ 项目链接成功"
  echo "   Project ID: $VERCEL_PROJECT_ID"
  echo "   Org ID: $VERCEL_ORG_ID"
else
  echo "❌ 项目链接失败"
  exit 1
fi

# 3. 设置 GitHub Secrets
echo "\n🔐 设置 GitHub Secrets..."

gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
echo "✅ VERCEL_TOKEN 已设置"

gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
echo "✅ VERCEL_ORG_ID 已设置"

gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"
echo "✅ VERCEL_PROJECT_ID 已设置"

echo "\n✨ CI/CD 配置完成!"
echo "\n📦 推送代码触发自动部署:"
echo "   git push origin main"
echo "\n🌐 或查看部署状态:"
echo "   gh run list"
