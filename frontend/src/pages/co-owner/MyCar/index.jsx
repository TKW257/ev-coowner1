import React, { useEffect, useState } from "react";
import { Card, Row, Col, Progress, Tag, Typography, Button, Spin, message } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import vehiclesApi from "../../../api/vehiclesApi";

const { Text } = Typography;

export default function MyCarsPage() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCar, setCurrentCar] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const res = await vehiclesApi.getCars();
        setCars(res);
        setCurrentCar(res[0]?.id || null);
      } catch (error) {
        console.error("Failed to fetch cars:", error);
        message.error("Không thể tải danh sách xe");
      } finally {
        setLoading(false);
      }
    };
    fetchCars();
  }, []);

  if (loading) return <Spin tip="Đang tải xe..." />;

  const current = cars.find((car) => car.id === currentCar);

  // 🔹 Xử lý điều hướng tới trang đặt xe (gửi ID qua URL + state)
  const handleBookCar = (car) => {
    navigate(`/owner/carbooking/${car.id}`, { state: { car } });
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Thông tin xe hiện tại */}
      {current && (
        <Card
          bordered
          style={{
            marginBottom: 24,
            background: "#fafafa",
            borderRadius: 12,
          }}
        >
          <Row gutter={16} align="middle">
            <Col xs={24} sm={10} md={8}>
              <img
                src={current.imageUrl}
                alt={current.model}
                style={{ width: "100%", borderRadius: 10, objectFit: "cover" }}
              />
            </Col>
            <Col xs={24} sm={14} md={16}>
              <Text strong style={{ fontSize: 18 }}>
                {current.brand} {current.model}
              </Text>
              <br />
              <Text type="secondary">
                Biển số: {current.plateNumber} • Năm: {current.year}
              </Text>
              <div style={{ marginTop: 12 }}>
                <Tag color={current.status === "available" ? "green" : "orange"}>
                  {current.status}
                </Tag>
              </div>
              <div style={{ marginTop: 16 }}>
                <Progress
                  percent={(current.batteryCapacityKwh / 100) * 100}
                  size="small"
                  strokeColor="#1677ff"
                  showInfo={false}
                />
                <Text type="secondary">
                  ⚡ Dung lượng pin: {current.batteryCapacityKwh} kWh
                </Text>
                <br />
                <Text type="secondary">
                  💰 Chi phí: {current.operatingCostPerDay}₫ / ngày • {current.operatingCostPerKm}₫ / km
                </Text>
              </div>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                style={{ marginTop: 16 }}
                onClick={() => handleBookCar(current)}
                disabled={current.status !== "available"}
              >
                Đặt xe
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* Danh sách xe khác */}
      <Row gutter={[16, 16]}>
        {cars.map((car) => (
          <Col xs={24} sm={12} md={8} key={car.id}>
            <Card
              hoverable
              onClick={() => setCurrentCar(car.id)}
              style={{
                border:
                  car.id === currentCar
                    ? "2px solid #1677ff"
                    : "1px solid #f0f0f0",
                borderRadius: 10,
              }}
              cover={
                <img
                  src={car.imageUrl}
                  alt={car.model}
                  style={{
                    height: 160,
                    objectFit: "cover",
                    borderRadius: "10px 10px 0 0",
                  }}
                />
              }
            >
              <Text strong>
                {car.brand} {car.model}
              </Text>
              <br />
              <Text type="secondary">{car.plateNumber}</Text>
              <div style={{ marginTop: 8 }}>
                <Tag color={car.status === "available" ? "green" : "orange"}>
                  {car.status}
                </Tag>
                {car.id === currentCar && (
                  <Tag color="blue" style={{ marginLeft: 6 }}>
                    Xe hiện tại
                  </Tag>
                )}
              </div>
              <Button
                type="link"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBookCar(car);
                }}
                disabled={car.status !== "available"}
              >
                Đặt xe
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
