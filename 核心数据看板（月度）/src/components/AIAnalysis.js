import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { testDeepSeekAPI, testDataAnalysis } from '../utils/testAPI';
import './AIAnalysis.css';

const AIAnalysis = ({ currentData, allData, selectedMonth }) => {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (currentData && allData.length > 0) {
      generateAnalysis();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentData, selectedMonth]);

  const testAPI = async () => {
    const apiKey = process.env.REACT_APP_API_KEY;
    
    if (!apiKey || apiKey === 'sk-your-actual-deepseek-api-key-here') {
      setTestResult({
        success: false,
        message: '请先在.env文件中配置有效的API密钥'
      });
      return;
    }
    
    setLoading(true);
    setTestResult(null);
    
    try {
      // 基础连接测试
      console.log('🔍 开始API测试...');
      const basicTest = await testDeepSeekAPI(apiKey);
      
      if (basicTest.success) {
        // 数据分析功能测试
        const analysisTest = await testDataAnalysis(apiKey, currentData);
        setTestResult(analysisTest);
      } else {
        setTestResult(basicTest);
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: '测试过程中发生错误',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async () => {
    setLoading(true);
    setError('');

    try {
      // 准备分析数据
      const [currentYear, currentMonth] = selectedMonth.split('-').map(Number);
      
      // 获取最近3个月数据用于趋势分析
      const currentIndex = allData.findIndex(row => row.年份 === currentYear && row.月份 === currentMonth);
      const recentData = allData.slice(Math.max(0, currentIndex - 2), currentIndex + 1);
      
      // 获取上月和去年同期数据
      const lastMonthData = allData.find(row => {
        if (currentMonth === 1) {
          return row.年份 === currentYear - 1 && row.月份 === 12;
        }
        return row.年份 === currentYear && row.月份 === currentMonth - 1;
      });
      
      const lastYearData = allData.find(row => 
        row.年份 === currentYear - 1 && row.月份 === currentMonth
      );

      // 构建分析提示词
      const prompt = `
作为数据分析专家，请分析以下月度核心数据：

当前月份：${currentYear + 2000}年${currentMonth}月
当前数据：
- 月活：${currentData.月活.toLocaleString()}
- 次月留存：${currentData.次月留存}%
- 营收：${currentData.营收.toLocaleString()}
- 订单：${currentData.订单.toLocaleString()}
- ARPU：${currentData.ARPU}
- ARPPU：${currentData.ARPPU}
- 深度访问率：${currentData.深度访问率}%
- 使用率：${currentData.使用率}%
- 大会员活跃率：${currentData.大会员活跃率}%

${lastMonthData ? `上月对比：
- 月活环比：${((currentData.月活 - lastMonthData.月活) / lastMonthData.月活 * 100).toFixed(2)}%
- 营收环比：${((currentData.营收 - lastMonthData.营收) / lastMonthData.营收 * 100).toFixed(2)}%
- ARPU环比：${((currentData.ARPU - lastMonthData.ARPU) / lastMonthData.ARPU * 100).toFixed(2)}%` : ''}

${lastYearData ? `去年同期对比：
- 月活同比：${((currentData.月活 - lastYearData.月活) / lastYearData.月活 * 100).toFixed(2)}%
- 营收同比：${((currentData.营收 - lastYearData.营收) / lastYearData.营收 * 100).toFixed(2)}%
- ARPU同比：${((currentData.ARPU - lastYearData.ARPU) / lastYearData.ARPU * 100).toFixed(2)}%` : ''}

最近3个月趋势：
${recentData.map(row => `${row.年份 + 2000}年${row.月份}月 - 月活:${row.月活.toLocaleString()}, 营收:${row.营收.toLocaleString()}, ARPU:${row.ARPU}`).join('\n')}

请严格按照以下JSON格式返回分析结果，不要包含任何其他文字：
{
  "keyChanges": "关键变化分析内容（50字以内）",
  "trends": "增长趋势分析内容（50字以内）", 
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
        max_tokens: 500
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      
      try {
        // 尝试解析JSON响应
        const parsedResponse = JSON.parse(aiResponse);
        setAnalysis(parsedResponse);
      } catch (parseError) {
        // 如果解析失败，使用备用分析
        console.warn('AI响应解析失败，使用备用分析');
        const fallbackAnalysis = generateFallbackAnalysis();
        setAnalysis(fallbackAnalysis);
      }
    } catch (err) {
      console.error('AI分析失败:', err);
      setError('AI分析服务暂时不可用，请稍后重试');
      
      // 提供备用分析
      const fallbackAnalysis = generateFallbackAnalysis();
      setAnalysis(fallbackAnalysis);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackAnalysis = () => {
    if (!currentData) return { keyChanges: '', trends: '', suggestions: [] };

    const [currentYear, currentMonth] = selectedMonth.split('-').map(Number);
    const lastMonthData = allData.find(row => {
      if (currentMonth === 1) {
        return row.年份 === currentYear - 1 && row.月份 === 12;
      }
      return row.年份 === currentYear && row.月份 === currentMonth - 1;
    });

    let keyChanges = `本月月活${currentData.月活.toLocaleString()}，`;
    let trends = `数据表现`;
    let suggestions = [];
    
    if (lastMonthData) {
      const userChange = ((currentData.月活 - lastMonthData.月活) / lastMonthData.月活 * 100).toFixed(1);
      const revenueChange = ((currentData.营收 - lastMonthData.营收) / lastMonthData.营收 * 100).toFixed(1);
      
      keyChanges += `环比${userChange > 0 ? '增长' : '下降'}${Math.abs(userChange)}%，营收${revenueChange > 0 ? '增长' : '下降'}${Math.abs(revenueChange)}%`;
    }
    
    if (currentData.次月留存 >= 40) {
      trends += `良好，留存率${currentData.次月留存}%，使用率${currentData.使用率}%`;
    } else {
      trends += `需关注，留存率${currentData.次月留存}%偏低`;
    }
    
    suggestions = [
      '加强用户活跃度运营',
      '优化产品功能体验', 
      '提升付费转化效率'
    ];

    return { keyChanges, trends, suggestions };
  };

  if (!currentData) return null;

  return (
    <div className="ai-analysis">
      <div className="card">
        <h2 className="ai-header">AI 数据分析</h2>
        
        <div className="analysis-content">
          {loading && (
            <div className="analysis-loading">
              <div className="loading-spinner"></div>
              <p>AI正在分析数据...</p>
            </div>
          )}
          
          {error && (
            <div className="analysis-error">
              <p>{error}</p>
            </div>
          )}
          
          {analysis && !loading && (
            <div className="analysis-grid">
              <div className="analysis-section">
                <div className="analysis-section-header">
                  <div className="analysis-section-icon"></div>
                  <h3 className="analysis-section-title">核心表现</h3>
                </div>
                <div className="analysis-section-content">
                  <div>活跃用户</div>
                  <div style={{fontSize: '20px', fontWeight: '600', color: '#FF6B35', margin: '4px 0'}}>
                    {currentData.月活.toLocaleString()}
                  </div>
                  <div>营收</div>
                  <div style={{fontSize: '20px', fontWeight: '600', color: '#FF6B35', margin: '4px 0'}}>
                    {(currentData.营收 / 10000).toFixed(1)}万
                  </div>
                </div>
              </div>
              
              <div className="analysis-section">
                <div className="analysis-section-header">
                  <div className="analysis-section-icon"></div>
                  <h3 className="analysis-section-title">关键变化</h3>
                </div>
                <div className="analysis-section-content">
                  {analysis.keyChanges || '暂无数据'}
                </div>
              </div>
              
              <div className="analysis-section">
                <div className="analysis-section-header">
                  <div className="analysis-section-icon"></div>
                  <h3 className="analysis-section-title">策略建议</h3>
                </div>
                <div className="analysis-section-content">
                  {Array.isArray(analysis.suggestions) ? (
                    <ul>
                      {analysis.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  ) : (
                    <div>{analysis.suggestions || '暂无建议'}</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="analysis-footer">
          <div className="footer-buttons">
            <button 
              onClick={testAPI} 
              disabled={loading}
              className="test-btn"
            >
              {loading ? '测试中...' : '🧪 测试API'}
            </button>
            <button 
              onClick={generateAnalysis} 
              disabled={loading}
              className="refresh-btn"
            >
              {loading ? '分析中...' : '🤖 AI分析'}
            </button>
          </div>
          <span className="analysis-note">
            由 DeepSeek AI 提供分析支持
          </span>
        </div>
        
        {testResult && (
          <div className={`test-result ${testResult.success ? 'success' : 'error'}`}>
            <h4>{testResult.success ? '✅ 测试成功' : '❌ 测试失败'}</h4>
            <p>{testResult.message}</p>
            {testResult.data && (
              <pre>{JSON.stringify(testResult.data, null, 2)}</pre>
            )}
            {testResult.rawResponse && (
              <details>
                <summary>查看原始响应</summary>
                <pre>{testResult.rawResponse}</pre>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysis;