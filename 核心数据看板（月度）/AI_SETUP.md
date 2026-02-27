# AI分析功能配置指南

## 当前状态
AI分析功能已集成到看板中，但需要配置有效的API密钥才能使用。

## 配置步骤

### 方案1：使用DeepSeek API（推荐）

1. **获取API密钥**：
   - 访问：https://platform.deepseek.com/
   - 注册并登录账号
   - 在API管理页面创建新密钥
   - 复制生成的API密钥

2. **配置环境变量**：
   - 在项目根目录的 `.env` 文件中添加：
   ```
   REACT_APP_DEEPSEEK_API_KEY=your_actual_api_key_here
   ```

3. **重启应用**：
   ```bash
   npm start
   ```

### 方案2：使用其他AI服务

如果你有其他AI服务的API密钥，可以修改 `src/components/AIAnalysis.js` 文件：

#### OpenAI GPT API
```javascript
const response = await axios.post('https://api.openai.com/v1/chat/completions', {
  model: 'gpt-3.5-turbo',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.7,
  max_tokens: 1000
}, {
  headers: {
    'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  }
});
```

#### 百度文心一言API
```javascript
// 需要先获取access_token，然后调用
const response = await axios.post(`https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions?access_token=${accessToken}`, {
  messages: [{ role: 'user', content: prompt }]
});
```

### 方案3：临时禁用AI功能

如果暂时不需要AI分析，可以：

1. **注释掉AI组件**：
   在 `src/App.js` 中注释掉：
   ```javascript
   // <AIAnalysis 
   //   currentData={getCurrentMonthData()}
   //   allData={monthlyData}
   //   selectedMonth={selectedMonth}
   // />
   ```

2. **或者使用静态分析**：
   当前代码已配置为在API失败时使用静态分析作为备选方案。

## 功能说明

AI分析功能提供：
- **核心表现**：显示关键指标数值
- **关键变化**：分析环比和同比变化
- **策略建议**：基于数据提供运营建议

## 故障排除

1. **API密钥无效**：
   - 检查密钥是否正确复制
   - 确认密钥是否有足够的配额
   - 检查API服务是否正常

2. **网络问题**：
   - 检查网络连接
   - 确认防火墙设置
   - 尝试使用VPN

3. **CORS问题**：
   - 某些API可能需要后端代理
   - 考虑使用服务器端调用

## 成本说明

- DeepSeek API：相对便宜，新用户通常有免费额度
- OpenAI API：按token计费，成本较高
- 国内API：通常有免费额度，价格相对便宜

建议先使用免费额度测试功能，确认效果后再考虑付费使用。