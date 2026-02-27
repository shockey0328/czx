import React from 'react';
import './BMetrics.css';

const BMetrics = ({ currentData, allData, selectedMonth }) => {
  if (!currentData || !selectedMonth) return null;

  const [currentYear, currentMonth] = selectedMonth.split('-').map(Number);

  // 获取上月数据（处理跨年）
  const getLastMonthData = () => {
    let lastYear = currentYear;
    let lastMonth = currentMonth - 1;
    
    if (lastMonth === 0) {
      lastYear = currentYear - 1;
      lastMonth = 12;
    }
    
    return allData.find(row => row.年份 === lastYear && row.月份 === lastMonth);
  };

  // 获取去年同月数据
  const getLastYearData = () => {
    return allData.find(row => row.年份 === currentYear - 1 && row.月份 === currentMonth);
  };

  const lastMonthData = getLastMonthData();
  const lastYearData = getLastYearData();

  // 计算环比（数值型）
  const calculateMoMPercent = (current, last) => {
    if (!last || last === 0) return 'N/A';
    const change = ((current - last) / last * 100).toFixed(2);
    return `${change > 0 ? '+' : ''}${change}%`;
  };

  // 计算同比（数值型）
  const calculateYoYPercent = (current, lastYear) => {
    if (!lastYear || lastYear === 0) return 'N/A';
    const change = ((current - lastYear) / lastYear * 100).toFixed(2);
    return `${change > 0 ? '+' : ''}${change}%`;
  };

  // 格式化金额
  const formatAmount = (amount) => {
    return `${amount.toFixed(2)}万`;
  };

  const bMetrics = [
    {
      label: '签约金额',
      value: formatAmount(currentData.签约金额),
      mom: calculateMoMPercent(currentData.签约金额, lastMonthData?.签约金额),
      yoy: calculateYoYPercent(currentData.签约金额, lastYearData?.签约金额)
    },
    {
      label: '开票金额',
      value: formatAmount(currentData.开票金额),
      mom: calculateMoMPercent(currentData.开票金额, lastMonthData?.开票金额),
      yoy: calculateYoYPercent(currentData.开票金额, lastYearData?.开票金额)
    },
    {
      label: '到款金额',
      value: formatAmount(currentData.到款金额),
      mom: calculateMoMPercent(currentData.到款金额, lastMonthData?.到款金额),
      yoy: calculateYoYPercent(currentData.到款金额, lastYearData?.到款金额)
    },
    {
      label: '订单数',
      value: currentData.订单数.toString(),
      mom: calculateMoMPercent(currentData.订单数, lastMonthData?.订单数),
      yoy: calculateYoYPercent(currentData.订单数, lastYearData?.订单数)
    },
    {
      label: '新签',
      value: currentData.新签.toString(),
      mom: calculateMoMPercent(currentData.新签, lastMonthData?.新签),
      yoy: calculateYoYPercent(currentData.新签, lastYearData?.新签)
    },
    {
      label: '续签',
      value: currentData.续签.toString(),
      mom: calculateMoMPercent(currentData.续签, lastMonthData?.续签),
      yoy: calculateYoYPercent(currentData.续签, lastYearData?.续签)
    }
  ];

  // 计算一些关键比率
  const newSignRatio = currentData.订单数 > 0 ? (currentData.新签 / currentData.订单数 * 100).toFixed(1) : 0;
  const renewalRatio = currentData.订单数 > 0 ? (currentData.续签 / currentData.订单数 * 100).toFixed(1) : 0;
  const avgOrderValue = currentData.订单数 > 0 ? (currentData.签约金额 / currentData.订单数).toFixed(2) : 0;

  return (
    <div className="b-metrics">
      <div className="card">
        <h2 className="card-title">B端核心指标</h2>
        
        <div className="b-metrics-grid">
          {bMetrics.map((metric, index) => (
            <div key={index} className="b-metric-item">
              <div className="metric-label">{metric.label}</div>
              <div className="metric-value">{metric.value}</div>
              <div className="metric-changes">
                <span className={`change ${metric.mom.includes('+') ? 'positive' : metric.mom.includes('-') ? 'negative' : 'neutral'}`}>
                  环比 {metric.mom}
                </span>
                <span className={`change ${metric.yoy.includes('+') ? 'positive' : metric.yoy.includes('-') ? 'negative' : 'neutral'}`}>
                  同比 {metric.yoy}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="b-metrics-summary">
          <h3 className="summary-title">关键比率分析</h3>
          <div className="summary-grid">
            <div className="summary-item">
              <div className="summary-label">新签占比</div>
              <div className="summary-value">{newSignRatio}%</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">续签占比</div>
              <div className="summary-value">{renewalRatio}%</div>
            </div>
            <div className="summary-item">
              <div className="summary-label">平均订单价值</div>
              <div className="summary-value">{avgOrderValue}万</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMetrics;