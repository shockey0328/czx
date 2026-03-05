import express from 'express';
import cors from 'cors';
import fs from 'fs';
import csv from 'csv-parser';
import OpenAI from 'openai';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: 'sk-22da5c080db84c23b4a5c8c54e922763',
  baseURL: 'https://api.deepseek.com'
});

function readUserLogs(startDate, endDate, userIds) {
  return new Promise((resolve, reject) => {
    const logs = [];
    const csvPath = '26年3月3日用户行为日志.csv';
    
    if (!fs.existsSync(csvPath)) {
      reject(new Error('CSV文件不存在'));
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (userIds.includes(row.user_id || row.userId || row.USER_ID)) {
          logs.push(row);
        }
      })
      .on('end', () => {
        resolve(logs);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function analyzeWithDeepSeek(logs) {
  const logsText = logs.map(log => JSON.stringify(log)).join('\n');
  
  const prompt = `你是一个路径探索者，通过分析给定用户日志的URL路径，构建用户行为框架，并基于用户行为编织出用户可能经历的小故事，并融入合理的猜想来丰富这一旅程并根据用户的行为分析用户类型。

产品czx（橙子学）是一款主要面向学生及家长的H5产品，提供优质的试卷资源，用户可以通过平板、手机、扫描二维码等多种渠道进入该产品并进行浏览、全预览、收藏、在线练、下载、购买会员、使用AI学伴、查看试卷报告等各种行为。

你需要输出简洁、专业、可直接放在用户日志看板上的分析内容，面向产品、运营，用于定位问题、发现使用习惯、优化产品。

输出严格按以下 4 个模块，不要表格、不要原始埋点、不要多余格式：

一、用户完整行为轨迹（时间线简述）
按时间顺序，用通顺文字描述用户：
- 进入来源、访问频次
- 浏览过哪些页面、顺序如何
- 点击过哪些关键按钮、触发哪些事件
- 最终退出点

二、用户使用习惯与特征
- 高频访问页面
- 高频点击/操作
- 操作节奏（快速/反复/犹豫/重试）
- 典型偏好（如爱搜索、爱筛选、爱返回、爱查看详情）

三、产品问题与体验卡点（重点）
从行为反推用户可能遇到的问题，例如：
- 流程中断、多次返回
- 反复点击同一区域（疑似无响应/找不到）
- 长时间停留无操作（疑似困惑/加载慢）
- 关键步骤未完成（如加购不支付、填写不提交）
只写有日志依据的内容，不编造。

四、产品&运营优化建议
给出可落地、具体的建议：
- 流程简化
- 引导加强
- 页面结构/按钮位置
- 信息透明度
- 流失召回、转化提升方向

语言要求：精炼、客观、业务导向，适合产品/运营快速决策

用户日志数据：
${logsText}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个专业的用户行为分析专家，擅长从日志数据中洞察用户行为模式和产品问题。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const result = completion.choices[0].message.content;
    return parseAnalysisResult(result);
  } catch (error) {
    console.error('DeepSeek API错误:', error);
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
    if (line.includes('一、用户完整行为轨迹')) {
      currentSection = 'trajectory';
    } else if (line.includes('二、用户使用习惯与特征')) {
      currentSection = 'habits';
    } else if (line.includes('三、产品问题与体验卡点')) {
      currentSection = 'issues';
    } else if (line.includes('四、产品&运营优化建议')) {
      currentSection = 'suggestions';
    } else if (currentSection && line.trim()) {
      sections[currentSection] += line + '\n';
    }
  }

  return sections;
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { startDate, endDate, userIds } = req.body;

    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ error: '请提供用户ID' });
    }

    const logs = await readUserLogs(startDate, endDate, userIds);

    if (logs.length === 0) {
      return res.status(404).json({ error: '未找到相关用户日志' });
    }

    const analysis = await analyzeWithDeepSeek(logs);

    res.json(analysis);
  } catch (error) {
    console.error('分析错误:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
