# 上传数据到GitHub Releases

## 方案说明

使用GitHub Releases存储大数据文件，Vercel从GitHub下载数据。

### 优势
- ✅ 完全免费
- ✅ 无需额外注册云存储服务
- ✅ 文件可公开访问
- ✅ 支持大文件（单个文件最大2GB）

---

## 操作步骤

### 1. 创建Release

1. **访问GitHub仓库**
   ```
   https://github.com/shockey0328/czx
   ```

2. **点击"Releases"**
   - 在仓库页面右侧找到"Releases"
   - 或直接访问：https://github.com/shockey0328/czx/releases

3. **点击"Create a new release"**

4. **填写Release信息**
   - Tag version: `data-v1.0`
   - Release title: `用户行为数据 v1.0`
   - Description: `包含2026年2月26日至3月4日的用户行为数据（7个JSON文件）`

5. **上传数据文件**
   - 点击"Attach binaries by dropping them here or selecting them"
   - 选择以下文件上传：
     ```
     用户行为看板（周度）/data/2026-02-26.json
     用户行为看板（周度）/data/2026-02-27.json
     用户行为看板（周度）/data/2026-02-28.json
     用户行为看板（周度）/data/2026-03-01.json
     用户行为看板（周度）/data/2026-03-02.json
     用户行为看板（周度）/data/2026-03-03.json
     用户行为看板（周度）/data/2026-03-04.json
     ```

6. **发布Release**
   - 点击"Publish release"

---

## 获取文件URL

发布后，每个文件都会有一个公开的下载链接：

```
https://github.com/shockey0328/czx/releases/download/data-v1.0/2026-02-26.json
https://github.com/shockey0328/czx/releases/download/data-v1.0/2026-02-27.json
https://github.com/shockey0328/czx/releases/download/data-v1.0/2026-02-28.json
https://github.com/shockey0328/czx/releases/download/data-v1.0/2026-03-01.json
https://github.com/shockey0328/czx/releases/download/data-v1.0/2026-03-02.json
https://github.com/shockey0328/czx/releases/download/data-v1.0/2026-03-03.json
https://github.com/shockey0328/czx/releases/download/data-v1.0/2026-03-04.json
```

---

## 注意事项

### 上传时间
- 7个文件总大小约2GB
- 上传时间取决于网速
- 预计10-30分钟

### 文件限制
- 单个文件最大2GB ✅（你的文件都在300MB左右）
- Release总大小无限制
- 下载次数无限制

### 更新数据
以后要更新数据时：
1. 创建新的Release（如data-v1.1）
2. 上传新的数据文件
3. 更新Vercel代码中的URL

---

## 快速上传脚本

如果你安装了GitHub CLI，可以使用命令行上传：

```bash
# 安装GitHub CLI（如果还没安装）
# https://cli.github.com/

# 登录
gh auth login

# 创建Release并上传文件
gh release create data-v1.0 \
  --title "用户行为数据 v1.0" \
  --notes "包含2026年2月26日至3月4日的用户行为数据" \
  "用户行为看板（周度）/data/2026-02-26.json" \
  "用户行为看板（周度）/data/2026-02-27.json" \
  "用户行为看板（周度）/data/2026-02-28.json" \
  "用户行为看板（周度）/data/2026-03-01.json" \
  "用户行为看板（周度）/data/2026-03-02.json" \
  "用户行为看板（周度）/data/2026-03-03.json" \
  "用户行为看板（周度）/data/2026-03-04.json"
```

---

## 下一步

上传完成后，我会：
1. 创建Vercel版本的API
2. 从GitHub Releases读取数据
3. 部署到Vercel

---

**开始上传吧！完成后告诉我，我会继续配置Vercel。**
