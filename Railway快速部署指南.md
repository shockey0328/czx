# Railway 快速部署指南

## 准备工作 ✅ 已完成

- ✅ 端口配置已修改
- ✅ railway.json 已创建
- ✅ Procfile 已创建

## 5步完成部署

### 1. 注册Railway
- 访问：https://railway.app
- 用GitHub登录

### 2. 创建项目
- 点击 "New Project"
- 选择 "Deploy from GitHub repo"
- 选择：`shockey0328/czx`

### 3. 配置
- 选择目录：`用户行为看板（周度）`
- 添加环境变量：
  ```
  DEEPSEEK_API_KEY=sk-22da5c080db84c23b4a5c8c54e922763
  ```

### 4. 部署
- 点击 "Deploy"
- 等待2-3分钟

### 5. 获取URL
- 点击 "Settings" → "Domains"
- 点击 "Generate Domain"
- 复制URL（如：https://xxx.railway.app）

## 更新主看板

修改 main.js：
```javascript
'user-behavior-weekly': {
    name: '用户行为',
    path: 'https://你的railway域名/dashboard-db.html',
    ...
}
```

推送到GitHub即可！
