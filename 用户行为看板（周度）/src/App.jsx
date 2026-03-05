import { useState } from 'react';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#FF6B35',
          borderRadius: 16,
        },
      }}
    >
      <Dashboard />
    </ConfigProvider>
  );
}

export default App;
