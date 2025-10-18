import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button, Skeleton } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import vehiclesApi from "../../../../api/vehiclesApi";
import "./style.scss";

const { Title, Text } = Typography;

const ExploreCars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllVehicles = async () => {
      try {
        const res = await vehiclesApi.getTop4Vehicles();
        console.log("🚗 API trả về:", res);

        // Xử lý kết quả API an toàn
        const vehicles = Array.isArray(res)
          ? res
          : Array.isArray(res?.content)
          ? res.content
          : [];

        setCars(vehicles);
      } catch (err) {
        console.error("❌ Lỗi khi lấy danh sách xe:", err);
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

  // Skeleton hiển thị trong lúc loading
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

  // Render danh sách xe
  const renderCars = () =>
    cars.map((car) => {
      const statusText = car.status || "Unknown";
      const statusLower = statusText.toLowerCase();

      let statusClass = "status-inactive";
      if (statusLower.includes("active") || statusLower.includes("available"))
        statusClass = "status-active";

      return (
        <Col xs={24} sm={12} md={12} lg={6} key={car.vehicleId}>
          <Card
            hoverable
            cover={
              <img
                src={
                  car.imageUrl ||
                  "https://placehold.co/400x250?text=No+Image"
                }
                alt={`${car.brand} ${car.model}`}
                className="car-img"
              />
            }
            className="car-card"
          >
            <div className="car-info">
              <Title level={4} className="car-name">
                {car.brand} {car.model} ({car.year})
              </Title>

              <div className="car-details">
                <Text className="car-battery">
                  <ThunderboltOutlined />{" "}
                  {car.batteryCapacityKwh
                    ? `${car.batteryCapacityKwh} kWh`
                    : "N/A"}
                </Text>
                <Text className={`car-status ${statusClass}`}>
                  ● {statusText}
                </Text>
              </div>

              <div className="car-actions">
                <Button type="default">Xem chi tiết</Button>
                <Button type="primary" style={{ marginLeft: 8 }}>
                  Góp vốn ngay
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      );
    });

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
