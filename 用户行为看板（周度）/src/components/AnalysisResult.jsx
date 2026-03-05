import { Card, Row, Col } from 'antd';
import './AnalysisResult.css';

function AnalysisResult({ data }) {
  const { trajectory, habits, issues, suggestions } = data;

  return (
    <div className="analysis-result">
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card className="result-card card-trajectory" bordered={false}>
            <h2>一、用户完整行为轨迹（时间线简述）</h2>
            <div className="content-text">{trajectory}</div>
          </Card>
        </Col>

        <Col xs={24}>
          <Card className="result-card card-habits" bordered={false}>
            <h2>二、用户使用习惯与特征</h2>
            <div className="content-text">{habits}</div>
          </Card>
        </Col>

        <Col xs={24}>
          <Card className="result-card card-issues" bordered={false}>
            <h2>三、产品问题与体验卡点（重点）</h2>
            <div className="content-text">{issues}</div>
          </Card>
        </Col>

        <Col xs={24}>
          <Card className="result-card card-suggestions" bordered={false}>
            <h2>四、产品&运营优化建议</h2>
            <div className="content-text">{suggestions}</div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AnalysisResult;
