# 🎯 开始使用 GitHub 和 Vercel

按照这个指南，你可以设置完整的 **本地 → GitHub → Vercel** 工作流程。

---

## 📋 准备工作

### 需要的账号
- ✅ GitHub 账号：https://github.com/signup
- ✅ Vercel 账号：https://vercel.com/signup（可以用 GitHub 登录）

### 需要的工具
- ✅ Git（已安装）
- ✅ GitHub Desktop（可选，但强烈推荐）：https://desktop.github.com/

---

## 🚀 第一步：创建 GitHub 仓库

### 方法1: 在 GitHub 网站创建（推荐）

1. 访问 https://github.com/new
2. 填写信息：
   ```
   Repository name: czx-dashboard
   Description: 橙子学数据看板
   Public/Private: 选择 Public（或 Private）
   
   ⚠️ 不要勾选任何初始化选项！
   ```
3. 点击 "Create repository"
4. **复制仓库地址**（类似：`https://github.com/你的用户名/czx-dashboard.git`）

### 方法2: 使用 GitHub Desktop

1. 打开 GitHub Desktop
2. File → Add Local Repository
3. 选择项目文件夹：`E:\橙子学数据看板\橙子学数据看板`
4. 点击 "Publish repository"
5. 填写名称：`czx-dashboard`
6. 点击 "Publish Repository"

---

## 🔗 第二步：连接本地仓库到 GitHub

### 方法1: 使用辅助脚本（最简单）

1. 双击 `设置GitHub仓库.bat`
2. 选择选项 `2`（创建新的 GitHub 仓库并连接）
3. 输入你的仓库地址
4. 完成！

### 方法2: 使用命令行

```bash
# 1. 移除旧的远程仓库（如果有）
git remote remove origin

# 2. 添加新的远程仓库（替换成你的地址）
git remote add origin https://github.com/你的用户名/czx-dashboard.git

# 3. 验证
git remote -v
```

### 方法3: 使用 GitHub Desktop

如果用 GitHub Desktop 发布的，这一步已经自动完成了。

---

## 📤 第三步：首次推送到 GitHub

### 方法1: 使用 GitHub Desktop（最稳定）

1. 打开 GitHub Desktop
2. 确认所有文件都已提交（左下角显示 "No local changes"）
3. 点击顶部的 "Push origin" 按钮
4. 等待推送完成

### 方法2: 使用命令行

```bash
git push -u origin main
```

### 方法3: 使用辅助脚本

1. 双击 `设置GitHub仓库.bat`
2. 选择选项 `3`（推送到 GitHub）

---

## ☁️ 第四步：连接 Vercel

### 1. 登录 Vercel

访问 https://vercel.com/ 并登录（建议用 GitHub 账号登录）

### 2. 导入项目

1. 点击 "Add New..." → "Project"
2. 选择 "Import Git Repository"
3. 如果没看到你的仓库：
   - 点击 "Adjust GitHub App Permissions"
   - 授权访问你的仓库
4. 找到 `czx-dashboard` 仓库
5. 点击 "Import"

### 3. 配置项目

```
Framework Preset: Other
Root Directory: ./
Build Command: (留空)
Output Directory: (留空)
Install Command: (留空)
```

### 4. 部署

点击 "Deploy" 按钮，等待部署完成（约 30 秒）

### 5. 获取网址

部署成功后，你会得到一个网址，类似：
```
https://czx-dashboard.vercel.app
```

复制这个网址，就可以访问你的看板了！

---

## 🔄 日常使用流程

### 每次修改后

#### 使用 GitHub Desktop（推荐）

1. **修改文件**（比如更新 CSV 数据）
2. **打开 GitHub Desktop**
   - 会自动显示所有修改
3. **提交**
   - 左下角填写提交说明
   - 点击 "Commit to main"
4. **推送**
   - 点击顶部 "Push origin"
5. **等待部署**
   - Vercel 会自动部署（约 30 秒）
   - 访问你的网址查看更新

#### 使用快速推送脚本

1. **修改文件**
2. **双击** `快速推送.bat`
3. **输入提交说明**
4. **完成**！

#### 使用命令行

```bash
# 1. 查看修改
git status

# 2. 添加所有修改
git add .

# 3. 提交
git commit -m "更新第9周搜索数据"

# 4. 推送
git push
```

---

## 📊 查看部署状态

### Vercel 控制台

1. 访问 https://vercel.com/dashboard
2. 找到你的项目
3. 查看 "Deployments" 标签
4. 每次推送都会创建一个新的部署

### 部署状态说明

- 🟡 **Building**: 正在构建和部署
- 🟢 **Ready**: 部署成功，网站已更新
- 🔴 **Error**: 部署失败，点击查看错误日志

---

## 🎨 完整示例：更新数据

假设你要更新搜索数据：

### 步骤1: 修改文件
```
替换文件: 搜索数据看板（周度）/第9周搜索词.csv
```

### 步骤2: 本地测试
```bash
# 启动服务器
python -m http.server 8000

# 或双击
启动本地服务器.bat

# 在浏览器测试
http://localhost:8000
```

### 步骤3: 提交和推送

**使用 GitHub Desktop**:
1. 打开 GitHub Desktop
2. 看到修改的文件
3. 填写提交说明："更新第9周搜索数据"
4. 点击 "Commit to main"
5. 点击 "Push origin"

**或使用快速推送脚本**:
1. 双击 `快速推送.bat`
2. 输入："更新第9周搜索数据"
3. 回车

### 步骤4: 等待部署
- 访问 https://vercel.com/dashboard
- 看到新的部署正在进行
- 约 30 秒后完成

### 步骤5: 验证
- 访问你的 Vercel 网址
- 确认数据已更新

---

## 🛠️ 辅助工具

### 本地测试
- `启动本地服务器.bat` - 一键启动本地服务器
- `test-local.html` - 快速测试各个看板

### Git 操作
- `设置GitHub仓库.bat` - 设置和管理 GitHub 仓库
- `快速推送.bat` - 快速提交和推送

### 文档
- `🔄 标准工作流程.md` - 详细的工作流程说明
- `📌 从这里开始.md` - 快速导航
- `完成总结.md` - 项目功能说明

---

## ⚠️ 常见问题

### Q1: 推送失败，显示网络错误
**解决方案**:
1. 使用 GitHub Desktop（更稳定）
2. 检查网络连接
3. 稍后重试

### Q2: Vercel 没有自动部署
**解决方案**:
1. 确认 GitHub 推送成功
2. 检查 Vercel 项目设置中的 Git 集成
3. 手动触发部署：Vercel 控制台 → Deployments → Redeploy

### Q3: 部署失败
**解决方案**:
1. 查看 Vercel 的错误日志
2. 确认 vercel.json 配置正确
3. 检查文件路径是否正确

### Q4: 修改没有生效
**解决方案**:
1. 清除浏览器缓存（Ctrl + F5）
2. 确认 Vercel 部署状态是 "Ready"
3. 检查是否访问的是正确的网址

---

## ✅ 设置完成检查清单

- [ ] GitHub 账号已创建
- [ ] Vercel 账号已创建
- [ ] GitHub 仓库已创建
- [ ] 本地仓库已连接到 GitHub
- [ ] 成功推送到 GitHub
- [ ] Vercel 已连接到 GitHub 仓库
- [ ] Vercel 首次部署成功
- [ ] 能访问 Vercel 网址
- [ ] 测试修改 → 推送 → 自动部署流程

全部打勾？完美！🎉

---

## 🎯 下一步

现在你可以：

1. ✅ 修改本地文件
2. ✅ 本地测试
3. ✅ 推送到 GitHub
4. ✅ Vercel 自动部署
5. ✅ 在线访问更新

**这就是标准的开发流程！** 🚀

---

## 📞 需要帮助？

- 查看 `🔄 标准工作流程.md` 了解详细步骤
- 使用 GitHub Desktop 可以避免大部分命令行问题
- 遇到错误时，截图并查看错误信息

祝使用愉快！🎊
