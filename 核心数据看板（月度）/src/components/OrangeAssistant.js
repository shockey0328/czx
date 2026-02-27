import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './OrangeAssistant.css';

const OrangeAssistant = ({ currentData, allData, selectedMonth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [dataInsights, setDataInsights] = useState([]);
  const messagesEndRef = useRef(null);

  // 加载历史记忆
  useEffect(() => {
    console.log('🍊 小橙子组件已加载');
    loadMemory();
  }, []);

  // 保存对话历史到localStorage
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // 保存对话历史
        localStorage.setItem('orangeAssistant_history', JSON.stringify(conversationHistory));
        
        // 保存用户偏好
        localStorage.setItem('orangeAssistant_preferences', JSON.stringify(userPreferences));
        
        // 保存数据洞察
        localStorage.setItem('orangeAssistant_insights', JSON.stringify(dataInsights));
      } catch (error) {
        console.error('保存记忆失败:', error);
      }
    }
  }, [messages, userPreferences, dataInsights, conversationHistory]);

  const loadMemory = () => {
    try {
      // 加载对话历史
      const savedHistory = localStorage.getItem('orangeAssistant_history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        setConversationHistory(history.slice(-20)); // 保留最近20条对话
        console.log('📚 加载了', history.length, '条历史对话');
      }

      // 加载用户偏好
      const savedPreferences = localStorage.getItem('orangeAssistant_preferences');
      if (savedPreferences) {
        setUserPreferences(JSON.parse(savedPreferences));
        console.log('💡 加载了用户偏好');
      }

      // 加载数据洞察
      const savedInsights = localStorage.getItem('orangeAssistant_insights');
      if (savedInsights) {
        setDataInsights(JSON.parse(savedInsights));
        console.log('🔍 加载了', JSON.parse(savedInsights).length, '条数据洞察');
      }
    } catch (error) {
      console.error('加载记忆失败:', error);
    }
  };

  // 分析用户问题，提取关注点
  const analyzeUserIntent = (question) => {
    const keywords = {
      '月活': 'userActivity',
      '用户': 'userActivity',
      '活跃': 'userActivity',
      '营收': 'revenue',
      '收入': 'revenue',
      '付费': 'revenue',
      'ARPU': 'arpu',
      'ARPPU': 'arppu',
      '留存': 'retention',
      '订单': 'orders',
      '转化': 'conversion',
      '深度访问': 'engagement',
      '使用率': 'usage',
      '会员': 'membership'
    };

    const concerns = [];
    for (const [keyword, category] of Object.entries(keywords)) {
      if (question.includes(keyword)) {
        concerns.push(category);
      }
    }

    return concerns;
  };

  // 更新用户偏好
  const updateUserPreferences = (question, concerns) => {
    const newPreferences = { ...userPreferences };
    
    concerns.forEach(concern => {
      newPreferences[concern] = (newPreferences[concern] || 0) + 1;
    });

    // 记录最后提问时间
    newPreferences.lastInteraction = new Date().toISOString();
    newPreferences.totalQuestions = (newPreferences.totalQuestions || 0) + 1;

    setUserPreferences(newPreferences);
  };

  // 提取并保存数据洞察
  const extractInsights = (aiResponse, currentMonth) => {
    const newInsights = [...dataInsights];
    
    // 限制洞察数量，保留最近50条
    if (newInsights.length >= 50) {
      newInsights.shift();
    }

    newInsights.push({
      month: currentMonth,
      timestamp: new Date().toISOString(),
      content: aiResponse.substring(0, 200), // 保存前200字符
      metrics: currentData ? {
        月活: currentData.月活,
        营收: currentData.营收,
        留存: currentData.次月留存
      } : null
    });

    setDataInsights(newInsights);
  };

  // 构建增强的上下文提示
  const buildEnhancedContext = (userQuestion) => {
    let context = '';

    // 添加用户偏好信息
    if (Object.keys(userPreferences).length > 0) {
      const topConcerns = Object.entries(userPreferences)
        .filter(([key]) => key !== 'lastInteraction' && key !== 'totalQuestions')
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key]) => key);

      if (topConcerns.length > 0) {
        context += `\n用户通常关注：${topConcerns.join('、')}`;
      }
    }

    // 添加最近的对话历史
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-3);
      context += '\n\n最近的对话：\n';
      recentHistory.forEach(item => {
        context += `Q: ${item.question}\nA: ${item.answer.substring(0, 100)}...\n`;
      });
    }

    // 添加相关的历史洞察
    if (dataInsights.length > 0 && selectedMonth) {
      const relevantInsights = dataInsights
        .filter(insight => insight.month === selectedMonth)
        .slice(-2);
      
      if (relevantInsights.length > 0) {
        context += '\n\n本月之前的分析：\n';
        relevantInsights.forEach(insight => {
          context += `- ${insight.content.substring(0, 100)}...\n`;
        });
      }
    }

    return context;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOrangeClick = () => {
    setIsOpen(true);
    if (messages.length === 0) {
      // 计算成长等级
      const totalQuestions = userPreferences.totalQuestions || 0;
      let level = "新手";
      let emoji = "🌱";
      
      if (totalQuestions >= 100) {
        level = "专家";
        emoji = "🏆";
      } else if (totalQuestions >= 51) {
        level = "专业";
        emoji = "💎";
      } else if (totalQuestions >= 11) {
        level = "熟悉";
        emoji = "🌟";
      }
      
      // 生成个性化欢迎消息
      let welcomeMessage = `您好，我是你的AI数据分析助手小橙子！🍊\n\n`;
      
      // 如果有历史记录，显示成长信息
      if (totalQuestions > 0) {
        welcomeMessage += `${emoji} 当前等级：${level}助手\n`;
        welcomeMessage += `💬 我们已经交流过 ${totalQuestions} 次了！\n`;
        welcomeMessage += `📚 我记住了 ${conversationHistory.length} 条对话\n`;
        welcomeMessage += `� 积累了 ${dataInsights.length} 条数据洞察\n\n`;
        welcomeMessage += `通过不断学习，我对您的需求有了更深的了解。\n\n`;
      }

      welcomeMessage += '我可以帮助您：\n• 分析当前月度数据表现\n• 解读数据趋势和变化\n• 提供业务优化建议\n• 回答数据相关问题\n\n';

      // 基于用户偏好提供建议
      if (Object.keys(userPreferences).length > 2) {
        const topConcerns = Object.entries(userPreferences)
          .filter(([key]) => key !== 'lastInteraction' && key !== 'totalQuestions')
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        
        if (topConcerns.length > 0) {
          const concernMap = {
            'userActivity': '用户活跃度',
            'revenue': '营收表现',
            'retention': '用户留存',
            'arpu': 'ARPU指标',
            'arppu': 'ARPPU指标',
            'orders': '订单数据',
            'engagement': '用户参与度',
            'usage': '使用率',
            'membership': '会员数据'
          };
          
          const topConcernNames = topConcerns
            .map(([key]) => concernMap[key])
            .filter(Boolean);
          
          if (topConcernNames.length > 0) {
            welcomeMessage += `💡 我注意到您经常关注：${topConcernNames.join('、')}\n\n`;
          }
        }
      }
      
      welcomeMessage += '有什么需要我帮助的吗？';

      setMessages([{
        type: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userQuestion = inputValue;
    const userMessage = {
      type: 'user',
      content: userQuestion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 1. 分析用户意图
      const concerns = analyzeUserIntent(userQuestion);
      
      // 2. 更新用户偏好
      updateUserPreferences(userQuestion, concerns);
      
      // 3. 构建增强上下文
      const enhancedContext = buildEnhancedContext(userQuestion);
      
      // 4. 构建完整提示词
      const contextInfo = currentData ? `
当前数据概况（${selectedMonth ? selectedMonth.replace('-', '年') + '月' : ''}）：
- 月活用户：${currentData.月活?.toLocaleString() || 'N/A'}
- 次月留存率：${currentData.次月留存 || 'N/A'}%
- 营收：${currentData.营收?.toLocaleString() || 'N/A'}
- 订单数：${currentData.订单?.toLocaleString() || 'N/A'}
- ARPU：${currentData.ARPU || 'N/A'}
- ARPPU：${currentData.ARPPU || 'N/A'}
- 深度访问率：${currentData.深度访问率 || 'N/A'}%
- 使用率：${currentData.使用率 || 'N/A'}%
- 大会员活跃率：${currentData.大会员活跃率 || 'N/A'}%
` : '暂无当前月份数据';

      const prompt = `
你是小橙子，一个专业的数据分析助手。请基于以下数据回答用户问题：

${contextInfo}

${enhancedContext}

用户问题：${userQuestion}

请以友好、专业的语气回答，重点关注数据洞察和实用建议。回答要简洁明了，不超过200字。
`;

      // 5. 调用AI API
      const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是小橙子，一个专业友好的数据分析助手。回答要简洁实用，语气亲切专业。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = response.data.choices[0].message.content;
      
      // 6. 保存对话历史
      const newConversation = {
        question: userQuestion,
        answer: aiResponse,
        timestamp: new Date().toISOString(),
        month: selectedMonth
      };
      
      const updatedHistory = [...conversationHistory, newConversation];
      if (updatedHistory.length > 20) {
        updatedHistory.shift(); // 保持最多20条
      }
      setConversationHistory(updatedHistory);
      
      // 7. 提取并保存数据洞察
      extractInsights(aiResponse, selectedMonth);
      
      // 8. 显示AI回答
      const assistantMessage = {
        type: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI对话失败:', error);
      
      const errorMessage = {
        type: 'assistant',
        content: '抱歉，我现在无法回答您的问题。请稍后再试，或者检查API配置是否正确。',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      {/* 小橙子图标 */}
      <div className="orange-assistant-icon" onClick={handleOrangeClick}>
        <img src="/orange-assistant.png" alt="小橙子AI助手" className="orange-image" />
        <div className="orange-tooltip">点击与小橙子对话</div>
      </div>

      {/* 对话窗口 */}
      {isOpen && (
        <div className="orange-chat-overlay">
          <div className="orange-chat-window">
            <div className="orange-chat-header">
              <div className="orange-chat-title">
                <img src="/orange-assistant.png" alt="小橙子" className="orange-avatar" />
                <span>小橙子 AI 数据分析助手</span>
              </div>
              <button className="orange-close-btn" onClick={handleClose}>×</button>
            </div>

            <div className="orange-chat-messages">
              {messages.map((message, index) => (
                <div key={index} className={`orange-message ${message.type}`}>
                  {message.type === 'assistant' && (
                    <img src="/orange-assistant.png" alt="小橙子" className="message-avatar" />
                  )}
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">{formatTime(message.timestamp)}</div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="orange-message assistant">
                  <img src="/orange-assistant.png" alt="小橙子" className="message-avatar" />
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <div className="orange-chat-input">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的问题..."
                className="chat-textarea"
                rows="2"
                disabled={isLoading}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="send-button"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrangeAssistant;