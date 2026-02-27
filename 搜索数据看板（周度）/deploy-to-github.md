# 快速部署到 GitHub 和 Vercel

## 第一步：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - Repository name: `search-dashboard`（或其他名称）
   - Description: `周度搜索数据看板`
   - 选择 Public 或 Private
   - **不要**勾选 "Add a README file"
   - **不要**勾选 "Add .gitignore"
   - **不要**选择 license
3. 点击 "Create repository"

## 第二步：推送代码到 GitHub

复制 GitHub 页面上显示的命令，或使用以下命令（替换为你的仓库地址）：

```bash
git remote add origin https://github.com/你的用户名/search-dashboard.git
git branch -M main
git push -u origin main
```

**示例：**
```bash
git remote add origin https://github.com/zhangsan/search-dashboard.git
git branch -M main
git push -u origin main
```

## 第三步：部署到 Vercel

### 方式 A：通过 Vercel 网站（推荐，最简单）

1. 访问 https://vercel.com
2. 点击右上角 "Sign Up" 或 "Log In"
3. 选择 "Continue with GitHub" 使用 GitHub 账号登录
4. 登录后，点击 "Add New..." → "Project"
5. 在 "Import Git Repository" 中找到你的仓库
6. 点击 "Import"
7. 保持默认设置，点击 "Deploy"
8. 等待部署完成（通常 1-2 分钟）
9. 部署成功后会显示访问链接

### 方式 B：通过 Vercel CLI

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 生产环境部署
vercel --prod
```

## 第四步：访问你的看板

部署完成后，Vercel 会提供一个链接，例如：
- `https://search-dashboard.vercel.app`
- `https://search-dashboard-你的用户名.vercel.app`

## 后续更新

每次修改代码后，只需推送到 GitHub，Vercel 会自动重新部署：

```bash
git add .
git commit -m "更新描述"
git push
```

## 常见问题

### Q: 推送到 GitHub 时需要输入密码？
A: GitHub 已不支持密码认证，需要使用 Personal Access Token：
1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 "repo" 权限
4. 生成后复制 token
5. 推送时使用 token 作为密码

### Q: 如何绑定自定义域名？
A: 在 Vercel 项目设置中：
1. 点击 "Settings" → "Domains"
2. 输入你的域名
3. 按照提示配置 DNS 记录

### Q: CSV 文件显示乱码？
A: 确保所有 CSV 文件都是 UTF-8 编码（已处理）

### Q: 部署后 AI 分析功能不工作？
A: DeepSeek API Key 已硬编码在代码中，如需更换：
1. 在 Vercel 项目设置中添加环境变量
2. 修改 app.js 使用环境变量

## 需要帮助？

- Vercel 文档: https://vercel.com/docs
- GitHub 文档: https://docs.github.com
- 查看 DEPLOY.md 获取更多详细信息
