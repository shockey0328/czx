# 快速开始 - 3步部署到 Vercel

## ✅ 已完成
- [x] Git 仓库已初始化
- [x] 代码已提交到本地仓库
- [x] 配置文件已创建（vercel.json, package.json）

## 📝 接下来的步骤

### 1️⃣ 创建 GitHub 仓库（2分钟）

访问：https://github.com/new

填写：
- Repository name: `search-dashboard`
- 其他选项保持默认
- 点击 "Create repository"

### 2️⃣ 推送代码到 GitHub（1分钟）

在命令行中执行（替换为你的仓库地址）：

```bash
git remote add origin https://github.com/你的用户名/search-dashboard.git
git branch -M main
git push -u origin main
```

### 3️⃣ 部署到 Vercel（2分钟）

访问：https://vercel.com

1. 使用 GitHub 账号登录
2. 点击 "New Project"
3. 选择你的 `search-dashboard` 仓库
4. 点击 "Deploy"
5. 等待部署完成

## 🎉 完成！

部署成功后，你会得到一个访问链接，例如：
`https://search-dashboard.vercel.app`

## 📚 更多信息

- 详细部署指南：查看 `deploy-to-github.md`
- 完整文档：查看 `DEPLOY.md`
- 项目说明：查看 `README.md`

## 🔄 后续更新

修改代码后，只需：
```bash
git add .
git commit -m "更新说明"
git push
```

Vercel 会自动重新部署！
