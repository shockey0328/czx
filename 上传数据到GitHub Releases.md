# 上传数据到GitHub Releases

## 方案说明

使用GitHub Releases存储大数据文件，Vercel 从 GitHub 下载数据。

### 优势
- ✅ 完全免费
- ✅ 无需额外注册云存储服务
- ✅ 文件可公开访问
- ✅ 支持大文件（单个文件最大2GB）

---

## 当前需上传的数据文件（更新至 3 月 7 日）

线上 `api/getData.js` 已支持 2026-02-26 ～ 2026-03-08。请将本地已生成的 JSON 上传到同一 Release，线上即可选到对应日期。

| 日期 | 本地路径 |
|------|----------|
| 2026-02-26 | `用户行为看板（周度）/data/2026-02-26.json` |
| 2026-02-27 | `用户行为看板（周度）/data/2026-02-27.json` |
| 2026-02-28 | `用户行为看板（周度）/data/2026-02-28.json` |
| 2026-03-01 | `用户行为看板（周度）/data/2026-03-01.json` |
| 2026-03-02 | `用户行为看板（周度）/data/2026-03-02.json` |
| 2026-03-03 | `用户行为看板（周度）/data/2026-03-03.json` |
| 2026-03-04 | `用户行为看板（周度）/data/2026-03-04.json` |
| 2026-03-05 | `用户行为看板（周度）/data/2026-03-05.json` |
| 2026-03-06 | `用户行为看板（周度）/data/2026-03-06.json` |
| 2026-03-07 | `用户行为看板（周度）/data/2026-03-07.json` |
| 2026-03-08 | `用户行为看板（周度）/data/2026-03-08.json`（若已生成再上传） |

---

## 方式一：网页上传（推荐）

1. **打开 Releases 页面**
   - https://github.com/shockey0328/czx/releases

2. **若已有 data-v1.0**
   - 点击该 Release → “Edit release”
   - 在页面底部 “Attach binaries” 处**追加**上传上述 11 个（或 12 个）JSON 文件；若同名的已存在，可先删除旧资产再上传新的。

3. **若还没有 Release**
   - 点击 “Create a new release”
   - Tag: `data-v1.0`（或新建如 `data-v1.1`）
   - Title: `用户行为数据 v1.0`
   - Description: `2026-02-26 ～ 2026-03-07（及 03-08 若已生成）`
   - 上传上述所有 JSON 文件后点击 “Publish release”

4. **无需改代码**
   - `api/getData.js` 的 `AVAILABLE_DATES` 已包含 02-26～03-08，上传后 Vercel 自动用当前 Release 的下载地址拉取。

---

## 方式二：GitHub CLI 上传

在**仓库根目录**（即 `橙子学数据看板` 下）执行：

```bash
# 安装并登录 GitHub CLI：https://cli.github.com/
gh auth login

# 创建或更新 Release 并上传当前 11 个数据文件（不含 03-08 则去掉最后一行）
gh release create data-v1.0 --title "用户行为数据 v1.0" --notes "2026-02-26 至 2026-03-07 用户行为 JSON" ^
  "用户行为看板（周度）/data/2026-02-26.json" ^
  "用户行为看板（周度）/data/2026-02-27.json" ^
  "用户行为看板（周度）/data/2026-02-28.json" ^
  "用户行为看板（周度）/data/2026-03-01.json" ^
  "用户行为看板（周度）/data/2026-03-02.json" ^
  "用户行为看板（周度）/data/2026-03-03.json" ^
  "用户行为看板（周度）/data/2026-03-04.json" ^
  "用户行为看板（周度）/data/2026-03-05.json" ^
  "用户行为看板（周度）/data/2026-03-06.json" ^
  "用户行为看板（周度）/data/2026-03-07.json"
```

若已存在 `data-v1.0`，可先删除该 Release 再执行上述命令，或使用 `gh release upload data-v1.0 文件路径...` 追加资产。

---

## 获取文件 URL

发布后，文件下载链接形如：

```
https://github.com/shockey0328/czx/releases/download/data-v1.0/2026-02-26.json
...
https://github.com/shockey0328/czx/releases/download/data-v1.0/2026-03-07.json
```

Vercel 环境变量 `GITHUB_RELEASE_BASE_URL` 不填时默认使用 `.../releases/download/data-v1.0`，无需修改。

---

## 注意事项

- 单文件约 200–300MB，总上传时间视网速约 10–60 分钟。
- 单文件最大 2GB，当前文件均符合。
- 以后新增日期：本地 `import-new` 生成新 JSON 后，在同上 Release 里追加上传对应文件即可；若改用新 Tag（如 data-v1.1），需在 Vercel 中设置 `GITHUB_RELEASE_BASE_URL` 指向新 Tag。
