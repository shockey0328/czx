# 🎯 Railway获取URL详细步骤（图文版）

## 第1步：进入你的Railway项目

1. 打开浏览器，访问：https://railway.app
2. 登录你的账号
3. 找到并点击你刚才部署的 **czx** 项目

---

## 第2步：找到Settings（设置）

在项目页面，你会看到左侧或顶部有这些选项：
- **Overview**（概览）
- **Deployments**（部署）
- **Variables**（变量）← 你之前在这里添加了API Key
- **Settings**（设置）← **点这里**

---

## 第3步：生成域名

在Settings页面中：

1. 找到 **Networking** 或 **Domains** 部分
2. 你会看到一个按钮：**Generate Domain** 或 **Add Domain**
3. 点击这个按钮
4. Railway会自动生成一个域名，类似：
   ```
   https://czx-production-a1b2c3d4.up.railway.app
   ```
5. 复制这个完整的URL（包括https://）

---

## 第4步：使用自动化脚本更新

1. 双击运行 **更新Railway URL.bat**
2. 粘贴你刚才复制的Railway URL
3. 按回车确认
4. 脚本会自动：
   - 更新main.js中的URL
   - 提交到Git
   - 推送到GitHub

---

## 🎉 完成！

更新完成后，你的线上看板就可以正常访问用户行为看板了！

---

## 💡 常见问题

### Q: 找不到Generate Domain按钮？
A: 可能在不同的位置，试试这些地方：
- Settings → Networking
- Settings → Domains
- Deployments → 点击某个部署 → Settings

### Q: Railway URL是什么样的？
A: 通常格式为：
```
https://项目名-production-随机字符.up.railway.app
```
或
```
https://随机字符.railway.app
```

### Q: 需要付费吗？
A: Railway的免费额度足够使用，生成域名是免费的。

---

## 📞 需要帮助？

如果遇到问题，可以：
1. 截图发给我，我帮你看
2. 把Railway界面的文字描述发给我
3. 直接把生成的URL发给我，我手动帮你更新
