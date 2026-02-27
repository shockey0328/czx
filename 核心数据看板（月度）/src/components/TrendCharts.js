import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TrendCharts.css';

const TrendCharts = ({ data, selectedMonth }) => {
  const [timeRange, setTimeRange] = useState(6); // 默认6个月

  if (!data || data.length === 0) return null;

  const [currentYear, currentMonth] = selectedMonth.split('-').map(Number);

  // 获取指定时间范围的数据
  const getTimeRangeData = () => {
    // 找到当前月份的索引
    const currentIndex = data.findIndex(row => row.年份 === currentYear && row.月份 === currentMonth);
    if (currentIndex === -1) return [];

    // 获取前N个月的数据（包含当前月）
    const startIndex = Math.max(0, currentIndex - timeRange + 1);
    return data.slice(startIndex, currentIndex + 1);
  };

  const chartData = getTimeRangeData().map(row => ({
    month: `${row.年份 + 2000}年${row.月份}月`,
    活跃用户: row.月活,
    营收: row.营收,
    ARPU: row.ARPU,
    使用率: row.使用率
  }));

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey}: {
                entry.dataKey === '活跃用户' || entry.dataKey === '营收' 
                  ? entry.value.toLocaleString()
                  : entry.dataKey === '使用率'
                  ? `${entry.value}%`
                  : entry.value.toFixed(2)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 格式化Y轴数值
  const formatYAxis = (value, type) => {
    if (type === 'user' || type === 'revenue') {
      if (value >= 10000) {
        return `${(value / 10000).toFixed(0)}万`;
      }
      return value.toLocaleString();
    }
    if (type === 'usage') {
      return `${value}%`;
    }
    return value;
  };

  const ChartCard = ({ title, dataKey, color, type }) => (
    <div className="chart-card">
      <h3 className="chart-title">{title}</h3>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatYAxis(value, type)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="trend-charts">
      <div className="charts-header">
        <h2 className="section-title">趋势分析</h2>
        <div className="time-range-selector">
          <button 
            className={timeRange === 3 ? 'active' : ''}
            onClick={() => setTimeRange(3)}
          >
            近3个月
          </button>
          <button 
            className={timeRange === 6 ? 'active' : ''}
            onClick={() => setTimeRange(6)}
          >
            近6个月
          </button>
          <button 
            className={timeRange === 12 ? 'active' : ''}
            onClick={() => setTimeRange(12)}
          >
            近12个月
          </button>
        </div>
      </div>

      <div className="charts-grid">
        <ChartCard 
          title="活跃用户趋势" 
          dataKey="活跃用户" 
          color="#FF6B35" 
          type="user"
        />
        <ChartCard 
          title="营收趋势" 
          dataKey="营收" 
          color="#FFA366" 
          type="revenue"
        />
        <ChartCard 
          title="ARPU趋势" 
          dataKey="ARPU" 
          color="#FF8C42" 
          type="arpu"
        />
        <ChartCard 
          title="使用率趋势" 
          dataKey="使用率" 
          color="#FFB366" 
          type="usage"
        />
      </div>
    </div>
  );
};

export default TrendCharts;