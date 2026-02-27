# 🚀 部署指南

## 部署到Vercel

### 准备工作
1. 确保项目在本地正常运行
2. 准备GitHub账号
3. 准备Vercel账号

### 步骤1：上传到GitHub

1. **初始化Git仓库**：
```bash
git init
git add .
git commit -m "Initial commit: 月度数据分析看板"
```

2. **创建GitHub仓库**：
   - 访问 https://github.com/new
   - 仓库名称：`monthly-dashboard` 或你喜欢的名称
   - 设置为Public（公开）
   - 不要初始化README（因为本地已有文件）

3. **推送到GitHub**：
```bash
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```

### 步骤2：部署到Vercel

1. **登录Vercel**：
   - 访问 https://vercel.com/
   - 使用GitHub账号登录

2. **导入项目**：
   - 点击 "New Project"
   - 选择你刚创建的GitHub仓库
   - 点击 "Import"

3. **配置环境变量**：
   - 在项目设置中添加环境变量
   - 变量名：`REACT_APP_DEEPSEEK_API_KEY`
   - 变量值：`sk-22da5c080db84c23b4a5c8c54e922763`

4. **部署**：
   - 点击 "Deploy"
   - 等待构建完成
   - 获得部署地址

### 步骤3：验证部署

1. **访问部署地址**
2. **测试功能**：
   - 数据加载是否正常
   - 图表显示是否正确
   - AI分析是否工作
   - 响应式设计是否正常

### 自动部署

配置完成后，每次推送到GitHub主分支都会自动触发Vercel重新部署。

## 注意事项

### 环境变量安全
- API密钥已配置在Vercel环境变量中
- 不要在代码中硬编码敏感信息
- .env文件已在.gitignore中排除

### 性能优化
- 项目已配置静态资源缓存
- 使用React生产构建
- 启用了Vercel的CDN加速

### 域名配置（可选）
- 可以在Vercel中配置自定义域名
- 支持HTTPS和自动证书

## 故障排除

### 构建失败
- 检查package.json依赖
- 查看Vercel构建日志
- 确认Node.js版本兼容性

### API不工作
- 检查环境变量配置
- 验证API密钥有效性
- 查看浏览器控制台错误

### 数据不显示
- 确认CSV文件在public目录
- 检查文件路径是否正确
- 验证数据格式

## 更新部署

要更新部署的应用：
1. 修改本地代码
2. 提交并推送到GitHub
3. Vercel会自动重新部署

```bash
git add .
git commit -m "更新描述"
git push
```