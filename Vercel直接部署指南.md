# 🚀 Vercel 直接部署指南（跳过 GitHub）

## 问题说明

由于网络原因无法推送到 GitHub，我们可以直接使用 Vercel CLI 部署，完全跳过 GitHub！

---

## ✅ 前置条件

### 1. 安装 Node.js
如果还没有安装：
1. 访问：https://nodejs.org/
2. 下载 LTS 版本（推荐）
3. 安装（一路下一步）
4. 重启命令行

### 2. 检查安装
打开 PowerShell，运行：
```bash
node --version
npm --version
```

如果显示版本号，说明安装成功。

---

## 🚀 方法 1：使用自动化脚本（推荐）

### 步骤 1：运行部署脚本
双击运行：`直接部署到Vercel.bat`

脚本会自动：
1. 检查 Node.js 和 npm
2. 安装 Vercel CLI
3. 引导你登录 Vercel
4. 部署项目

### 步骤 2：登录 Vercel
- 脚本会打开浏览器
- 选择登录方式（推荐使用 GitHub）
- 完成授权

### 步骤 3：确认部署
- 按照提示操作
- 等待部署完成
- 获取访问地址

✅ 完成！

---

## 🔧 方法 2：手动操作

### 步骤 1：安装 Vercel CLI
打开 PowerShell，在项目目录运行：
```bash
npm install -g vercel
```

### 步骤 2：登录
```bash
vercel login
```

选择登录方式：
- GitHub（推荐）
- GitLab
- Bitbucket
- Email

### 步骤 3：部署
```bash
# 首次部署（会询问配置）
vercel

# 或直接部署到生产环境
vercel --prod
```

### 步骤 4：回答配置问题

**Set up and deploy?**
```
Y (Yes)
```

**Which scope?**
```
选择你的账号（通常是默认选项）
```

**Link to existing project?**
```
N (No) - 创建新项目
```

**What's your project's name?**
```
czx-dashboard
```

**In which directory is your code located?**
```
./ (当前目录)
```

**Want to override the settings?**
```
N (No) - 使用默认设置
```

### 步骤 5：等待部署
- Vercel 会自动上传文件
- 构建项目
- 部署到生产环境
- 显示访问地址

---

## 🎉 部署成功

部署完成后，你会看到类似输出：

```
✅  Production: https://czx-dashboard.vercel.app [copied to clipboard]
```

这就是你的看板访问地址！

---

## 📝 后续更新

### 更新代码后重新部署
```bash
# 在项目目录运行
vercel --prod
```

Vercel 会：
1. 检测文件变化
2. 上传更新的文件
3. 重新部署
4. 更新线上版本

---

## 🔍 查看部署状态

### 在命令行查看
```bash
# 查看项目列表
vercel ls

# 查看部署历史
vercel inspect
```

### 在网站查看
1. 访问：https://vercel.com
2. 登录
3. 查看项目仪表板

---

## ⚙️ 高级配置

### 1. 配置项目设置
创建 `vercel.json`（已存在）：
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 2. 设置环境变量
```bash
# 添加环境变量
vercel env add DEEPSEEK_API_KEY

# 输入值
sk-22da5c080db84c23b4a5c8c54e922763
```

### 3. 自定义域名
```bash
# 添加域名
vercel domains add yourdomain.com
```

---

## ❓ 常见问题

### Q: 没有安装 Node.js 怎么办？
A: 
1. 访问 https://nodejs.org/
2. 下载 LTS 版本
3. 安装后重启命令行

### Q: npm 安装 Vercel CLI 很慢？
A: 可以使用国内镜像：
```bash
npm config set registry https://registry.npmmirror.com
npm install -g vercel
```

### Q: 部署失败怎么办？
A: 
1. 检查网络连接
2. 查看错误信息
3. 确认文件路径正确
4. 重试：`vercel --prod`

### Q: 如何删除部署？
A: 
1. 访问 https://vercel.com
2. 进入项目设置
3. 删除项目

### Q: 部署后页面显示 404？
A: 
1. 检查 index.html 是否在根目录
2. 查看 vercel.json 配置
3. 清除浏览器缓存

---

## 💡 优势

使用 Vercel CLI 直接部署的优势：

✅ 无需 GitHub（跳过网络问题）
✅ 部署速度快
✅ 自动 HTTPS
✅ 全球 CDN
✅ 自动优化
✅ 免费使用

---

## 🎯 与 GitHub 部署的对比

| 特性 | GitHub + Vercel | Vercel CLI |
|------|----------------|------------|
| 需要 GitHub | ✅ 是 | ❌ 否 |
| 版本控制 | ✅ 是 | ❌ 否 |
| 自动部署 | ✅ 是 | ❌ 否 |
| 部署速度 | 中等 | 快 |
| 网络要求 | 高 | 中等 |
| 适用场景 | 团队协作 | 快速部署 |

---

## 🔄 迁移到 GitHub（可选）

如果以后网络问题解决了，可以迁移到 GitHub：

### 步骤 1：推送到 GitHub
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/czx-dashboard.git
git push -u origin main
```

### 步骤 2：连接 Vercel 和 GitHub
1. 访问 Vercel 项目设置
2. 连接 Git Repository
3. 选择 GitHub 仓库
4. 启用自动部署

---

## 📊 监控和分析

### 查看访问统计
1. 访问 https://vercel.com
2. 进入项目
3. 查看 Analytics

### 查看部署日志
```bash
vercel logs
```

---

## 🎉 总结

使用 Vercel CLI 直接部署：
1. 安装 Node.js
2. 运行 `直接部署到Vercel.bat`
3. 登录 Vercel
4. 等待部署完成

**只需 5 分钟，无需 GitHub！** 🚀

---

**创建日期：** 2026-02-27  
**版本：** v1.0  
**状态：** 推荐使用 ✓
