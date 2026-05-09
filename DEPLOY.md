# CI/CD 部署指南

## 概述

本项目使用 GitHub Actions 实现自动化 CI/CD 流程,自动构建并部署到 Vercel。

## CI/CD 流程

### Continuous Integration (CI)

每次 Push 或 Pull Request 到 main/master 分支时触发:

1. **代码检查** - TypeScript 类型检查
2. **构建项目** - 生成生产版本
3. **上传构建产物** - 保存 dist 目录作为 artifacts

### Continuous Deployment (CD)

仅在推送到 main/master 分支时触发:

1. **自动部署到 Vercel** - 生产环境部署
2. **生成部署预览** - 可访问的 URL

## 配置步骤

### 1. 创建 Vercel 项目

1. 登录 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的 GitHub 仓库
4. 配置构建设置:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2. 获取 Vercel Token

#### 方法一:通过 Vercel CLI

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 获取 Token
vercel tokens ls
```

#### 方法二:通过 Vercel 网站

1. 访问 https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 复制生成的 Token

### 3. 获取 Vercel Org ID 和 Project ID

```bash
# 进入项目目录
cd your-project

# 链接到 Vercel 项目
vercel link

# 查看项目信息
cat .vercel/project.json
```

会输出类似:
```json
{
  "orgId": "your_org_id",
  "projectId": "your_project_id"
}
```

### 4. 配置 GitHub Secrets

在你的 GitHub 仓库中:

1. 进入 **Settings** → **Secrets and variables** → **Actions**
2. 点击 **New repository secret**
3. 添加以下 secrets:

| Secret 名称 | 值 | 说明 |
|------------|-----|------|
| `VERCEL_TOKEN` | 你的 Vercel Token | 用于认证 Vercel API |
| `VERCEL_ORG_ID` | 你的 Org ID | Vercel 组织 ID |
| `VERCEL_PROJECT_ID` | 你的 Project ID | Vercel 项目 ID |

### 5. 触发首次部署

```bash
# 提交 CI/CD 配置
git add .github/workflows/ci-cd.yml vercel.json
git commit -m "ci: 添加 CI/CD 配置"
git push origin main
```

GitHub Actions 会自动:
1. 运行类型检查和构建
2. 部署到 Vercel 生产环境

## 工作流说明

### 触发条件

- **Push 到 main/master**: 触发 CI + CD(生产部署)
- **Pull Request**: 仅触发 CI(构建和测试)

### Jobs 说明

1. **build-and-deploy**
   - 使用 Ubuntu latest
   - Node.js 20
   - 包含缓存优化

### 步骤说明

1. **Checkout code** - 拉取代码
2. **Setup Node.js** - 配置 Node 环境
3. **Install dependencies** - 安装依赖(使用 ci 命令)
4. **Type check** - TypeScript 类型检查
5. **Build** - 构建生产版本
6. **Upload artifacts** - 上传构建产物(保留 7 天)
7. **Deploy to Vercel** - 生产部署(仅 main/master 分支)

## 故障排查

### 构建失败

1. 检查 GitHub Actions 日志
2. 本地运行 `npm run build` 确认可以正常构建
3. 确认 Node.js 版本兼容

### 部署失败

1. 检查 Vercel Token 是否有效
2. 确认 Org ID 和 Project ID 正确
3. 检查 Vercel 项目配置

### 查看部署状态

1. GitHub Actions: 仓库 → Actions → 选择工作流
2. Vercel: 登录 Vercel → 选择项目 → Deployments

## 手动部署

如果需要手动部署:

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod
```

## 环境变量

如果项目需要环境变量,在以下位置配置:

- **Vercel**: 项目 → Settings → Environment Variables
- **GitHub Actions**: 仓库 → Settings → Secrets and variables → Actions

## 分支策略

- `main` / `master`: 生产环境,自动部署
- 其他分支: 仅 CI 检查,不部署
