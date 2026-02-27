import React from 'react';
import './Header.css';

const Header = ({ selectedMonth, setSelectedMonth, availableMonths }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo-section">
            <img src="/logo.png" alt="Logo" className="logo" />
            <h1 className="title">月度数据分析看板</h1>
          </div>
          
          <div className="month-selector">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="month-select"
            >
              {availableMonths.map((month, index) => (
                <option key={index} value={`${month.year}-${month.month}`}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;