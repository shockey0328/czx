# 🚀 部署到 GitHub 和 Vercel - 快速指南

## 方法一：使用自动化脚本（推荐）

### 1. 运行部署脚本

双击运行 `deploy.bat`，按照提示操作：

```
1. 输入你的 GitHub 用户名
2. 输入提交信息（可选）
3. 等待推送完成
```

### 2. 部署到 Vercel

脚本完成后：

1. 访问 [https://vercel.com](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "Add New..." → "Project"
4. 选择 `czx-dashboard` 仓库
5. 点击 "Deploy"
6. 等待部署完成

---

## 方法二：手动部署

### 步骤 1：推送到 GitHub

打开命令行，在项目目录执行：

```bash
# 1. 初始化 Git（如果还没有）
git init

# 2. 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/yourusername/czx-dashboard.git

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "Initial commit: 橙子学数据看板"

# 5. 推送
git branch -M main
git push -u origin main
```

### 步骤 2：部署到 Vercel

#### 选项 A：通过网站（简单）

1. 访问 [https://vercel.com](https://vercel.com)
2. 使用 GitHub 登录
3. 导入 `czx-dashboard` 仓库
4. 保持默认配置
5. 点击 "Deploy"

#### 选项 B：通过 CLI（高级）

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

---

## 📋 部署前检查清单

确保以下文件存在且正确：

- [x] `.gitignore` - 忽略不需要的文件
- [x] `vercel.json` - Vercel 配置
- [x] `README.md` - 项目说明
- [x] `index.html` - 主入口文件
- [x] 所有看板文件和数据文件

---

## 🎯 部署后验证

访问你的 Vercel 部署地址，检查：

1. ✅ 主看板可以打开
2. ✅ 所有子看板链接正常
3. ✅ 图表正常显示
4. ✅ 数据加载正常
5. ✅ 样式显示正确
6. ✅ 移动端显示正常

---

## 🔄 更新部署

### 更新代码

```bash
# 1. 修改代码
# 2. 提交更改
git add .
git commit -m "更新说明"
git push

# Vercel 会自动检测并重新部署
```

### 手动触发部署

在 Vercel 项目页面：
1. 进入 "Deployments"
2. 点击 "Redeploy"

---

## 🌐 访问地址

部署成功后，你会得到：

- **GitHub 仓库：** `https://github.com/yourusername/czx-dashboard`
- **Vercel 地址：** `https://czx-dashboard.vercel.app`
- **自定义域名：** 可在 Vercel 设置中配置

---

## ❓ 常见问题

### Q1: 推送失败，提示权限错误

**A:** 需要配置 GitHub 凭据：

```bash
# 方法1：使用 Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/yourusername/czx-dashboard.git

# 方法2：配置 SSH 密钥
# 参考：https://docs.github.com/en/authentication
```

### Q2: Vercel 部署后图片不显示

**A:** 检查图片路径：

```html
<!-- 使用相对路径 -->
<img src="./logo.png" alt="Logo">

<!-- 或根路径 -->
<img src="/logo.png" alt="Logo">
```

### Q3: 数据不更新

**A:** 清除缓存或重新部署：

```bash
# 方法1：清除浏览器缓存
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# 方法2：在 Vercel 重新部署
vercel --prod --force
```

### Q4: 如何配置自定义域名？

**A:** 在 Vercel 项目设置中：

1. 进入 "Domains"
2. 添加你的域名
3. 配置 DNS 记录（CNAME）
4. 等待验证完成

---

## 📞 获取帮助

- **详细文档：** 查看 `DEPLOY.md`
- **Vercel 文档：** [https://vercel.com/docs](https://vercel.com/docs)
- **GitHub 文档：** [https://docs.github.com](https://docs.github.com)

---

## 🎉 完成！

恭喜！你的数据看板已成功部署！

现在可以：
- 分享链接给团队成员
- 配置自定义域名
- 设置自动部署
- 监控访问数据

---

**祝使用愉快！** 🎊
