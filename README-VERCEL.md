# Vercel 部署指南

## 📦 部署前准备

### 1. 项目结构检查

确保项目根目录包含以下文件：
```
├── dashboard.html          # 主入口文件
├── dashboard.css           # 主样式文件
├── dashboard.js            # 主逻辑文件
├── vercel.json            # Vercel配置文件
├── .gitignore             # Git忽略文件
├── 核心数据看板（周度）/
├── 搜索数据看板（周度）/
├── 核心数据看板（月度）/
└── 各模块渗透率看板（月度）/
```

### 2. 清理不必要的文件

删除或不提交以下文件到Git：
- `index.html`, `main.css`, `main.js` (旧版本文件)
- `node_modules/` 目录
- `.git/` 子目录（各看板文件夹内的）
- 各种 `.md` 说明文档（可选）

## 🚀 部署步骤

### 方法一：通过GitHub自动部署（推荐）

#### 1. 创建GitHub仓库

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 数据看板"

# 关联远程仓库
git remote add origin https://github.com/你的用户名/你的仓库名.git

# 推送到GitHub
git push -u origin main
```

#### 2. 连接Vercel

1. 访问 [Vercel](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "New Project"
4. 选择你的GitHub仓库
5. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: 留空
   - **Output Directory**: `./`
6. 点击 "Deploy"

#### 3. 等待部署完成

部署完成后，Vercel会提供一个URL，例如：
```
https://your-project.vercel.app
```

### 方法二：通过Vercel CLI部署

#### 1. 安装Vercel CLI

```bash
npm install -g vercel
```

#### 2. 登录Vercel

```bash
vercel login
```

#### 3. 部署项目

```bash
# 在项目根目录执行
vercel

# 或者直接部署到生产环境
vercel --prod
```

## ⚙️ 配置说明

### vercel.json 配置

```json
{
  "version": 2,
  "routes": [
    {
      "src": "/",
      "dest": "/dashboard.html"
    }
  ]
}
```

这个配置确保：
- 访问根路径 `/` 时自动跳转到 `dashboard.html`
- 所有静态文件都可以正常访问

## 🔧 常见问题

### 问题1：iframe内容无法加载

**原因**：路径问题或CORS限制

**解决方案**：
- 确保所有路径使用相对路径（`./`开头）
- 检查 `vercel.json` 中的CORS配置

### 问题2：CSV文件加载失败

**原因**：文件编码或路径问题

**解决方案**：
- 确保所有CSV文件使用UTF-8编码
- 检查文件名是否正确（中文文件名）
- 确保CSV文件在正确的目录中

### 问题3：月度核心数据看板无法显示

**原因**：React应用需要构建

**解决方案**：
1. 在本地构建React应用：
   ```bash
   cd "核心数据看板（月度）"
   npm install
   npm run build
   ```
2. 修改 `dashboard.html` 中的路径：
   ```html
   <iframe src="./核心数据看板（月度）/build/index.html" ...>
   ```
3. 重新部署

### 问题4：部署后样式错乱

**原因**：CSS文件路径问题

**解决方案**：
- 检查所有CSS文件的引用路径
- 确保使用相对路径

## 📝 部署后检查清单

- [ ] 访问主页面能正常显示
- [ ] 周度/月度切换正常
- [ ] 核心数据（周度）看板正常显示
- [ ] 搜索数据（周度）看板正常显示
- [ ] 各模块渗透率（月度）看板正常显示
- [ ] 所有图表正常渲染
- [ ] CSV数据正常加载
- [ ] 移动端显示正常

## 🔄 更新部署

### 通过GitHub自动部署

1. 修改代码
2. 提交并推送到GitHub：
   ```bash
   git add .
   git commit -m "更新说明"
   git push
   ```
3. Vercel会自动检测并重新部署

### 通过CLI手动部署

```bash
vercel --prod
```

## 🌐 自定义域名

1. 在Vercel项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置DNS记录
4. 等待DNS生效（通常几分钟到几小时）

## 📊 性能优化建议

1. **压缩图片**：使用工具压缩logo.png等图片文件
2. **CDN加速**：Vercel自动提供全球CDN
3. **缓存策略**：Vercel会自动处理静态文件缓存
4. **懒加载**：iframe已经实现了懒加载

## 🆘 获取帮助

- [Vercel文档](https://vercel.com/docs)
- [Vercel社区](https://github.com/vercel/vercel/discussions)

---

**部署成功后，记得测试所有功能！** 🎉
