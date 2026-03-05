// Vercel Serverless Function - AI分析
export default async function handler(req, res) {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { logs, userDescription } = req.body;

    if (!logs || logs.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '没有提供用户行为日志数据' 
      });
    }

    // 准备日志文本
    const logsText = logs.map(log => {
      return `时间: ${log.xyio_client_time}, 用户: ${log.user_id}, 事件: ${log.log_event_type}, URL: ${log.url}, 元素: ${log.element_content || log.element_name || ''}`;
    }).join('\n');

    // 判断是否有具体问题
    const hasSpecificQuestion = userDescription && (
      userDescription.includes('为什么') || 
      userDescription.includes('问题') ||
      userDescription.includes('卡点') ||
      userDescription.includes('流失') ||
      userDescription.includes('转化') ||
      userDescription.includes('异常') ||
      userDescription.includes('错误') ||
      userDescription.includes('定位') ||
      (userDescription.includes('分析') && userDescription.length < 20)
    );

    // 构建prompt
    let prompt;
    if (hasSpecificQuestion) {
      // 针对性问题分析
      prompt = `你是一个专业的用户行为分析专家，擅长从日志数据中洞察用户行为模式和产品问题。

产品背景：
czx（橙子学）是一款主要面向学生及家长的H5产品，提供优质的试卷资源。用户可以通过平板、手机、扫描二维码等多种渠道进入该产品，进行浏览、全预览、收藏、在线练习、下载、购买会员、使用AI学伴、查看试卷报告等各种行为。

分析要求：
输出简洁、专业、可直接放在用户日志看板上的分析内容，面向产品、运营，用于定位问题、发现使用习惯、优化产品。

用户关注的具体问题：${userDescription}

请针对用户提出的问题，从用户行为日志中进行深度分析：

1. 问题定位：
   - 从日志中找出与问题相关的关键行为
   - 识别异常模式或流程中断点
   - 定位问题发生的具体环节

2. 原因分析：
   - 分析导致问题的可能原因
   - 从用户行为路径中找出线索
   - 结合产品流程推断问题根源

3. 数据支撑：
   - 列举具体的日志证据
   - 统计相关行为的频次和模式
   - 量化问题的影响范围

4. 解决建议：
   - 提供针对性的优化方案
   - 给出可落地的改进措施
   - 建议需要进一步验证的假设

注意：
- 紧扣用户提出的问题进行分析
- 只写有日志依据的内容，不编造
- 语言精炼、客观、业务导向

用户行为日志数据：
${logsText}`;
    } else {
      // 标准四模块分析
      prompt = `你是一个专业的用户行为分析专家，擅长从日志数据中洞察用户行为模式和产品问题。

产品背景：
czx（橙子学）是一款主要面向学生及家长的H5产品，提供优质的试卷资源。用户可以通过平板、手机、扫描二维码等多种渠道进入该产品，进行浏览、全预览、收藏、在线练习、下载、购买会员、使用AI学伴、查看试卷报告等各种行为。

分析要求：
输出简洁、专业、可直接放在用户日志看板上的分析内容，面向产品、运营，用于定位问题、发现使用习惯、优化产品。

${userDescription ? `用户特别关注：${userDescription}\n\n` : ''}请严格按照以下格式输出，每个模块必须以指定的标题开头：

一、用户完整行为轨迹（时间线简述）
[在这里按时间顺序描述用户行为]
- 用户从哪里进入，访问了多少次
- 浏览了哪些页面，按什么顺序
- 点击了哪些关键按钮，触发了什么事件
- 最后在哪里退出

二、用户使用习惯与特征
[在这里描述用户的使用习惯]
- 高频访问的页面有哪些
- 高频点击的操作是什么
- 操作节奏如何（快速/反复/犹豫/重试）
- 典型偏好（如爱搜索、爱筛选、爱返回、爱查看详情）

三、产品问题与体验卡点（重点）
[在这里指出发现的问题]
- 流程中断、多次返回的情况
- 反复点击同一区域（疑似无响应/找不到）
- 长时间停留无操作（疑似困惑/加载慢）
- 关键步骤未完成（如加购不支付、填写不提交）
注意：只写有日志依据的内容，不编造

四、产品&运营优化建议
[在这里给出具体建议]
- 流程简化的方向
- 引导加强的位置
- 页面结构/按钮位置的调整
- 信息透明度的提升
- 流失召回、转化提升的方向

输出要求：
1. 必须包含上述四个模块，每个模块标题必须完整
2. 不要使用表格
3. 不要输出原始埋点数据
4. 语言精炼、客观、业务导向
5. 适合产品/运营快速决策

用户行为日志数据：
${logsText}`;
    }

    // 调用DeepSeek API
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'DeepSeek API密钥未配置'
      });
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API错误:', errorText);
      return res.status(500).json({
        success: false,
        error: `AI分析失败: ${response.status} ${response.statusText}`
      });
    }

    const result = await response.json();
    const analysis = result.choices[0].message.content;

    return res.status(200).json({
      success: true,
      analysis: analysis
    });

  } catch (error) {
    console.error('分析错误:', error);
    return res.status(500).json({
      success: false,
      error: error.message || '分析过程中发生错误'
    });
  }
}
