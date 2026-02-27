import React from 'react';
import './MetricsCards.css';

const MetricsCards = ({ currentData, allData, selectedMonth }) => {
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

  // 计算环比（百分比型）
  const calculateMoMPP = (current, last) => {
    if (last === undefined || last === null) return 'N/A';
    const change = (current - last).toFixed(2);
    return `${change > 0 ? '+' : ''}${change}pp`;
  };

  // 计算同比（数值型）
  const calculateYoYPercent = (current, lastYear) => {
    if (!lastYear || lastYear === 0) return 'N/A';
    const change = ((current - lastYear) / lastYear * 100).toFixed(2);
    return `${change > 0 ? '+' : ''}${change}%`;
  };

  // 计算同比（百分比型）
  const calculateYoYPP = (current, lastYear) => {
    if (lastYear === undefined || lastYear === null) return 'N/A';
    const change = (current - lastYear).toFixed(2);
    return `${change > 0 ? '+' : ''}${change}pp`;
  };

  // 格式化数值
  const formatNumber = (num) => {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + '万';
    }
    return num.toLocaleString();
  };

  const userMetrics = [
    {
      label: '活跃用户',
      value: formatNumber(currentData.月活),
      mom: calculateMoMPercent(currentData.月活, lastMonthData?.月活),
      yoy: calculateYoYPercent(currentData.月活, lastYearData?.月活)
    },
    {
      label: '月留存率',
      value: `${currentData.次月留存}%`,
      mom: calculateMoMPP(currentData.次月留存, lastMonthData?.次月留存),
      yoy: calculateYoYPP(currentData.次月留存, lastYearData?.次月留存)
    }
  ];

  const revenueMetrics = [
    {
      label: '营收',
      value: formatNumber(currentData.营收),
      mom: calculateMoMPercent(currentData.营收, lastMonthData?.营收),
      yoy: calculateYoYPercent(currentData.营收, lastYearData?.营收)
    },
    {
      label: '订单',
      value: formatNumber(currentData.订单),
      mom: calculateMoMPercent(currentData.订单, lastMonthData?.订单),
      yoy: calculateYoYPercent(currentData.订单, lastYearData?.订单)
    },
    {
      label: 'ARPU',
      value: currentData.ARPU.toFixed(2),
      mom: calculateMoMPercent(currentData.ARPU, lastMonthData?.ARPU),
      yoy: calculateYoYPercent(currentData.ARPU, lastYearData?.ARPU)
    },
    {
      label: 'ARPPU',
      value: currentData.ARPPU.toFixed(2),
      mom: calculateMoMPercent(currentData.ARPPU, lastMonthData?.ARPPU),
      yoy: calculateYoYPercent(currentData.ARPPU, lastYearData?.ARPPU)
    }
  ];

  const usageMetrics = [
    {
      label: '深度访问率',
      value: `${currentData.深度访问率}%`,
      mom: calculateMoMPP(currentData.深度访问率, lastMonthData?.深度访问率),
      yoy: calculateYoYPP(currentData.深度访问率, lastYearData?.深度访问率)
    },
    {
      label: '使用率',
      value: `${currentData.使用率}%`,
      mom: calculateMoMPP(currentData.使用率, lastMonthData?.使用率),
      yoy: calculateYoYPP(currentData.使用率, lastYearData?.使用率)
    },
    {
      label: '大会员活跃率',
      value: `${currentData.大会员活跃率}%`,
      mom: calculateMoMPP(currentData.大会员活跃率, lastMonthData?.大会员活跃率),
      yoy: calculateYoYPP(currentData.大会员活跃率, lastYearData?.大会员活跃率)
    }
  ];

  const MetricCard = ({ title, metrics, className }) => (
    <div className={`metrics-card ${className}`}>
      <h3 className="metrics-title">{title}</h3>
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-item">
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
    </div>
  );

  return (
    <div className="metrics-cards">
      <MetricCard title="用户模块" metrics={userMetrics} className="user-card" />
      <MetricCard title="收入模块" metrics={revenueMetrics} className="revenue-card" />
      <MetricCard title="使用模块" metrics={usageMetrics} className="usage-card" />
    </div>
  );
};

export default MetricsCards;