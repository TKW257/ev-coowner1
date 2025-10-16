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
              Find cars for sale and for rent near you
            </Text>
            <Title level={1} className="banner-title">
              Find Your Perfect Car
            </Title>
            <Text className="banner-desc">
              Or Browse Featured Model
            </Text>
          </div>
        </div>
      </section>

      {/* Brand */}
      <section className="brand-section">

        <Title level={2} className="section-title">
          Explore Our Premium Brands
        </Title>

        <Row gutter={[24, 24]} justify="center">
          {[
            { name: "BMW", img: "https://tse4.mm.bing.net/th/id/OIP.mthtoWZ8AXcJRR8o8pXD2wHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" },
            { name: "Ford", img: "https://tse4.mm.bing.net/th/id/OIP.mthtoWZ8AXcJRR8o8pXD2wHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" },
            { name: "Mercedes Benz", img: "https://tse4.mm.bing.net/th/id/OIP.mthtoWZ8AXcJRR8o8pXD2wHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" },
            { name: "Peugeot", img: "https://tse4.mm.bing.net/th/id/OIP.mthtoWZ8AXcJRR8o8pXD2wHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3https://tse4.mm.bing.net/th/id/OIP.QZRUtEA8SeOZrUtbE7XCegHaHa?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3" },
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


