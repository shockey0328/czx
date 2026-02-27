# 直接部署到Vercel（跳过GitHub）

由于网络问题无法推送到GitHub，我们可以直接使用Vercel CLI部署。

## 🚀 方法一：使用Vercel CLI（推荐）

### 步骤1：安装Vercel CLI

打开终端，执行：

```bash
npm install -g vercel
```

如果没有安装npm，需要先安装Node.js：https://nodejs.org/

### 步骤2：登录Vercel

```bash
vercel login
```

会打开浏览器让你登录Vercel账号。

### 步骤3：部署项目

在项目根目录执行：

```bash
vercel
```

第一次部署时会问几个问题：
- Set up and deploy? **Y**
- Which scope? 选择你的账号
- Link to existing project? **N**
- What's your project's name? **czx-dashboard**（或其他名字）
- In which directory is your code located? **./（直接回车）**

然后Vercel会自动上传文件并部署！

### 步骤4：部署到生产环境

测试成功后，部署到生产环境：

```bash
vercel --prod
```

## 🌐 方法二：使用Vercel网页上传

### 步骤1：打包项目

将整个项目文件夹压缩成zip文件。

### 步骤2：访问Vercel

1. 访问：https://vercel.com
2. 登录你的账号
3. 点击 "Add New..." → "Project"

### 步骤3：上传文件

1. 选择 "Import Third-Party Git Repository"
2. 或者直接拖拽zip文件上传

### 步骤4：配置并部署

- Framework Preset: **Other**
- Root Directory: **./（默认）**
- Build Command: **留空**
- Output Directory: **./（默认）**

点击 "Deploy" 开始部署！

## 📝 推荐使用Vercel CLI

Vercel CLI的优点：
- ✅ 不需要GitHub
- ✅ 直接从本地上传
- ✅ 速度快
- ✅ 自动配置
- ✅ 支持增量更新

## 🔧 安装Node.js（如果还没有）

### Windows:
1. 访问：https://nodejs.org/
2. 下载LTS版本
3. 运行安装程序
4. 重启终端

### 验证安装:
```bash
node --version
npm --version
```

## 💡 完整命令流程

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 部署到生产环境
vercel --prod
```

## ❓ 常见问题

### Q: npm命令不存在？
A: 需要先安装Node.js

### Q: vercel login打不开浏览器？
A: 手动访问显示的URL并登录

### Q: 上传很慢？
A: Vercel CLI会自动压缩和优化，第一次可能需要几分钟

### Q: 部署后还是404？
A: 检查vercel.json配置，确保index.html在根目录

## 🎯 现在开始

**执行以下命令：**

```bash
npm install -g vercel
vercel login
vercel --prod
```

就这么简单！不需要GitHub，直接部署！

---

**这是最简单的方案，强烈推荐！** 🚀
