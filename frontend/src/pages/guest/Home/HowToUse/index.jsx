import React from "react";
import { Row, Col, Typography, Space, Card } from "antd";
import { CarOutlined, FileProtectOutlined, SolutionOutlined, ThunderboltOutlined, LineChartOutlined, } from "@ant-design/icons";
import "./style.scss";

const { Title, Paragraph } = Typography;

const steps = [
  {
    icon: <CarOutlined />,
    title: "Đăng ký và Chọn xe đồng sở hữu ",
    desc: "Đăng ký trực tuyến, Khám phá bộ sưu tập xe điện (EV) và chọn chiếc xe bạn muốn đồng sở hữu.",
  },
  {
    icon: <FileProtectOutlined />,
    title: "Xác nhận phần sở hữu",
    desc: "Chọn và xác nhận phần sở hữu của bạn một cách an toàn và bảo mật.",
  },
  {
    icon: <SolutionOutlined />,
    title: "Ký hợp đồng & Thanh toán",
    desc: "Các thỏa thuận được thực hiện bằng hợp đồng điện tử minh bạch. Thanh toán được xử lý thông qua các kênh an toàn và đã được xác minh. ",
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Xác nhận sở hữu & Đặt lịch sử dụng xe",
    desc: "Sau khi hoàn tất toàn bộ thủ tục, bạn có thể linh hoạt đặt lịch sử dụng xe theo nhu cầu và thời gian của mình.",
  },
  {
    icon: <LineChartOutlined />,
    title: "Quản lý quyền sở hữu",
    desc: "Theo dõi phần sở hữu và lịch sử sử dụng của bạn qua bảng điều khiển theo thời gian thực.",
  },
];

const HowToCoOwn = () => {
  return (
    <section className="how-to-coown">
      <div className="container">

        <Title level={2} className="section-title text-center">
          Làm Thế Nào Để Cùng Sở Hữu Xe Điện
        </Title>

        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" className="steps">
              {steps.map((step, index) => (
                <Card key={index} className="step-card" variant="borderless">
                  <Space align="start" size="middle">
                    <div className="icon-wrapper">{step.icon}</div>
                    <div>
                      <Title level={4}>{step.title}</Title>
                      <Paragraph>{step.desc}</Paragraph>
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>
          </Col>

          <Col xs={24} md={12} className="image-section">
            <div className="image-wrapper">
              <img
                src="https://vinfastlongbien.com/wp-content/uploads/2023/07/vinfast-vf3-mau-bac.jpg"
                alt="Electric car"
                className="ev-image main"
              />
              <img
                src="https://media.suara.com/pictures/653x366/2023/12/01/85263-vinfast.jpg"
                alt="Electric car side"
                className="ev-image secondary"
              />
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HowToCoOwn;
