import React, { useEffect, useState } from "react";
import { Card, Row, Col, Progress, Tag, Typography, Button, message } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";  
import { useSelector } from "react-redux";      
import vehiclesApi from "../../../api/vehiclesApi";

const { Text } = Typography;

function MyCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCar, setCurrentCar] = useState(null);
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.current);
  const chosenCar = cars.find((car) => car.id === currentCar);

  const handleBookCar = (car) => {
    navigate(`/owner/carbooking/${car.id}`, { state: { car } });
  };

  useEffect(() => {
    if (!currentUser?.id) {
      message.error("Không tìm thấy thông tin người dùng! (chưa login?)");
      setLoading(false);
      return;
    }

    const fetchUserCars = async () => {
      try {
        // 🔹 Mock API call (hiện tại gọi mock)
        const res = await vehiclesApi.getCarsByUser(currentUser.id);

        // Giả sử mock API trả về mảng [{id, brand, model, ...}]
        setCars(res || []);
        setCurrentCar(res?.[0]?.id || null);
      } catch (error) {
        console.error("❌ Lỗi khi tải danh sách xe:", error);
        message.error("Không thể tải danh sách xe của bạn");
      } finally {
        setLoading(false);
      }
    };

    fetchUserCars();
  }, [currentUser]);

  if (loading) return <p style={{ padding: 24 }}>⏳ Đang tải dữ liệu xe của bạn...</p>;

  if (!cars.length)
    return (
      <p style={{ padding: 24, textAlign: "center" }}>
        🚗 Bạn chưa có xe nào được đăng ký.
      </p>
    );

  return (
    <div style={{ padding: 24 }}>
      {/* 🔹 Xe hiện tại */}
      {chosenCar && (
        <Card
          variant="outlined"
          style={{
            marginBottom: 24,
            background: "#fafafa",
            borderRadius: 12,
          }}
        >
          <Row gutter={16} align="middle">
            <Col xs={24} sm={10} md={8}>
              <img
                src={chosenCar.imageUrl || "/images/default-car.jpg"}
                alt={chosenCar.model}
                style={{ width: "100%", borderRadius: 10, objectFit: "cover" }}
              />
            </Col>
            <Col xs={24} sm={14} md={16}>
              <Text strong style={{ fontSize: 18 }}>
                {chosenCar.brand} {chosenCar.model}
              </Text>
              <br />
              <Text type="secondary">
                Biển số: {chosenCar.plateNumber || "—"} • Năm: {chosenCar.year || "?"}
              </Text>
              <div style={{ marginTop: 12 }}>
                <Tag color={chosenCar.status === "available" ? "green" : "orange"}>
                  {chosenCar.status || "unknown"}
                </Tag>
              </div>
              <div style={{ marginTop: 16 }}>
                <Progress
                  percent={Math.min(
                    (chosenCar.batteryCapacityKwh || 0) / 1, // mock hiển thị thanh pin
                    100
                  )}
                  size="small"
                  strokeColor="#1677ff"
                  showInfo={false}
                />
                <Text type="secondary">
                  ⚡ Dung lượng pin: {chosenCar.batteryCapacityKwh || "?"} kWh
                </Text>
                <br />
                <Text type="secondary">
                  💰 Chi phí: {chosenCar.operatingCostPerDay || 0}₫ / ngày •{" "}
                  {chosenCar.operatingCostPerKm || 0}₫ / km
                </Text>
              </div>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                style={{ marginTop: 16 }}
                onClick={() => handleBookCar(chosenCar)}
                disabled={chosenCar.status !== "available"}
              >
                Đặt xe
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* 🔹 Danh sách xe khác */}
      <Row gutter={[16, 16]}>
        {cars.map((car) => (
          <Col xs={24} sm={12} md={8} key={car.id}>
            <Card
              hoverable
              variant="outlined"
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
                  src={car.imageUrl || "/images/default-car.jpg"}
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
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}

export default MyCars;
