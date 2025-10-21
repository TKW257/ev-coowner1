import React from "react";
import { Typography, Row, Col, Card } from "antd";
import ExploreCars from "../ExploreCars";
import WhyChooseUs from "../WhyChooseUs";
import HowToUse from "../HowToUse";
import OurTerms from "../OurTerms";
import "./style.scss";

const { Title, Text } = Typography;

const HomePage = () => {
  return (
    <div className="home-page">

      {/* Banner */}
      <section className="banner-section">
        <div className="banner-overlay">
          <div className="banner-content">
            <Text className="banner-subtitle">
              Tìm kiếm xe điện để cùng sở hữu
            </Text>
            <Title level={1} className="banner-title">
              Cùng Sở Hữu Chiếc Xe Điện Mơ Ước
            </Title>
            <Text className="banner-desc">
              Hoặc khám phá các mẫu xe điện nổi bật
            </Text>
          </div>
        </div>
      </section>
      {/* Brand */}
      <section className="brand-section">

        <Title level={2} className="section-title">
          Khám phá các thương hiệu hợp tác
        </Title>

        <Row gutter={[24, 24]} justify="center">
          {[
            { name: "Tesla", img: "https://tse4.mm.bing.net/th/id/OIP.mthtoWZ8AXcJRR8o8pXD2wHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" },
            { name: "BMW", img: "https://th.bing.com/th/id/R.d45479756a9d282b98cbb989c5465471?rik=6w1MsZS1pekLOQ&riu=http%3a%2f%2fwallsdesk.com%2fwp-content%2fuploads%2f2016%2f05%2fLogo-Of-BMW.png&ehk=80VGTDIukdAFsBp64eEKUyPmyOJR4dQWRTpi5qAWSDE%3d&risl=&pid=ImgRaw&r=0" },
            { name: "Nissan", img: "https://tse1.mm.bing.net/th/id/OIP.leSSaZ4ptQPVOerm9RGPhgHaEK?cb=12&w=650&h=366&rs=1&pid=ImgDetMain&o=7&rm=3" },
            { name: "VinFast ", img: "https://th.bing.com/th/id/OIP.E8iG97u0gt7cY0UNbhbouAHaHH?o=7&cb=12rm=3&rs=1&pid=ImgDetMain&o=7&rm=3" },
          ].map((brand, index) => (

            <Col xs={12} sm={8} md={6} lg={4} key={index}>
              <Card hoverable variant="outlined" className="brand-card">
                <img src={brand.img} alt={brand.name} className="brand-logo" />
                <Text className="brand-name">{brand.name}</Text>
              </Card>
            </Col>

          ))}
        </Row>
      </section>

      <ExploreCars />
      <HowToUse />
      <WhyChooseUs />
      <OurTerms />

    </div>
  );
};

export default HomePage;


