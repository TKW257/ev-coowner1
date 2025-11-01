import React from "react";
import { Row, Col, Typography, Space, Card } from "antd";
import {
  CarOutlined,
  FileProtectOutlined,
  SolutionOutlined,
  ThunderboltOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import "./style.scss";

const { Title, Paragraph } = Typography;

const steps = [
  {
    icon: <CarOutlined />,
    title: "Đăng Ký & Chọn Mẫu Xe Yêu Thích",
    desc: "Tạo tài khoản trên nền tảng của chúng tôi và khám phá danh sách các mẫu xe điện hiện đại. Lựa chọn chiếc xe phù hợp với nhu cầu và phong cách của bạn.",
  },
  {
    icon: <FileProtectOutlined />,
    title: "Xác Nhận Phần Đồng Sở Hữu",
    desc: "Chọn tỷ lệ sở hữu mong muốn. Mọi thông tin được xác minh và bảo mật tuyệt đối, đảm bảo quyền lợi của bạn trong suốt quá trình sử dụng.",
  },
  {
    icon: <SolutionOutlined />,
    title: "Ký Hợp Đồng & Thanh Toán Linh Hoạt",
    desc: "Hoàn tất quy trình bằng hợp đồng điện tử minh bạch. Thanh toán qua các phương thức an toàn và được chứng thực bởi hệ thống của chúng tôi.",
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Kích Hoạt Quyền Sở Hữu & Đặt Lịch Sử Dụng",
    desc: "Ngay sau khi hoàn tất thủ tục, bạn có thể đặt lịch sử dụng xe linh hoạt – thuận tiện cho công việc, du lịch hay nhu cầu cá nhân.",
  },
  {
    icon: <LineChartOutlined />,
    title: "Theo Dõi & Quản Lý Thông Minh",
    desc: "Quản lý phần sở hữu, lịch sử sử dụng và tình trạng xe dễ dàng qua bảng điều khiển trực tuyến – minh bạch, nhanh chóng, mọi lúc mọi nơi.",
  },
];

const HowToCoOwn = () => {
  return (
    <section className="how-to-coown">
      <div className="container">
        <Title level={2} className="section-title text-center">
          Cách Thức Cùng Sở Hữu Xe Điện
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
               <img
                src="https://tse2.mm.bing.net/th/id/OIP.0sAlfje-yr5Uh5JSNVlz2QHaE_?w=1900&h=1280&rs=1&pid=ImgDetMain&o=7&rm=3"
                alt="Electric car"
                className="ev-image main"
              />
            </div>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HowToCoOwn;
