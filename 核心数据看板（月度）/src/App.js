import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import Header from './components/Header';
import MetricsCards from './components/MetricsCards';
import TrendCharts from './components/TrendCharts';
import AIAnalysis from './components/AIAnalysis';
import BMetrics from './components/BMetrics';
import OrangeAssistant from './components/OrangeAssistant';
import './App.css';

function App() {
  const [monthlyData, setMonthlyData] = useState([]);
  const [bData, setBData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [availableMonths, setAvailableMonths] = useState([]);
  const [loading, setLoading] = useState(true);

  // 加载CSV数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 加载月度核心数据
        const monthlyResponse = await fetch('/月度核心数据.csv');
        const monthlyText = await monthlyResponse.text();
        const monthlyParsed = Papa.parse(monthlyText, { header: true });
        
        // 加载B端核心数据
        const bResponse = await fetch('/B端核心数据.csv');
        const bText = await bResponse.text();
        const bParsed = Papa.parse(bText, { header: true });

        // 处理月度数据
        const processedMonthlyData = monthlyParsed.data
          .filter(row => row.年份 && row.月份)
          .map(row => ({
            年份: parseInt(row.年份.replace('年', '')),
            月份: parseInt(row.月份.replace('月', '')),
            月活: parseInt(row.月活),
            次月留存: parseFloat(row.次月留存.replace('%', '')),
            营收: parseInt(row.营收),
            订单: parseInt(row.订单),
            ARPU: parseFloat(row.ARPU),
            ARPPU: parseFloat(row.ARPPU),
            深度访问率: parseFloat(row.深度访问率.replace('%', '')),
            使用率: parseFloat(row.使用率.replace('%', '')),
            大会员活跃率: parseFloat(row.大会员活跃率.replace('%', ''))
          }));

        // 处理B端数据
        const processedBData = bParsed.data
          .filter(row => row.年份 && row.月份)
          .map(row => ({
            年份: parseInt(row.年份.replace('年', '')),
            月份: parseInt(row.月份.replace('月', '')),
            签约金额: parseFloat(row.签约金额.replace('万', '')),
            开票金额: parseFloat(row.开票金额.replace('万', '')),
            到款金额: parseFloat(row.到款金额.replace('万', '')),
            订单数: parseInt(row.订单数),
            新签: parseInt(row.新签),
            续签: parseInt(row.续签)
          }));

        setMonthlyData(processedMonthlyData);
        setBData(processedBData);

        // 生成可用月份列表
        const months = processedMonthlyData.map(row => ({
          year: row.年份,
          month: row.月份,
          label: `${row.年份 + 2000}年${row.月份}月`
        }));
        
        setAvailableMonths(months);
        
        // 设置默认选择最新月份
        if (months.length > 0) {
          const latest = months[months.length - 1];
          setSelectedMonth(`${latest.year}-${latest.month}`);
        }

        setLoading(false);
      } catch (error) {
        console.error('数据加载失败:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 获取当前选中月份的数据
  const getCurrentMonthData = () => {
    if (!selectedMonth) return null;
    const [year, month] = selectedMonth.split('-').map(Number);
    return monthlyData.find(row => row.年份 === year && row.月份 === month);
  };

  const getCurrentBData = () => {
    if (!selectedMonth) return null;
    const [year, month] = selectedMonth.split('-').map(Number);
    return bData.find(row => row.年份 === year && row.月份 === month);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>数据加载中...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Header 
        selectedMonth={selectedMonth}
        setSelectedMonth={setSelectedMonth}
        availableMonths={availableMonths}
      />
      
      <div className="container">
        <MetricsCards 
          currentData={getCurrentMonthData()}
          allData={monthlyData}
          selectedMonth={selectedMonth}
        />
        
        <TrendCharts 
          data={monthlyData}
          selectedMonth={selectedMonth}
        />
        
        <AIAnalysis 
          currentData={getCurrentMonthData()}
          allData={monthlyData}
          selectedMonth={selectedMonth}
        />
        
        <BMetrics 
          currentData={getCurrentBData()}
          allData={bData}
          selectedMonth={selectedMonth}
        />
      </div>
      
      {/* 小橙子AI助手 */}
      <OrangeAssistant 
        currentData={getCurrentMonthData()}
        allData={monthlyData}
        selectedMonth={selectedMonth}
      />
    </div>
  );
}

export default App;