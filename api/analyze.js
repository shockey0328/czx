// Vercel Serverless - 方案 A：AI 分析（前端传入 logs，调用 DeepSeek）
// 环境变量：DEEPSEEK_API_KEY

function cors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function buildPrompt(logs, userDescription) {
  const logsText = Array.isArray(logs)
    ? logs.map(log => JSON.stringify(log)).join('\n')
    : String(logs);
  const hasSpecific = userDescription && (
    /为什么|问题|卡点|流失|转化|异常|错误|定位/.test(userDescription) ||
    (userDescription.includes('分析') && userDescription.length < 20)
  );
  const base = `你是一个专业的用户行为分析专家，擅长从日志数据中洞察用户行为模式和产品问题。

产品背景：
czx（橙子学）是一款主要面向学生及家长的H5产品，提供优质的试卷资源。用户可以通过平板、手机、扫描二维码等多种渠道进入该产品，进行浏览、全预览、收藏、在线练习、下载、购买会员、使用AI学伴、查看试卷报告等各种行为。

分析要求：
输出简洁、专业、可直接放在用户日志看板上的分析内容，面向产品、运营，用于定位问题、发现使用习惯、优化产品。`;

  let prompt;
  if (hasSpecific && userDescription) {
    prompt = `${base}

用户关注的具体问题：${userDescription}

请针对用户提出的问题，从用户行为日志中进行深度分析：

1. 问题定位：从日志中找出与问题相关的关键行为，识别异常模式或流程中断点，定位问题发生的具体环节
2. 原因分析：分析导致问题的可能原因，从用户行为路径中找出线索，结合产品流程推断问题根源
3. 数据支撑：列举具体的日志证据，统计相关行为的频次和模式，量化问题的影响范围
4. 解决建议：提供针对性的优化方案，给出可落地的改进措施，建议需要进一步验证的假设

注意：紧扣用户提出的问题进行分析，只写有日志依据的内容，不编造，语言精炼、客观、业务导向`;
  } else {
    const extra = userDescription ? `\n用户特别关注：${userDescription}\n\n` : '';
    prompt = `${base}${extra}

请严格按照以下 Markdown 格式输出（保留 ###、####、**加粗** 与列表结构）：

### **用户完整路径分析报告**

**分析目标：** 基于用户ID与时段内的行为日志，还原其完整操作路径，识别核心行为模式、潜在问题及优化机会。

#### **1. 问题定位：核心路径与异常模式**

**用户核心路径：** [用一段话概括该用户会话的主要路径模式，如探索-筛选-预览/下载等]

**路径一：[模块或场景名称]（[特征标签，如：高频、浅层浏览]）**
* **入口：** [从哪一页、通过什么入口进入]
* **行为：** [在该路径下的具体操作：点击、筛选、浏览顺序等]
* **特征：** [行为密集度、是否深度交互、用户意图概括]

**路径二：[模块或场景名称]（[特征标签]）**
* **入口：** [描述]
* **行为：** [描述]
* **特征：** [描述]

（如有更多典型路径，可继续 **路径三** …）

**关键异常与中断点：**
1. **[问题名称]：** [描述]。* **日志证据：** [引用具体 xyio_client_time 或关键日志片段]
2. [其他异常点…]

#### **2. 原因分析**（可选）
[对异常与中断点的可能原因做简要分析]

#### **3. 产品&运营优化建议**（可选）
[流程简化、引导加强、支付/转化优化等可落地建议]

输出要求：必须包含「用户完整路径分析报告」「分析目标」「1.问题定位」下的用户核心路径、路径一/二（含入口/行为/特征）、关键异常与中断点（含日志证据）；使用 **加粗** 标出标签；只写有日志依据的内容，不编造。`;
  }
  return { prompt: prompt + `\n\n用户行为日志数据：\n${logsText}`, hasSpecific };
}

function parseAnalysisResult(text) {
  const sections = { trajectory: '', habits: '', issues: '', suggestions: '' };
  const lines = text.split('\n');
  let currentSection = '';
  for (const line of lines) {
    if (line.match(/一[、．.].*用户.*行为.*轨迹/i) || line.match(/^#+\s*一[、．.]/)) {
      currentSection = 'trajectory';
      continue;
    }
    if (line.match(/二[、．.].*使用.*习惯/i) || line.match(/^#+\s*二[、．.]/)) {
      currentSection = 'habits';
      continue;
    }
    if (line.match(/三[、．.].*问题.*卡点/i) || line.match(/^#+\s*三[、．.]/)) {
      currentSection = 'issues';
      continue;
    }
    if (line.match(/四[、．.].*优化.*建议/i) || line.match(/^#+\s*四[、．.]/)) {
      currentSection = 'suggestions';
      continue;
    }
    if (currentSection && line.trim()) {
      sections[currentSection] += line + '\n';
    }
  }
  if (!sections.trajectory && !sections.habits && !sections.issues && !sections.suggestions) {
    sections.trajectory = text;
  }
  return sections;
}

async function callDeepSeek(prompt) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DeepSeek API密钥未配置（DEEPSEEK_API_KEY）');
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个专业的用户行为分析专家，擅长从日志数据中洞察用户行为模式和产品问题。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DeepSeek API 错误: ${res.status} ${err}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '';
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { logs, userDescription } = req.body || {};
    if (!logs || (Array.isArray(logs) && logs.length === 0)) {
      return res.status(400).json({ success: false, error: '没有提供用户行为日志数据（logs）' });
    }

    const { prompt, hasSpecific } = buildPrompt(logs, userDescription || '');
    const raw = await callDeepSeek(prompt);
    const dataCount = Array.isArray(logs) ? logs.length : 0;

    const analysis = hasSpecific
      ? { trajectory: raw, habits: '', issues: '', suggestions: '' }
      : parseAnalysisResult(raw);

    return res.status(200).json({
      success: true,
      analysis,
      dataCount
    });
  } catch (error) {
    console.error('分析错误:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '分析过程中发生错误'
    });
  }
}
