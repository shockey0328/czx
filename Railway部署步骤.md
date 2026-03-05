ehavior.yourdomain.com）
5. 按照提示配置DNS记录

---

## 下一步

1. ✅ 完成Railway部署
2. ✅ 获取Railway URL
3. ✅ 更新main.js配置
4. ✅ 推送到GitHub
5. ✅ 测试线上看板

**准备好了吗？现在就去Railway部署吧！**

访问：https://railway.app

有任何问题随时告诉我！
定失败：确认使用了 `process.env.PORT`
- 模块找不到：检查import路径

### Q2: 如何查看运行日志？

1. 在Railway项目页面
2. 点击 "Deployments"
3. 选择当前运行的部署
4. 查看实时日志

### Q3: 如何重新部署？

**方法1：推送代码**
- 推送到GitHub后，Railway自动重新部署

**方法2：手动触发**
- 在Railway项目页面
- 点击 "Deployments"
- 点击 "Redeploy"

### Q4: 免费额度够用吗？

**Railway免费版：**
- 500小时/月运行时间
- 如果24/7运行：720小时/月
- 建议：设置自动休眠或升级到Hobby版（$5/月）

**监控用量：**
- 在Railway项目页面查看 "Usage"
- 接近限额时会收到邮件提醒

### Q5: 如何设置自定义域名？

1. 在Railway项目页面，点击 "Settings"
2. 找到 "Domains" 部分
3. 点击 "Add Custom Domain"
4. 输入你的域名（如：user-b败：检查package.json
- 端口绑ay/cli
   ```

2. **登录Railway**
   ```bash
   railway login
   ```

3. **链接项目**
   ```bash
   cd 用户行为看板（周度）
   railway link
   ```

4. **上传数据文件**
   ```bash
   railway up
   ```

### 方案2：使用云存储

1. 将Excel文件上传到云存储（如AWS S3、阿里云OSS）
2. 修改代码从云存储下载数据
3. 首次启动时自动初始化数据库

### 方案3：暂时使用示例数据

如果只是测试部署，可以先不上传真实数据：
- Railway会自动初始化空数据库
- 可以手动添加少量测试数据
- 等部署成功后再上传完整数据

---

## 常见问题

### Q1: 部署失败怎么办？

**检查日志：**
1. 在Railway项目页面，点击 "Deployments"
2. 点击失败的部署
3. 查看 "Build Logs" 和 "Deploy Logs"
4. 根据错误信息调整配置

**常见错误：**
- `npm install` 失
git push origin main
```

Vercel会自动检测更新并重新部署主看板。

---

## 数据文件处理

由于数据文件（300MB+）太大，无法提交到Git，有两个方案：

### 方案1：使用Railway CLI上传（推荐）

1. **安装Railway CLI**
   ```bash
   npm install -g @railwerCommand: 'node server-with-db.js',
    serverPath: '用户行为看板（周度）'
}
```

### 推送到GitHub

```bash
git add main.js
git commit -m "更新用户行为看板URL为Railway部署地址"置，将URL改为Railway提供的域名：

```javascript
'user-behavior-weekly': {
    name: '用户行为',
    path: 'https://你的railway域名/dashboard-db.html',  // 改这里
    type: 'server',
    servay域名/dashboard-db.html
   ```
2. 检查是否能正常打开用户行为看板
3. 尝试输入用户ID和日期，测试AI分析功能

---

## 更新主看板配置

部署成功后，需要更新主看板的配置：

### 修改 main.js

找到用户行为看板的配分
3. 点击 "Generate Domain"
4. Railway会生成一个公网URL，例如：
   ```
   https://czx-user-behavior-production.up.railway.app
   ```
5. 复制这个URL

### 第6步：测试部署

1. 在浏览器中访问：
   ```
   https://你的railwy会设置PORT环境变量）

### 第4步：部署（3分钟）

1. 点击 "Deploy" 按钮
2. Railway开始构建和部署
3. 等待部署完成（约2-3分钟）
4. 部署成功后，会显示绿色的 "Active" 状态

### 第5步：获取URL

1. 在项目页面，点击 "Settings" 标签
2. 找到 "Domains" 部c23b4a5c8c54e922763
     ```
   - 点击 "Add" 保存

3. **检查配置**
   - Build Command: `npm install`（自动检测）
   - Start Command: `node server-with-db.js`（从Procfile读取）
   - 端口：自动分配（Railway会自动检测到这是一个Node.js项目

### 第3步：配置项目（2分钟）

1. **选择根目录**
   - Railway会询问要部署哪个目录
   - 选择：`用户行为看板（周度）`

2. **设置环境变量**
   - 点击 "Variables" 标签
   - 添加环境变量：
     ```
     DEEPSEEK_API_KEY=sk-22da5c080db842步：创建新项目（3分钟）

1. 登录后，点击 "New Project"
2. 选择 "Deploy from GitHub repo"
3. 在列表中找到并选择：`shockey0328/czx`
4. Railwa改（支持环境变量）
- ✅ railway.json 已创建
- ✅ Procfile 已创建
- ✅ package.json 已存在

## 部署步骤

### 第1步：注册Railway账号（2分钟）

1. 访问：https://railway.app
2. 点击右上角 "Login"
3. 选择 "Login with GitHub"
4. 授权Railway访问你的GitHub账号

### 第# Railway 部署步骤（10分钟完成）

## 准备工作 ✅

以下配置已完成：
- ✅ 端口配置已修