import { useState } from 'react';
import { Layout, Card, DatePicker, Input, Button, Spin, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import AnalysisResult from './AnalysisResult';
import './Dashboard.css';

const { Header, Content } = Layout;
const { RangePicker } = DatePicker;

function Dashboard() {
  const [dateRange, setDateRange] = useState([dayjs().subtract(7, 'day'), dayjs()]);
  const [userIds, setUserIds] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  const handleAnalyze = async () => {
    if (!userIds.trim()) {
      message.warning('请输入用户ID');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/analyze', {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        userIds: userIds.split(',').map(id => id.trim()).filter(id => id)
      });
      
      setAnalysisData(response.data);
      message.success('分析完成');
    } catch (error) {
      message.error('分析失败：' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout className="dashboard-layout">
      <Header className="dashboard-header">
        <h1>用户行为看板</h1>
      </Header>
      
      <Content className="dashboard-content">
        <Card className="filter-card" bordered={false}>
          <div className="filter-row">
            <div className="filter-item">
              <label>时间段：</label>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="YYYY-MM-DD"
                style={{ width: '100%', maxWidth: 300 }}
              />
            </div>
            
            <div className="filter-item">
              <label>用户ID：</label>
              <Input
                placeholder="多个用户ID用逗号隔开"
                value={userIds}
                onChange={(e) => setUserIds(e.target.value)}
                style={{ width: '100%', maxWidth: 400 }}
              />
            </div>
            
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleAnalyze}
              loading={loading}
              size="large"
            >
              分析
            </Button>
          </div>
        </Card>

        {loading && (
          <div className="loading-container">
            <Spin size="large" tip="AI正在分析用户行为..." />
          </div>
        )}

        {!loading && analysisData && (
          <AnalysisResult data={analysisData} />
        )}
      </Content>
    </Layout>
  );
}

export default Dashboard;
