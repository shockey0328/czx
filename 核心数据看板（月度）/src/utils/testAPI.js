import axios from 'axios';

// 测试DeepSeek API连接
export const testDeepSeekAPI = async (apiKey) => {
  try {
    console.log('🧪 测试DeepSeek API连接...');
    
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: '请简单回复"API连接成功"'
        }
      ],
      temperature: 0.1,
      max_tokens: 50
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10秒超时
    });

    console.log('✅ API测试成功:', response.data);
    return {
      success: true,
      message: 'API连接成功',
      response: response.data.choices[0].message.content
    };
  } catch (error) {
    console.error('❌ API测试失败:', error);
    
    let errorMessage = 'API连接失败';
    
    if (error.response) {
      // 服务器返回错误
      const status = error.response.status;
      const data = error.response.data;
      
      switch (status) {
        case 401:
          errorMessage = 'API密钥无效或已过期';
          break;
        case 403:
          errorMessage = 'API密钥权限不足';
          break;
        case 429:
          errorMessage = 'API调用频率超限，请稍后重试';
          break;
        case 500:
          errorMessage = 'DeepSeek服务器内部错误';
          break;
        default:
          errorMessage = `API错误 (${status}): ${data?.error?.message || '未知错误'}`;
      }
    } else if (error.request) {
      // 网络错误
      errorMessage = '网络连接失败，请检查网络设置';
    } else {
      // 其他错误
      errorMessage = error.message || '未知错误';
    }
    
    return {
      success: false,
      message: errorMessage,
      error: error
    };
  }
};

// 测试数据分析功能
export const testDataAnalysis = async (apiKey, sampleData) => {
  try {
    console.log('🧪 测试数据分析功能...');
    
    const prompt = `
请分析以下数据并返回JSON格式：
月活用户：${sampleData.月活}
营收：${sampleData.营收}
留存率：${sampleData.次月留存}%

请严格按照以下JSON格式返回：
{
  "keyChanges": "关键变化描述",
  "trends": "趋势分析", 
  "suggestions": ["建议1", "建议2", "建议3"]
}
`;

    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const aiResponse = response.data.choices[0].message.content;
    console.log('🤖 AI原始响应:', aiResponse);
    
    // 尝试解析JSON
    try {
      const parsedResponse = JSON.parse(aiResponse);
      console.log('✅ JSON解析成功:', parsedResponse);
      
      return {
        success: true,
        message: '数据分析功能正常',
        data: parsedResponse
      };
    } catch (parseError) {
      console.warn('⚠️ JSON解析失败，但API调用成功');
      return {
        success: true,
        message: 'API调用成功，但响应格式需要调整',
        rawResponse: aiResponse,
        parseError: parseError.message
      };
    }
    
  } catch (error) {
    console.error('❌ 数据分析测试失败:', error);
    return {
      success: false,
      message: '数据分析功能测试失败',
      error: error
    };
  }
};