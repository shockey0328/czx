# 小橙子AI助手技术文档

## 概述

小橙子是一个集成在月度数据分析看板中的智能AI助手，具备记忆、学习和成长能力。通过DeepSeek AI提供智能数据分析服务。

## 核心特性

### 1. 智能对话分析
- 基于当前月份数据进行实时分析
- 理解自然语言问题
- 提供专业的数据洞察和建议
- 支持多轮对话上下文理解

### 2. 成长学习能力

#### 2.1 对话历史记忆
- **存储位置**: `localStorage.orangeAssistant_history`
- **数据结构**:
```javascript
[
  {
    question: "用户问题",
    answer: "AI回答",
    timestamp: "2025-02-06T10:30:00.000Z",
    month: "25-2"
  }
]
```
- **保留策略**: 最近20条对话
- **用途**: 提供上下文，避免重复回答

#### 2.2 用户偏好学习
- **存储位置**: `localStorage.orangeAssistant_preferences`
- **数据结构**:
```javascript
{
  userActivity: 5,      // 关注用户活跃度的次数
  revenue: 8,           // 关注营收的次数
  retention: 3,         // 关注留存的次数
  arpu: 2,              // 关注ARPU的次数
  orders: 1,            // 关注订单的次数
  totalQuestions: 19,   // 总提问次数
  lastInteraction: "2025-02-06T10:30:00.000Z"
}
```
- **识别关键词**:
  - `月活`、`用户`、`活跃` → userActivity
  - `营收`、`收入`、`付费` → revenue
  - `留存` → retention
  - `ARPU` → arpu
  - `ARPPU` → arppu
  - `订单` → orders
  - `转化` → conversion
  - `深度访问` → engagement
  - `使用率` → usage
  - `会员` → membership

#### 2.3 数据洞察积累
- **存储位置**: `localStorage.orangeAssistant_insights`
- **数据结构**:
```javascript
[
  {
    month: "25-2",
    timestamp: "2025-02-06T10:30:00.000Z",
    content: "AI分析内容摘要（前200字符）",
    metrics: {
      月活: 150000,
      营收: 500000,
      留存: 45.5
    }
  }
]
```
- **保留策略**: 最近50条洞察
- **用途**: 提供历史分析参考，避免重复分析

### 3. 智能上下文构建

#### 3.1 上下文组成
```javascript
const context = {
  currentData: {
    // 当前月份的完整数据
    月活: 150000,
    营收: 500000,
    // ...
  },
  userPreferences: {
    // 用户最关注的3个指标
    topConcerns: ['revenue', 'userActivity', 'retention']
  },
  recentHistory: [
    // 最近3条对话
  ],
  relevantInsights: [
    // 同月份的历史分析（最近2条）
  ]
}
```

#### 3.2 提示词构建
```javascript
const prompt = `
你是小橙子，一个专业的数据分析助手。

当前数据概况（${selectedMonth}）：
- 月活用户：${currentData.月活}
- 营收：${currentData.营收}
...

用户通常关注：${topConcerns.join('、')}

最近的对话：
Q: ${recentQuestion}
A: ${recentAnswer}

本月之前的分析：
- ${previousInsight}

用户问题：${userQuestion}

请以友好、专业的语气回答，重点关注数据洞察和实用建议。
回答要简洁明了，不超过200字。
`;
```

## 技术实现

### 组件结构

```javascript
const OrangeAssistant = ({ currentData, allData, selectedMonth }) => {
  // 状态管理
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [dataInsights, setDataInsights] = useState([]);
  
  // 核心功能
  useEffect(() => loadMemory(), []);
  useEffect(() => saveMemory(), [messages, userPreferences, dataInsights]);
  
  // 主要方法
  const loadMemory = () => { /* 加载记忆 */ };
  const saveMemory = () => { /* 保存记忆 */ };
  const analyzeUserIntent = (question) => { /* 分析意图 */ };
  const updateUserPreferences = (question, concerns) => { /* 更新偏好 */ };
  const extractInsights = (aiResponse, currentMonth) => { /* 提取洞察 */ };
  const buildEnhancedContext = (userQuestion) => { /* 构建上下文 */ };
  const handleSendMessage = async () => { /* 发送消息 */ };
  
  return (
    <>
      <div className="orange-assistant-icon" onClick={handleOrangeClick}>
        {/* 小橙子图标 */}
      </div>
      {isOpen && (
        <div className="orange-chat-overlay">
          {/* 对话窗口 */}
        </div>
      )}
    </>
  );
};
```

### 关键流程

#### 1. 用户提问流程
```
用户输入问题
  ↓
分析问题意图（提取关键词）
  ↓
更新用户偏好统计
  ↓
构建增强上下文
  ↓
调用DeepSeek API
  ↓
提取数据洞察
  ↓
保存到conversationHistory
  ↓
显示AI回答
  ↓
自动保存到localStorage
```

#### 2. 记忆加载流程
```
组件挂载
  ↓
从localStorage读取三类数据
  ↓
conversationHistory（最近20条）
  ↓
userPreferences（偏好统计）
  ↓
dataInsights（最近50条）
  ↓
设置到state
  ↓
准备就绪
```

#### 3. 个性化欢迎流程
```
用户点击小橙子
  ↓
检查totalQuestions
  ↓
如果 > 0：显示交流次数
  ↓
检查topConcern
  ↓
如果存在：提及用户关注点
  ↓
生成个性化欢迎消息
```

## API集成

### DeepSeek API配置

```javascript
const response = await axios.post(
  'https://api.deepseek.com/v1/chat/completions',
  {
    model: 'deepseek-chat',
    messages: [
      {
        role: 'system',
        content: '你是小橙子，一个专业友好的数据分析助手。'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 300
  },
  {
    headers: {
      'Authorization': `Bearer ${process.env.REACT_APP_API_KEY}`,
      'Content-Type': 'application/json'
    }
  }
);
```

### 错误处理

```javascript
try {
  // API调用
} catch (error) {
  console.error('AI对话失败:', error);
  
  const errorMessage = {
    type: 'assistant',
    content: '抱歉，我现在无法回答您的问题。请稍后再试。',
    timestamp: new Date()
  };
  
  setMessages(prev => [...prev, errorMessage]);
}
```

## 样式设计

### 关键CSS类

```css
/* 小橙子图标 */
.orange-assistant-icon {
  position: fixed;
  left: 20px;
  top: 50%;
  z-index: 9999;
}

/* 对话窗口 */
.orange-chat-window {
  width: 500px;
  height: 600px;
  border-radius: 16px;
}

/* 消息气泡 */
.orange-message.user .message-text {
  background: #FF6B35;
  color: white;
}

.orange-message.assistant .message-text {
  background: #f5f5f5;
  color: #333;
}
```

## 性能优化

### 1. 数据限制
- 对话历史：最多20条
- 数据洞察：最多50条
- AI回答：最多300 tokens

### 2. 存储优化
- 只保存必要信息
- 定期清理过期数据
- 压缩存储内容

### 3. 渲染优化
- 使用useRef避免不必要的重渲染
- 消息列表虚拟滚动（可选）
- 防抖输入处理

## 扩展建议

### 1. 功能扩展
- [ ] 支持语音输入
- [ ] 导出对话记录
- [ ] 数据可视化建议
- [ ] 多语言支持
- [ ] 情感分析

### 2. 学习能力增强
- [ ] 更复杂的意图识别
- [ ] 主动推送数据异常
- [ ] 预测性分析
- [ ] A/B测试建议

### 3. 交互优化
- [ ] 快捷问题按钮
- [ ] 历史对话搜索
- [ ] 收藏重要回答
- [ ] 分享对话功能

## 调试技巧

### 查看记忆数据
```javascript
// 在浏览器控制台执行
console.log('对话历史:', JSON.parse(localStorage.getItem('orangeAssistant_history')));
console.log('用户偏好:', JSON.parse(localStorage.getItem('orangeAssistant_preferences')));
console.log('数据洞察:', JSON.parse(localStorage.getItem('orangeAssistant_insights')));
```

### 清除记忆
```javascript
localStorage.removeItem('orangeAssistant_history');
localStorage.removeItem('orangeAssistant_preferences');
localStorage.removeItem('orangeAssistant_insights');
```

### 模拟用户偏好
```javascript
localStorage.setItem('orangeAssistant_preferences', JSON.stringify({
  revenue: 10,
  userActivity: 8,
  totalQuestions: 18,
  lastInteraction: new Date().toISOString()
}));
```

## 安全考虑

1. **API密钥保护**: 使用环境变量，不提交到代码仓库
2. **数据隐私**: 敏感数据不存储在localStorage
3. **输入验证**: 防止注入攻击
4. **速率限制**: 避免API滥用

## 维护指南

### 定期检查
- API调用成功率
- 用户满意度
- 响应时间
- 存储空间使用

### 更新策略
- 定期更新AI模型
- 优化提示词
- 改进意图识别
- 扩展关键词库

---

**版本**: v2.0.0  
**最后更新**: 2025-02-06  
**维护者**: 开发团队