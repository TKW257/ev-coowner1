import { Typography, Row, Col, Card } from "antd";
import ExploreCars from "../ExploreCars";
import WhyChooseUs from "../WhyChooseUs";
import HowToUse from "../HowToUse";
import OurTerms from "../OurTerms";
import "./style.scss";
import TeslaLogo from "../../../../assets/Tesla.webp";
import BMWLogo from "../../../../assets/BMW.png";
import VinLogo from "../../../../assets/Vin.jpg";
import LexusLogo from "../../../../assets/Lexus.jpg";
import BG from "../../../../assets/BG.webp";

const { Title, Text } = Typography;

const HomePage = () => {
  return (
    <div className="home-page">

      {/* Banner */}
      <section
        className="banner-section"
        style={{ backgroundImage: `url(${BG})` }}
      >
        <div className="banner-overlay">
          <div className="banner-content">
            <Text className="banner-subtitle">
              Tham gia mô hình đồng sở hữu xe điện – tiết kiệm hơn, thân thiện hơn, vì một hành tinh xanh hơn.
            </Text>
            <Title level={1} className="banner-title">
              Cùng Sở Hữu, Hướng Đến Tương Lai Xanh
            </Title>
            <Text className="banner-desc">
              Khám phá các mẫu xe điện nổi bật
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
            { name: "Tesla", img: TeslaLogo },
            { name: "BMW", img: BMWLogo },
            { name: "Lexus", img: LexusLogo },
            { name: "VinFast ", img: VinLogo },
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


