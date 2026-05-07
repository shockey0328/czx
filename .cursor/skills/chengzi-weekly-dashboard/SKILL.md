---
name: chengzi-weekly-dashboard
description: >
  数据看板「周度」子页面的统一视觉与信息架构规范。
  触发词："周度看板"、"统一主题"、"weekly-dashboard-theme"、子看板样式对齐。
  适用于：新增或改版**周度 / 月度**数据看板、与门户 iframe 嵌套一致、品牌/层级统一（月度与周度共用同一套令牌，勿另起冷灰底或第二套主橙）。
---

# 周度看板统一规范

本 skill 与仓库根目录 `weekly-dashboard-theme.css` 配套使用，目标：**同一门户、同一周期（周度）、不同数据模块**，用户切换下拉或 iframe 时一眼识别为同一家族。

## 设计原则（对齐偏执型设计顾问 / qiaomu-design-advisor）

1. **一个主色**：`#FF6B35`，禁止再引入第二套品牌橙（如 `#FF7043`、`#EA580C` 混用作为主色）。
2. **暖灰背景**：页面底 `#f6f4f1`，不用冷灰 `#f5f5f5` 作主背景。
3. **顶栏信息层级**：模块主标题（主色、字重 700）+ 可选副标题/说明（muted）；**不要**在子看板顶栏强行增加「产品名 · 周期」等重复前缀行。
4. **控件**：周选择器使用圆角矩形或药丸形，focus 时 `box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.18)` 与主色描边一致。
5. **数字**：关键指标使用 `font-variant-numeric: tabular-nums`。

## 技术约定

| 项 | 要求 |
|----|------|
| 共用样式 | 子页面 `<head>` 中增加 `<link rel="stylesheet" href="../weekly-dashboard-theme.css">`（路径按目录深度调整；月度看板同样链接此文件） |
| CSS 变量 | 使用 `weekly-dashboard-theme.css` 中 `:root` 的 `--color-*`，勿在子页重复定义另一套 `:root` |
| 门户 | 根目录 `index.html` + `styles.css` 使用相同令牌，iframe 背景与 `--color-bg` 一致，避免「外灰内白」跳变 |

## 交付前自检

- [ ] 顶栏是否包含清晰的模块名与（可选）说明？
- [ ] 主色是否全部为 `#FF6B35`（允许渐变中使用 `#ffb088` 作辅助）？
- [ ] 页面背景是否为 `#f6f4f1`？
- [ ] 是否已链接 `weekly-dashboard-theme.css`？
- [ ] **结构**：主内容是否为 `<main>`，大区块是否为 `<section aria-labelledby="…">`，阅读顺序是否为「核心指标 → 趋势 → B端 → 智能解读」？趋势区间控件是否使用 `.trend-range-toggle` / `.trend-range-btn`（避免与门户 `.period-btn` 混名）？

## 参考文件

- 令牌与工具类：`weekly-dashboard-theme.css`
- 门户：`index.html`、`styles.css`、`main.js`
- 范例实现：`核心数据看板（周度）/index.html`、`搜索数据看板（周度）/index.html`、`用户增长数据看板（周度）/user-growth-dashboard.html`、`user-behavior.html`（根目录，周度入口中的用户行为）
