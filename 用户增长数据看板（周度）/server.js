const path = require("path");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 8787);
const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "";

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.get("/healthz", (req, res) => {
  res.json({ ok: true, model: DEEPSEEK_MODEL, hasApiKey: Boolean(DEEPSEEK_API_KEY) });
});

app.post("/api/deepseek/analyze", async (req, res) => {
  try {
    if (!DEEPSEEK_API_KEY) {
      return res.status(400).json({ error: "未配置 DEEPSEEK_API_KEY" });
    }
    const { question, context } = req.body || {};
    const q = String(question || "").trim();
    if (!q) return res.status(400).json({ error: "question 不能为空" });

    const prompt = [
      "你是增长数据分析师，请基于给定周度看板数据回答问题。",
      "要求：",
      "1) 只围绕提供的数据回答，不要编造周次、百分比或渠道名。",
      "2) 回答简洁，给出结论 + 原因 + 1-3 条可执行建议。",
      "3) 若数据不足请明确写“当前数据不足以判断”。",
      "",
      "【看板上下文】",
      String(context || "无"),
      "",
      "【用户问题】",
      q
    ].join("\n");

    const resp = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        temperature: 0.2,
        messages: [
          { role: "system", content: "你是严谨的数据分析助手。" },
          { role: "user", content: prompt }
        ]
      })
    });

    const text = await resp.text();
    if (!resp.ok) {
      return res.status(resp.status).json({ error: "DeepSeek 调用失败", detail: text });
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: "DeepSeek 返回非 JSON", detail: text });
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: "DeepSeek 返回格式异常", detail: data });
    }

    return res.json({ reply: String(reply).trim() });
  } catch (err) {
    return res.status(500).json({ error: "服务内部错误", detail: String(err?.message || err) });
  }
});

app.get("/*rest", (req, res) => {
  res.sendFile(path.join(__dirname, "user-growth-dashboard.html"));
});

app.listen(PORT, () => {
  console.log(`Dashboard server listening on http://localhost:${PORT}`);
});

