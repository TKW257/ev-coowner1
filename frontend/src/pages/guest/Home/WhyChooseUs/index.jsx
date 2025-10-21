import React from "react";
import { DollarOutlined, SafetyOutlined, BarChartOutlined, ToolOutlined, } from "@ant-design/icons";
import { Typography } from "antd";
import "./style.scss";

const { Title } = Typography;

const features = [
  {
    icon: <DollarOutlined />,
    title: "Đầu tư thông minh",
    desc: "Cùng sở hữu xe điện giúp bạn đầu tư hiệu quả và thu lợi nhuận từ xu hướng di chuyển xanh bền vững.",
    color: "green",
  },
  {
    icon: <SafetyOutlined />,
    title: "Hệ thống đồng sở hữu minh bạch",
    desc: "Chúng tôi đảm bảo các thỏa thuận rõ ràng và quản lý an toàn thông qua nền tảng số.",
    color: "blue",
  },
  {
    icon: <BarChartOutlined />,
    title: "Minh bạch trong sử dụng & chi tiêu",
    desc: "Mọi chuyến đi và chi tiêu đều được theo dõi theo thời gian thực, đảm bảo chia sẻ công bằng.",
    color: "indigo",
  },
  {
    icon: <ToolOutlined />,
    title: "Bảo trì chuyên nghiệp",
    desc: "Xe của bạn được bảo dưỡng bởi đội ngũ kỹ thuật viên chuyên môn, đảm bảo hiệu suất tối ưu.",
    color: "purple",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="why-choose-us">
      <div className="container">

        <Title level={2} className="title">
          Tại Sao Nên Chọn CoEV?
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
