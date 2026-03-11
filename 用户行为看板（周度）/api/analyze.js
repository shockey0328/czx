// Vercel Serverless - AI 分析（从云存储拉取数据后调用 DeepSeek）
// 环境变量：DATA_BASE_URL（云存储根）、DEEPSEEK_API_KEY

import { fetchUserBehavior } from './cloudData.js';

function cors(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

function buildPrompt(userData, userDescription, analysisMode) {
  const logsText = userData.map(log => JSON.stringify(log)).join('\n');
  const hasUserQuestion = !!userDescription && userDescription.trim().length > 0;

  // 只要用户填写了「分析描述」，就以用户问题为主、优先回答
  let useSpecificMode = analysisMode === 'specific' || (hasUserQuestion && analysisMode !== 'standard');

  const base = `你是一个专业的用户行为分析专家，擅长从日志数据中洞察用户行为模式和产品问题。

产品背景：
czx（橙子学）是一款主要面向学生及家长的H5产品，提供优质的试卷资源。用户可以通过平板、手机、扫描二维码等多种渠道进入该产品，进行浏览、全预览、收藏、在线练习、下载、购买会员、使用AI学伴、查看试卷报告等各种行为。

分析要求：
输出简洁、专业、可直接放在用户日志看板上的分析内容，面向产品、运营，用于定位问题、发现使用习惯、优化产品。`;

  let prompt;
  if (useSpecificMode && hasUserQuestion) {
    // 用户有明确分析描述：整篇报告必须围绕该问题展开
    prompt = `${base}

【重要】用户本次希望分析的问题/需求如下，请整篇报告紧扣此问题展开，不要写成泛泛的时间线流水账：
「${userDescription.trim()}」

请针对上述问题，从用户行为日志中进行深度分析，按以下结构组织（若某部分与用户问题无关可简述）：

1. 问题定位与行为梳理：从日志中找出与用户问题相关的关键行为、路径和节点，必要时用简短时间线支撑
2. 原因与证据：结合日志推断可能原因，并列举具体埋点/行为作为依据
3. 数据支撑：相关行为的频次、顺序、异常模式，量化能说明问题的部分
4. 建议与结论：针对用户问题的可落地优化或结论

注意：必须围绕用户提出的「${userDescription.trim().slice(0, 50)}${userDescription.trim().length > 50 ? '…' : ''}」展开，只写有日志依据的内容，不编造，语言精炼、客观、业务导向。`;
  } else {
    // 未填分析描述或明确选择标准模式：四段式通用报告；若仍有「用户特别关注」则各段都需回应
    const extra = hasUserQuestion
      ? `

【用户特别关注】本次分析需重点回应以下问题，四个模块中都要体现与该问题相关的内容，不要忽略：
「${userDescription.trim()}」

`
      : '';
    prompt = `${base}${extra}

请严格按照以下格式输出，每个模块必须以指定的标题开头：

一、用户完整行为轨迹（时间线简述）
[按时间顺序描述用户行为：从哪里进入、访问次数、浏览页面顺序、关键点击与事件、最后退出位置${hasUserQuestion ? '；并指出与用户关注问题相关的行为节点' : ''}]

二、用户使用习惯与特征
[高频页面、高频操作、操作节奏、典型偏好${hasUserQuestion ? '；结合用户关注点说明' : ''}]

三、产品问题与体验卡点（重点）
[流程中断与返回、反复点击、长时间无操作、关键步骤未完成等；只写有日志依据的内容${hasUserQuestion ? '；重点分析与用户关注问题相关的卡点' : ''}]

四、产品&运营优化建议
[流程简化、引导加强、页面/按钮调整、流失召回与转化提升等${hasUserQuestion ? '；优先给出针对用户关注问题的建议' : ''}]

输出要求：必须包含上述四个模块，标题完整；不要使用表格；不要输出原始埋点数据；语言精炼、客观、业务导向。${hasUserQuestion ? '整篇分析必须围绕并回答「用户特别关注」中的问题。' : ''}`;
  }

  return { prompt: prompt + `\n\n用户行为日志数据：\n${logsText}`, useSpecificMode };
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
    const body = req.body || {};
    let userData = [];
    let userDescription = body.description || body.userDescription || '';
    const analysisMode = body.analysisMode || 'auto';

    // 方式一：前端传 userIds + startDate + endDate，从云存储拉取数据
    const userIds = body.userIds;
    const startDate = body.startDate;
    const endDate = body.endDate;
    if (userIds && Array.isArray(userIds) && userIds.length > 0 && startDate && endDate) {
      userData = await fetchUserBehavior(userIds, startDate, endDate);
      if (userData.length === 0) {
        return res.status(200).json({
          success: true,
          analysis: {
            trajectory: '未找到用户行为数据',
            habits: '无法分析用户习惯',
            issues: '无数据可分析',
            suggestions: '请检查用户ID和日期范围是否正确'
          },
          dataCount: 0
        });
      }
    } else if (body.logs && Array.isArray(body.logs) && body.logs.length > 0) {
      // 方式二：前端直接传 logs（兼容旧用法）
      userData = body.logs;
    } else {
      return res.status(400).json({ success: false, error: '请提供 userIds/startDate/endDate 或 logs' });
    }

    const { prompt, useSpecificMode } = buildPrompt(userData, userDescription, analysisMode);
    const raw = await callDeepSeek(prompt);
    const analysis = useSpecificMode
      ? { trajectory: raw, habits: '', issues: '', suggestions: '' }
      : parseAnalysisResult(raw);

    return res.status(200).json({
      success: true,
      analysis,
      dataCount: userData.length
    });
  } catch (error) {
    console.error('分析错误:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '分析过程中发生错误'
    });
  }
}
