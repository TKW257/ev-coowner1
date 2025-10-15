import React from "react";
import { Row, Col, Typography, Space, Card } from "antd";
import { CarOutlined, FileProtectOutlined, SolutionOutlined, ThunderboltOutlined, LineChartOutlined, } from "@ant-design/icons";
import "./style.scss";

const { Title, Paragraph } = Typography;

const steps = [
  {
    icon: <CarOutlined />,
    title: "Sign Up & Choose Your Car",
    desc: "Register online, explore our EV collection, and choose the car you want to co-own.",
  },
  {
    icon: <FileProtectOutlined />,
    title: "Confirm Ownership Share",
    desc: "Select your investment amount and confirm your ownership share securely.",
  },
  {
    icon: <SolutionOutlined />,
    title: "Smart Contract & Verification",
    desc: "We handle all digital agreements and identity checks for transparency.",
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Access & Use",
    desc: "Enjoy flexible car usage based on your schedule and preferences.",
  },
  {
    icon: <LineChartOutlined />,
    title: "Earn & Manage",
    desc: "Track your share, earnings, and usage through our real-time dashboard.",
  },
];

const HowToCoOwn = () => {
  return (
    <section className="how-to-coown">
      <div className="container">

        <Title level={2} className="section-title text-center">
          How to Co-Own an Electric Car
        </Title>

        <Row gutter={[48, 48]} align="middle">
          <Col xs={24} md={12}>
            <Space direction="vertical" size="large" className="steps">
              {steps.map((step, index) => (
                <Card key={index} className="step-card" bordered={false}>
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
                src="https://vinfastlongbien.com/wp-content/uploads/2023/07/vinfast-vf3-mau-bac.jpg"
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
