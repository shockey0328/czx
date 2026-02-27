# 部署指南

## 部署到 Vercel

### 方法一：通过 GitHub（推荐）

1. **初始化 Git 仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 搜索数据看板"
   ```

2. **创建 GitHub 仓库**
   - 访问 https://github.com/new
   - 创建一个新仓库（例如：search-dashboard）
   - 不要初始化 README、.gitignore 或 license

3. **推送到 GitHub**
   ```bash
   git remote add origin https://github.com/你的用户名/search-dashboard.git
   git branch -M main
   git push -u origin main
   ```

4. **连接 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账号登录
   - 点击 "New Project"
   - 导入你的 GitHub 仓库
   - 点击 "Deploy"

5. **完成**
   - Vercel 会自动部署你的项目
   - 部署完成后会提供一个访问链接
   - 每次推送到 GitHub 都会自动重新部署

### 方法二：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   vercel
   ```

4. **生产环境部署**
   ```bash
   vercel --prod
   ```

## 配置说明

### vercel.json
项目已包含 `vercel.json` 配置文件，包含以下设置：
- 静态文件托管
- CSV 文件正确的 Content-Type 头
- 缓存策略

### 环境变量（如需要）
如果需要配置环境变量（如 DeepSeek API Key）：
1. 在 Vercel 项目设置中添加环境变量
2. 修改 `app.js` 使用环境变量

## 自定义域名

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

## 注意事项

- 确保所有 CSV 文件都是 UTF-8 编码
- logo.png 文件需要存在
- 首次部署可能需要几分钟
- Vercel 免费版有使用限制，但对于这个项目足够使用

## 更新部署

推送新代码到 GitHub 后，Vercel 会自动重新部署：
```bash
git add .
git commit -m "更新说明"
git push
```

## 故障排除

### CSV 文件显示乱码
确保所有 CSV 文件都是 UTF-8 编码：
```bash
# Windows PowerShell
Get-Content "文件名.csv" -Encoding Default | Out-File "文件名.csv" -Encoding UTF8
```

### 部署失败
- 检查 vercel.json 语法是否正确
- 查看 Vercel 部署日志
- 确保所有文件都已提交到 Git

### API 调用失败
- 检查 DeepSeek API Key 是否有效
- 考虑将 API Key 移到环境变量中
