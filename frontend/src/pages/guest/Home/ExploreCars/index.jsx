import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button, Skeleton } from "antd";
import vehiclesApi from "../../../../api/vehiclesApi";
import "./style.scss";

const { Title, Text } = Typography;

const ExploreCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchAllVehicles = async () => {
    try {
      const res = await vehiclesApi.getAllVehicles();
      console.log("API trả về:", res);
      const vehicles = Array.isArray(res)
        ? res
        : Array.isArray(res?.content)
        ? res.content
        : [];
      setCars(vehicles);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách xe:", err);
      setCars([]);
    } finally {
      setLoading(false);
    }
  };
  fetchAllVehicles();
}, []);


  const handleViewAll = () => {
    window.location.href = "/cars";
  };

  //SEKELETON
  const renderSkeletons = () =>
    Array.from({ length: 4 }).map((_, index) => (
      <Col xs={24} sm={12} md={12} lg={6} key={`skeleton-${index}`}>
        <Card className="car-card">
          <Skeleton.Image
            active
            style={{ width: "100%", height: 200, borderRadius: 12 }}
          />
          <Skeleton active paragraph={{ rows: 3 }} />
        </Card>
      </Col>
    ));


  const renderCars = () =>
    cars.map((car) => (
      <Col xs={24} sm={12} md={12} lg={6} key={car.id}>
        <Card
          hoverable
          cover={
            <img
              src={car.image_url || "https://via.placeholder.com/400x250?text=No+Image"}
              alt={car.model}
              className="car-img"
            />
          }
          className="car-card"
        >
          <div className="car-info">
            <Title level={4}>
              {car.brand} {car.model} ({car.year})
            </Title>
            <Text className="car-spec">
              💸 {car.operating_cost_per_day ? `$${car.operating_cost_per_day}/day` : "N/A"}{" "}
              &nbsp;|&nbsp; 🚗{" "}
              {car.operating_cost_per_km ? `$${car.operating_cost_per_km}/km` : "N/A"}
            </Text>
            <div className="car-actions">
              <Button type="default">Xem chi tiết</Button>
              <Button type="primary" style={{ marginLeft: 8 }}>
                Góp vốn ngay
              </Button>
            </div>
          </div>
        </Card>
      </Col>
    ));

  return (
    <section className="explore-section">
      <div className="explore-header">
        <Title level={2} className="section-title">
          Featured Electric Vehicles
        </Title>
        <Button type="primary" size="large" onClick={handleViewAll}>
          View All →
        </Button>
      </div>

      <Row gutter={[24, 24]} justify="center">
        {loading || cars.length === 0 ? renderSkeletons() : renderCars()}
      </Row>
    </section>
  );
};

export default ExploreCars;
