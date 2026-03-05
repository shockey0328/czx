# Vercel CLI部署指南

## ✅ 已完成

1. ✅ Vercel CLI已安装
2. ✅ 已登录Vercel账号

## 📝 部署步骤

### 方法1：使用命令行（推荐）

打开命令行，运行：

```bash
vercel --prod
```

然后按照提示操作：

#### 问题1：Set up and deploy "E:\橙子学数据看板\橙子学数据看板"?
```
回答：Y (按Enter)
```

#### 问题2：Which scope do you want to deploy to?
```
选择你的Vercel账号（通常是默认的）
按Enter
```

#### 问题3：Link to existing project?
```
如果之前创建过项目：Y
如果是第一次部署：N
```

#### 问题4：What's your project's name?
```
输入：czx-dashboard
或者使用默认名称
按Enter
```

#### 问题5：In which directory is your code located?
```
输入：./
按Enter
```

### 方法2：使用批处理文件

双击运行：`Vercel直接部署.bat`

按照屏幕提示操作即可。

## 🎯 部署完成后

### 1. 获取URL

部署成功后会显示：
```
✅ Production: https://your-project.vercel.app
```

### 2. 测试搜索看板

访问：
```
https://your-project.vercel.app/搜索数据看板（周度）/index.html
```

或者如果配置了路由：
```
https://your-project.vercel.app/
```

### 3. 验证修复

打开浏览器开发者工具（F12），应该看到：
```
✅ ECharts加载成功
✅ 词云插件加载成功
ECharts已就绪，加载app.js
```

所有图表应该正常显示：
- ✅ 热词分析
- ✅ 词云图
- ✅ 搜索行为漏斗
- ✅ 搜索转化趋势
- ✅ 搜索功能留存

## 🔄 更新部署

以后要更新时，只需要：

```bash
vercel --prod
```

Vercel会自动检测文件变化并重新部署。

## 💡 优势

使用Vercel CLI直接部署的优势：

1. ✅ 绕过GitHub推送问题
2. ✅ 部署速度快（直接上传）
3. ✅ 可以本地测试后再部署
4. ✅ 支持增量部署

## 📊 部署配置

### vercel.json

当前配置：
```json
{
  "version": 2,
  "name": "czx-dashboard",
  "functions": {
    "用户行为看板（周度）/api/*.js": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    { "source": "/user-behavior", "destination": "/用户行为看板（周度）/dashboard-vercel.html" }
  ]
}
```

## 🐛 常见问题

### 问题1：部署失败

**错误：** Build failed

**解决：**
1. 检查vercel.json配置
2. 确认所有文件都存在
3. 查看错误日志

### 问题2：图表不显示

**错误：** ECharts加载失败

**解决：**
1. 检查网络连接
2. 清除浏览器缓存
3. 强制刷新（Ctrl+Shift+R）

### 问题3：找不到项目

**错误：** Project not found

**解决：**
1. 运行 `vercel link` 重新链接项目
2. 或者创建新项目

## 🎯 下一步

1. **运行部署命令**
   ```bash
   vercel --prod
   ```

2. **按照提示操作**
   - 回答几个简单问题
   - 等待部署完成

3. **测试线上地址**
   - 访问Vercel提供的URL
   - 测试搜索看板
   - 确认图表正常

4. **记录URL**
   - 保存Vercel URL
   - 更新main.js（如果需要）

## 📝 部署检查清单

- [ ] Vercel CLI已安装
- [ ] 已登录Vercel
- [ ] 运行 `vercel --prod`
- [ ] 回答配置问题
- [ ] 部署成功
- [ ] 获取生产URL
- [ ] 测试搜索看板
- [ ] 图表正常显示

---

**准备好了吗？运行 `vercel --prod` 开始部署！**
