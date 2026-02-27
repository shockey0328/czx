# 直接部署到 Vercel（跳过 GitHub）

如果 GitHub 连接有问题，可以直接从本地部署到 Vercel。

## 方法一：使用 Vercel CLI（推荐）

### 步骤 1：安装 Vercel CLI
```bash
npm install -g vercel
```

### 步骤 2：登录 Vercel
```bash
vercel login
```
这会打开浏览器，选择登录方式（GitHub、GitLab、Bitbucket 或 Email）

### 步骤 3：部署
在项目目录下运行：
```bash
vercel
```

按照提示操作：
- Set up and deploy? → Yes
- Which scope? → 选择你的账号
- Link to existing project? → No
- What's your project's name? → search-dashboard（或其他名称）
- In which directory is your code located? → ./（直接回车）
- Want to override the settings? → No（直接回车）

### 步骤 4：生产环境部署
```bash
vercel --prod
```

## 方法二：使用 Vercel 网站上传

### 步骤 1：打包项目
将以下文件打包成 zip：
- index.html
- app.js
- logo.png
- 所有 CSV 文件
- vercel.json

### 步骤 2：上传到 Vercel
1. 访问 https://vercel.com
2. 登录账号
3. 点击 "Add New..." → "Project"
4. 选择 "Import Third-Party Git Repository" 或直接拖拽 zip 文件
5. 点击 "Deploy"

## 优点

✅ 不需要 GitHub
✅ 部署速度快
✅ 可以直接从本地部署
✅ 支持自动部署（使用 CLI）

## 缺点

❌ 没有版本控制
❌ 团队协作不便
❌ 需要手动更新

## 后续更新

每次修改后，运行：
```bash
vercel --prod
```

## 完整命令示例

```bash
# 首次部署
npm install -g vercel
vercel login
vercel
vercel --prod

# 后续更新
vercel --prod
```

## 查看部署

部署成功后会显示：
- Preview: https://search-dashboard-xxx.vercel.app
- Production: https://search-dashboard.vercel.app

## 管理部署

访问 https://vercel.com/dashboard 查看和管理所有部署。

## 绑定域名

1. 在 Vercel Dashboard 中选择项目
2. 点击 "Settings" → "Domains"
3. 添加自定义域名
4. 按照提示配置 DNS

## 环境变量

如果需要配置环境变量（如 API Key）：
1. 在 Vercel Dashboard 中选择项目
2. 点击 "Settings" → "Environment Variables"
3. 添加变量
4. 重新部署

## 故障排除

### 问题：vercel 命令不存在
解决：确保已安装 Node.js，然后运行 `npm install -g vercel`

### 问题：登录失败
解决：检查浏览器是否阻止弹出窗口，或使用 `vercel login --email your@email.com`

### 问题：部署失败
解决：检查 vercel.json 配置是否正确，查看错误日志

## 推荐工作流

1. 本地开发和测试
2. 使用 `vercel` 部署到预览环境
3. 测试预览环境
4. 使用 `vercel --prod` 部署到生产环境

这样可以避免 GitHub 连接问题，直接完成部署！
