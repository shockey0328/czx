# 🚀 Vercel 部署指南

## ✅ 前置条件
- GitHub 仓库已创建：`czx-dashboard`
- 代码已推送到 GitHub

---

## 📝 部署步骤

### 步骤 1：访问 Vercel
打开浏览器，访问：https://vercel.com

### 步骤 2：登录
1. 点击右上角 "Sign Up" 或 "Log In"
2. 选择 "Continue with GitHub"
3. 授权 Vercel 访问你的 GitHub 账号

### 步骤 3：导入项目
1. 登录后，点击 "Add New..." 按钮
2. 选择 "Project"
3. 在项目列表中找到 `czx-dashboard`
4. 点击右侧的 "Import" 按钮

### 步骤 4：配置项目
在配置页面：

**Project Name（项目名称）**
- 保持默认：`czx-dashboard`
- 或自定义名称

**Framework Preset（框架预设）**
- 选择：`Other`（其他）

**Root Directory（根目录）**
- 保持默认：`./`

**Build and Output Settings（构建设置）**
- Build Command: 留空
- Output Directory: 留空
- Install Command: 留空

**Environment Variables（环境变量）**
- 暂时不需要添加

### 步骤 5：部署
1. 确认所有设置正确
2. 点击蓝色的 "Deploy" 按钮
3. 等待部署完成（通常 1-2 分钟）

---

## 🎉 部署成功

部署完成后，你会看到：

### 访问地址
Vercel 会自动生成一个访问地址：
```
https://czx-dashboard.vercel.app
```

或类似：
```
https://czx-dashboard-xxx.vercel.app
```

### 项目仪表板
- 可以查看部署状态
- 查看访问统计
- 管理域名
- 查看部署日志

---

## 🔧 部署后配置

### 1. 自定义域名（可选）
1. 在项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS

### 2. 环境变量（如需要）
1. 在项目设置中点击 "Environment Variables"
2. 添加 DeepSeek API Key（如果使用 AI 功能）：
   - Name: `DEEPSEEK_API_KEY`
   - Value: `sk-22da5c080db84c23b4a5c8c54e922763`

### 3. 自动部署
Vercel 已自动配置：
- 每次推送到 `main` 分支
- 自动触发重新部署
- 无需手动操作

---

## ✅ 验证部署

访问你的 Vercel 地址，检查：

### 基础功能
- [ ] 主看板可以打开
- [ ] Logo 显示正常
- [ ] 导航按钮可以点击

### 子看板
- [ ] 月度核心数据看板
- [ ] 周度核心数据看板
- [ ] 搜索数据看板
- [ ] 各模块渗透率看板

### 数据展示
- [ ] 核心指标显示正常
- [ ] 图表渲染正常
- [ ] 数据切换正常

### 响应式
- [ ] 桌面端显示正常
- [ ] 移动端显示正常

---

## 📱 分享给团队

部署成功后，直接分享 Vercel 地址：
```
https://czx-dashboard.vercel.app
```

团队成员无需登录即可访问！

---

## 🔄 更新部署

### 方法 1：通过 GitHub Desktop
1. 修改代码
2. 在 GitHub Desktop 中提交
3. 点击 "Push origin"
4. Vercel 自动检测并重新部署

### 方法 2：通过 Vercel 手动触发
1. 访问 Vercel 项目页面
2. 点击 "Deployments"
3. 点击 "Redeploy"

---

## ❓ 常见问题

### Q: 部署失败怎么办？
A: 
1. 查看部署日志（Deployment Logs）
2. 检查文件路径是否正确
3. 确认 vercel.json 配置正确

### Q: 页面显示 404？
A: 
1. 检查 index.html 是否在根目录
2. 查看 vercel.json 的 routes 配置
3. 清除浏览器缓存重试

### Q: 图片不显示？
A: 
1. 检查图片路径是否正确
2. 确认图片文件已推送到 GitHub
3. 查看浏览器控制台错误信息

### Q: 数据不显示？
A: 
1. 检查 data.js 文件是否存在
2. 确认 CSV 文件已转换为 JS
3. 查看浏览器控制台错误

### Q: 如何查看部署日志？
A: 
1. 访问 Vercel 项目页面
2. 点击最新的部署
3. 查看 "Build Logs" 和 "Function Logs"

---

## 🎯 性能优化建议

### 1. 启用缓存
Vercel 已自动配置缓存，无需额外设置

### 2. 图片优化
- 使用 WebP 格式
- 压缩图片大小
- 使用 Vercel Image Optimization

### 3. 代码优化
- 压缩 JavaScript
- 压缩 CSS
- 使用 CDN 加载第三方库

---

## 📊 监控和分析

### Vercel Analytics（可选）
1. 在项目设置中启用 Analytics
2. 查看访问量、性能指标
3. 分析用户行为

### 自定义监控
可以集成：
- Google Analytics
- 百度统计
- 其他分析工具

---

## 🔒 安全设置

### 1. 访问控制（可选）
- 设置密码保护
- 配置 IP 白名单
- 使用 Vercel Authentication

### 2. HTTPS
- Vercel 自动提供 HTTPS
- 自动续期 SSL 证书
- 无需额外配置

---

## 💡 提示

### 首次部署
- 通常需要 1-2 分钟
- 可以在部署日志中查看进度
- 部署成功后会收到邮件通知

### 后续更新
- 推送代码后自动部署
- 通常 30 秒内完成
- 支持回滚到之前的版本

### 团队协作
- 可以邀请团队成员
- 设置不同的权限级别
- 共享项目访问权限

---

## 🎉 完成！

现在你的数据看板已经成功部署到 Vercel！

访问地址：`https://czx-dashboard.vercel.app`

分享给团队成员，开始使用吧！🚀

---

**部署日期：** 2026-02-27  
**版本：** v2.0  
**状态：** 已部署 ✓
