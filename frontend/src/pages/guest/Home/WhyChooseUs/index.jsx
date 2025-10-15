import React from "react";
import { DollarOutlined, SafetyOutlined, BarChartOutlined, ToolOutlined, } from "@ant-design/icons";
import { Typography } from "antd";
import "./style.scss";

const { Title } = Typography;

const features = [
  {
    icon: <DollarOutlined />,
    title: "Smart Investment in EVs",
    desc: "Co-owning an electric car lets you invest smartly and earn from sustainable mobility.",
    color: "green",
  },
  {
    icon: <SafetyOutlined />,
    title: "Verified Co-ownership System",
    desc: "We ensure transparent agreements and secure management through our digital platform.",
    color: "blue",
  },
  {
    icon: <BarChartOutlined />,
    title: "Transparent Usage & Revenue",
    desc: "All trips and earnings are tracked in real-time, ensuring fair profit sharing.",
    color: "indigo",
  },
  {
    icon: <ToolOutlined />,
    title: "Expert EV Maintenance",
    desc: "Your EV is maintained by professional technicians to guarantee optimal performance.",
    color: "purple",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us">
      <div className="container">

        <Title level={2} className="title">
          Why Choose Us?
        </Title>

        <div className="features">
          {features.map((item, index) => (
            <div className="feature-card" key={index}>
              <div className={`icon ${item.color}`}>{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
