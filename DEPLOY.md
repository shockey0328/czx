# 部署指南

## 📦 部署到 GitHub 和 Vercel

### 前置准备

1. **GitHub 账号**
   - 已创建仓库：`czx-dashboard`
   - 仓库地址：`https://github.com/yourusername/czx-dashboard`

2. **Vercel 账号**
   - 注册：[https://vercel.com](https://vercel.com)
   - 建议使用 GitHub 账号登录

3. **Git 工具**
   - 确保已安装 Git
   - 配置好 Git 用户信息

---

## 🚀 步骤一：推送到 GitHub

### 1. 初始化 Git 仓库（如果还没有）

```bash
# 在项目根目录执行
git init
```

### 2. 添加远程仓库

```bash
# 替换为你的 GitHub 用户名
git remote add origin https://github.com/yourusername/czx-dashboard.git
```

### 3. 添加所有文件

```bash
git add .
```

### 4. 提交更改

```bash
git commit -m "Initial commit: 橙子学数据看板系统"
```

### 5. 推送到 GitHub

```bash
# 首次推送
git push -u origin main

# 如果默认分支是 master
git branch -M main
git push -u origin main
```

### 6. 验证

访问你的 GitHub 仓库，确认所有文件已上传成功。

---

## 🌐 步骤二：部署到 Vercel

### 方法一：通过 Vercel 网站（推荐）

1. **登录 Vercel**
   - 访问 [https://vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录

2. **导入项目**
   - 点击 "Add New..." → "Project"
   - 选择 "Import Git Repository"
   - 找到并选择 `czx-dashboard` 仓库

3. **配置项目**
   ```
   Project Name: czx-dashboard
   Framework Preset: Other
   Root Directory: ./
   Build Command: (留空)
   Output Directory: (留空)
   Install Command: (留空)
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成（通常 1-2 分钟）

5. **访问**
   - 部署成功后会得到一个 URL
   - 格式：`https://czx-dashboard.vercel.app`
   - 或自定义域名

### 方法二：通过 Vercel CLI

1. **安装 Vercel CLI**
```bash
npm install -g vercel
```

2. **登录**
```bash
vercel login
```

3. **部署**
```bash
# 在项目根目录执行
vercel

# 按提示操作：
# - Set up and deploy? Yes
# - Which scope? 选择你的账号
# - Link to existing project? No
# - What's your project's name? czx-dashboard
# - In which directory is your code located? ./
```

4. **生产环境部署**
```bash
vercel --prod
```

---

## 🔄 后续更新

### 更新代码并重新部署

```bash
# 1. 修改代码后，提交更改
git add .
git commit -m "更新说明"
git push

# 2. Vercel 会自动检测并重新部署
# 或手动触发：
vercel --prod
```

---

## ⚙️ 环境变量配置（可选）

如果需要配置环境变量（如 API 密钥）：

### 在 Vercel 网站配置

1. 进入项目设置
2. 选择 "Environment Variables"
3. 添加变量：
   ```
   Name: DEEPSEEK_API_KEY
   Value: your-api-key-here
   ```

### 在代码中使用

```javascript
const apiKey = process.env.DEEPSEEK_API_KEY || 'default-key';
```

---

## 🎯 自定义域名（可选）

### 在 Vercel 添加自定义域名

1. 进入项目设置
2. 选择 "Domains"
3. 添加你的域名
4. 按照提示配置 DNS 记录

### DNS 配置示例

```
Type: CNAME
Name: dashboard (或 @)
Value: cname.vercel-dns.com
```

---

## 📊 部署检查清单

部署前确认：

- [ ] 所有文件已提交到 Git
- [ ] `.gitignore` 已配置
- [ ] `vercel.json` 已创建
- [ ] README.md 已更新
- [ ] 测试所有看板功能正常
- [ ] 图片和资源文件路径正确
- [ ] API 密钥已配置（如需要）

部署后验证：

- [ ] 主看板可以访问
- [ ] 所有子看板链接正常
- [ ] 图表正常显示
- [ ] 数据加载正常
- [ ] 移动端显示正常
- [ ] AI 功能正常（如已配置）

---

## 🐛 常见问题

### 1. 推送到 GitHub 失败

**问题：** `Permission denied`

**解决：**
```bash
# 配置 SSH 密钥或使用 HTTPS + Personal Access Token
git remote set-url origin https://github.com/yourusername/czx-dashboard.git
```

### 2. Vercel 部署失败

**问题：** 找不到文件

**解决：**
- 检查 `vercel.json` 配置
- 确认文件路径正确
- 查看 Vercel 部署日志

### 3. 图片不显示

**问题：** 图片路径错误

**解决：**
```javascript
// 使用相对路径
<img src="./logo.png" alt="Logo">

// 或绝对路径
<img src="/logo.png" alt="Logo">
```

### 4. 数据不更新

**问题：** 缓存问题

**解决：**
- 清除浏览器缓存
- 在 Vercel 触发重新部署
- 检查 `vercel.json` 的缓存配置

---

## 📞 获取帮助

- **Vercel 文档：** [https://vercel.com/docs](https://vercel.com/docs)
- **GitHub 文档：** [https://docs.github.com](https://docs.github.com)
- **项目 Issues：** [https://github.com/yourusername/czx-dashboard/issues](https://github.com/yourusername/czx-dashboard/issues)

---

## 🎉 部署成功！

恭喜！你的数据看板已成功部署到：

- **GitHub：** `https://github.com/yourusername/czx-dashboard`
- **Vercel：** `https://czx-dashboard.vercel.app`

现在可以分享给团队使用了！

---

**最后更新：** 2026-02-27
