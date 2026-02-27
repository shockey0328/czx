# 🚀 Vercel 登录和部署说明

## ✅ 当前状态

- ✅ Node.js 已安装：v22.16.0
- ✅ Vercel CLI 已安装
- ⏳ 需要登录并部署

---

## 📝 操作步骤

### 方法 A：使用自动化脚本（推荐）

**双击运行：`开始Vercel部署.bat`**

脚本会引导你完成：
1. 登录 Vercel
2. 部署项目
3. 获取访问地址

### 方法 B：手动操作

#### 步骤 1：登录 Vercel

在项目目录打开 PowerShell，运行：

```bash
vercel login
```

**会发生什么：**
1. 命令行显示一个 URL 和验证码
2. 自动打开浏览器（或手动访问显示的 URL）
3. 在浏览器中选择登录方式：
   - **GitHub**（推荐）
   - GitLab
   - Bitbucket
   - Email

**登录步骤：**
1. 点击 "Continue with GitHub"
2. 授权 Vercel 访问你的 GitHub 账号
3. 看到 "Success!" 或 "Logged in" 提示
4. 关闭浏览器
5. 回到命令行窗口

#### 步骤 2：部署项目

登录成功后，运行：

```bash
vercel --prod
```

**回答配置问题：**

```
? Set up and deploy "E:\橙子学数据看板\橙子学数据看板"?
→ Y (输入 Y 然后回车)

? Which scope do you want to deploy to?
→ 按回车（使用默认账号）

? Link to existing project?
→ N (输入 N 然后回车)

? What's your project's name?
→ czx-dashboard (输入后回车)

? In which directory is your code located?
→ ./ (输入 ./ 然后回车，或直接回车)

? Want to override the settings?
→ N (输入 N 然后回车)
```

#### 步骤 3：等待部署

Vercel 会：
1. 上传文件（显示进度）
2. 构建项目
3. 部署到生产环境
4. 显示访问地址

**完成后会显示：**
```
✅  Production: https://czx-dashboard.vercel.app [copied to clipboard]
```

---

## 🎉 部署成功

### 访问你的看板

复制显示的地址，在浏览器中打开：
```
https://czx-dashboard.vercel.app
```

或类似的地址（Vercel 会自动生成）。

### 分享给团队

直接把地址发给团队成员：
```
https://czx-dashboard.vercel.app
```

无需登录，任何人都可以访问！

---

## 🔄 后续更新

修改代码后，重新部署：

```bash
vercel --prod
```

Vercel 会自动检测变化并更新线上版本。

---

## 📱 管理你的项目

### 在 Vercel 网站查看

1. 访问：https://vercel.com
2. 登录（使用相同的账号）
3. 查看项目列表
4. 点击 `czx-dashboard` 查看详情

### 可以做什么

- 查看部署历史
- 查看访问统计
- 配置自定义域名
- 设置环境变量
- 查看部署日志

---

## ❓ 常见问题

### Q: 登录时浏览器没有自动打开？
A: 
1. 手动复制命令行显示的 URL
2. 在浏览器中打开
3. 完成登录

### Q: 登录后命令行没有反应？
A: 
1. 确认浏览器显示 "Success!"
2. 回到命令行按回车
3. 如果还是没反应，重新运行 `vercel login`

### Q: 部署时提示错误？
A: 
1. 查看错误信息
2. 确认网络连接正常
3. 重试：`vercel --prod`

### Q: 如何查看部署日志？
A: 
```bash
vercel logs
```

### Q: 如何删除部署？
A: 
1. 访问 https://vercel.com
2. 进入项目设置
3. 删除项目

### Q: 可以使用自定义域名吗？
A: 
可以！在 Vercel 项目设置中添加域名。

---

## 💡 提示

### 首次部署
- 登录可能需要 1-2 分钟
- 部署通常需要 2-3 分钟
- 总共约 5 分钟完成

### 登录方式
- 推荐使用 GitHub 登录
- 最方便快捷
- 可以关联 GitHub 仓库（可选）

### 部署配置
- 项目名称：`czx-dashboard`
- 目录：`./`（当前目录）
- 其他保持默认即可

---

## 🎯 快速命令参考

```bash
# 登录
vercel login

# 部署到生产环境
vercel --prod

# 查看部署列表
vercel ls

# 查看日志
vercel logs

# 查看项目信息
vercel inspect

# 删除部署
vercel remove
```

---

## 📊 部署后验证

访问你的看板地址，检查：

- [ ] 主看板可以打开
- [ ] Logo 显示正常
- [ ] 导航按钮可以点击
- [ ] 子看板链接正常
- [ ] 数据显示正常
- [ ] 图表渲染正常
- [ ] 移动端显示正常

---

## 🌐 访问地址格式

Vercel 会生成以下格式的地址：

**主域名：**
```
https://czx-dashboard.vercel.app
```

**或带随机后缀：**
```
https://czx-dashboard-xxx.vercel.app
```

**或自定义域名（可选）：**
```
https://dashboard.yourdomain.com
```

---

## ✨ 总结

1. ✅ 运行 `vercel login` 登录
2. ✅ 运行 `vercel --prod` 部署
3. ✅ 获取访问地址
4. ✅ 分享给团队

**就这么简单！** 🚀

---

**推荐：** 使用 `开始Vercel部署.bat` 自动化脚本，更简单！

---

**创建日期：** 2026-02-27  
**Node.js 版本：** v22.16.0  
**Vercel CLI：** 已安装 ✓  
**状态：** 准备部署 ✓
