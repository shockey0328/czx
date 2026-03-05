import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import UserBehaviorDB from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const db = new UserBehaviorDB();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// 获取用户行为数据
app.post('/api/getData', async (req, res) => {
  console.log('\n=== 收到数据请求 ===');
  console.log('请求体:', req.body);
  
  try {
    const { startDate, endDate, userIds } = req.body;
    
    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供用户ID' 
      });
    }
    
    console.log(`查询用户: ${userIds.join(', ')}`);
    console.log(`日期范围: ${startDate} 到 ${endDate}`);
    
    const results = await db.queryUserBehavior(userIds, startDate, endDate);
    
    console.log(`查询结果: ${results.length} 条记录`);
    
    res.json({
      success: true,
      data: results,
      totalRecords: results.length,
      userIds: userIds,
      dateRange: { startDate, endDate }
    });
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 获取数据库统计信息
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('获取统计信息失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// AI分析接口
app.post('/api/analyze', async (req, res) => {
  try {
    const { userIds, startDate, endDate, description, analysisMode } = req.body;
    
    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: '请提供用户ID' 
      });
    }
    
    // 获取用户数据
    const userData = await db.queryUserBehavior(userIds, startDate, endDate);
    
    if (userData.length === 0) {
      return res.json({
        success: true,
        analysis: {
          trajectory: '未找到用户行为数据',
          habits: '无法分析用户习惯',
          issues: '无数据可分析',
          suggestions: '请检查用户ID和日期范围是否正确'
        }
      });
    }
    
    // 调用DeepSeek API进行分析，传入分析模式
    const analysis = await analyzeWithDeepSeek(userData, description, analysisMode);
    
    res.json({
      success: true,
      analysis,
      dataCount: userData.length
    });
  } catch (error) {
    console.error('分析失败:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// DeepSeek AI分析
async function analyzeWithDeepSeek(userData, userDescription, analysisMode = 'auto') {
  const logsText = userData.map(log => JSON.stringify(log)).join('\n');
  
  // 判断分析模式
  let useSpecificMode = false;
  
  if (analysisMode === 'specific') {
    // 用户手动选择针对性问题模式
    useSpecificMode = true;
  } else if (analysisMode === 'standard') {
    // 用户手动选择常规分析模式
    useSpecificMode = false;
  } else {
    // 自动判断模式（保留原有逻辑）
    useSpecificMode = userDescription && (
      userDescription.includes('为什么') || 
      userDescription.includes('问题') ||
      userDescription.includes('卡点') ||
      userDescription.includes('流失') ||
      userDescription.includes('转化') ||
      userDescription.includes('异常') ||
      userDescription.includes('错误') ||
      userDescription.includes('定位') ||
      userDescription.includes('分析') && userDescription.length < 20
    );
  }
  
  let prompt = `你是一个专业的用户行为分析专家，擅长从日志数据中洞察用户行为模式和产品问题。

产品背景：
czx（橙子学）是一款主要面向学生及家长的H5产品，提供优质的试卷资源。用户可以通过平板、手机、扫描二维码等多种渠道进入该产品，进行浏览、全预览、收藏、在线练习、下载、购买会员、使用AI学伴、查看试卷报告等各种行为。

分析要求：
输出简洁、专业、可直接放在用户日志看板上的分析内容，面向产品、运营，用于定位问题、发现使用习惯、优化产品。`;

  if (useSpecificMode && userDescription) {
    // 有具体问题指向时，进行针对性分析
    prompt += `

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
- 语言精炼、客观、业务导向`;
  } else {
    // 没有具体问题时，提供标准的四模块分析
    if (userDescription) {
      prompt += `\n\n用户特别关注：${userDescription}`;
    }
    
    prompt += `

请严格按照以下格式输出，每个模块必须以指定的标题开头：

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

示例格式：
一、用户完整行为轨迹（时间线简述）
用户于2月26日通过搜索引擎进入产品首页，当天访问3次。首次访问浏览了首页、搜索页、试卷详情页，点击了"全预览"按钮。第二次访问直接进入搜索结果页，查看了5份试卷。第三次访问在试卷详情页停留较长时间后退出。

二、用户使用习惯与特征
高频访问页面为搜索页和试卷详情页。高频操作包括搜索、查看试卷详情、全预览。操作节奏较快，平均每个页面停留30秒。典型偏好为爱搜索、爱查看详情，较少使用筛选功能。

三、产品问题与体验卡点（重点）
发现用户在试卷详情页多次返回搜索页，疑似未找到想要的内容。用户在"下载"按钮区域反复点击，可能存在响应问题。用户在会员购买页面停留后直接退出，未完成支付流程。

四、产品&运营优化建议
建议优化搜索结果的相关性，减少用户返回次数。检查下载功能的响应速度，确保按钮可点击状态明确。在会员购买页面增加引导说明，提升转化率。考虑增加试卷推荐功能，减少用户搜索成本。`;
  }

  prompt += `

用户行为日志数据：
${logsText}`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-22da5c080db84c23b4a5c8c54e922763'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一个专业的用户行为分析专家，擅长从日志数据中洞察用户行为模式和产品问题。你能够根据用户的具体问题进行针对性分析，也能提供全面的行为分析报告。' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error('DeepSeek API请求失败');
    }

    const data = await response.json();
    const result = data.choices[0].message.content;
    
    console.log('\n=== AI返回内容 ===');
    console.log(result.substring(0, 500));
    console.log('...\n');
    
    // 如果是具体问题分析，直接返回文本
    if (useSpecificMode) {
      return {
        trajectory: result,
        habits: '',
        issues: '',
        suggestions: ''
      };
    }
    
    // 否则按四模块解析
    const parsed = parseAnalysisResult(result);
    console.log('=== 解析结果 ===');
    console.log('trajectory长度:', parsed.trajectory.length);
    console.log('habits长度:', parsed.habits.length);
    console.log('issues长度:', parsed.issues.length);
    console.log('suggestions长度:', parsed.suggestions.length);
    console.log('');
    
    return parsed;
  } catch (error) {
    console.error('DeepSeek分析失败:', error);
    throw error;
  }
}

function parseAnalysisResult(text) {
  const sections = {
    trajectory: '',
    habits: '',
    issues: '',
    suggestions: ''
  };

  const lines = text.split('\n');
  let currentSection = '';

  for (const line of lines) {
    // 更灵活的匹配模式
    if (line.match(/一[、．.].*用户.*行为.*轨迹/i) || line.match(/^#+\s*一[、．.]/)) {
      currentSection = 'trajectory';
      continue;
    } else if (line.match(/二[、．.].*使用.*习惯/i) || line.match(/^#+\s*二[、．.]/)) {
      currentSection = 'habits';
      continue;
    } else if (line.match(/三[、．.].*问题.*卡点/i) || line.match(/^#+\s*三[、．.]/)) {
      currentSection = 'issues';
      continue;
    } else if (line.match(/四[、．.].*优化.*建议/i) || line.match(/^#+\s*四[、．.]/)) {
      currentSection = 'suggestions';
      continue;
    }
    
    // 添加内容到当前section
    if (currentSection && line.trim()) {
      sections[currentSection] += line + '\n';
    }
  }

  // 如果解析失败（所有section都为空），将全部内容放到trajectory
  if (!sections.trajectory && !sections.habits && !sections.issues && !sections.suggestions) {
    sections.trajectory = text;
  }

  return sections;
}

// 启动服务器
app.listen(PORT, async () => {
  console.log(`\n========================================`);
  console.log(`用户行为分析服务器运行在 http://localhost:${PORT}`);
  console.log(`请访问: http://localhost:${PORT}/dashboard-db.html`);
  console.log(`========================================\n`);
  
  console.log('正在初始化数据库...');
  try {
    await db.initialize();
    const stats = await db.getStats();
    console.log(`\n数据库就绪！`);
    console.log(`- 总用户数: ${stats.totalUsers}`);
    console.log(`- 总记录数: ${stats.totalRecords}`);
    console.log(`- 可用日期: ${stats.availableDates.length} 天`);
    if (stats.dateRange) {
      console.log(`- 日期范围: ${stats.dateRange.start} 到 ${stats.dateRange.end}`);
    }
    console.log('');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
});