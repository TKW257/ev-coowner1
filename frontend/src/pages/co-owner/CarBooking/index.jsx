import React, { useState } from "react";
import {
  App,
  Card,
  Row,
  Col,
  Badge,
  Calendar,
  Tag,
  DatePicker,
  Button,
  Progress,
  Spin,
} from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import useCarBooking from "../../../hooks/useCarBooking";

const { RangePicker } = DatePicker;

const CarBookingPage = () => {
  const { id } = useParams();
  const { notification } = App.useApp();
  const [range, setRange] = useState([]);
  const { car, loading, getDateStatus, bookCar } = useCarBooking(
    id,
    notification
  );

  const handleBook = async () => {
    const res = await bookCar(range);
    if (res.success) {
      notification.success({ message: "Đặt lịch thành công" });
      setRange([]);
    } else {
      notification.warning({ message: res.message });
    }
  };

  const dateCellRender = (value) => (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      <li>
        <Badge status={getDateStatus(value)} />
      </li>
    </ul>
  );

  const cellRender = (current, info) =>
    info.type === "date" ? dateCellRender(current) : info.originNode;

  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spin tip="Đang tải dữ liệu..." size="large" />
      </div>
    );

  if (!car)
    return (
      <div style={{ padding: 24 }}>
        <Card>Không tìm thấy xe có ID {id}</Card>
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <Card
        bordered={false}
        style={{ borderRadius: 16, background: "#fafafa" }}
      >
        <Row gutter={[24, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            {(() => {
              const svg =
                `<?xml version='1.0' encoding='utf-8'?>` +
                `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'>` +
                `<rect width='100%' height='100%' fill='%23e9e9e9'/>` +
                `<text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-family='Arial' font-size='20'>No Image</text>` +
                `</svg>`;
              const placeholder = `data:image/svg+xml;utf8,${encodeURIComponent(
                svg
              )}`;
              return (
                <img
                  src={car.imageUrl || placeholder}
                  alt={car.model}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    objectFit: "cover",
                    maxHeight: 200,
                  }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = placeholder;
                  }}
                />
              );
            })()}
          </Col>

          <Col xs={24} md={16}>
            <h2>
              {car.brand} {car.model}
            </h2>
            <p>
              Biển số: {car.plateNumber} • Năm: {car.year}
            </p>

            <Tag color={car.status === "available" ? "green" : "orange"}>
              {car.status === "available" ? "Sẵn sàng" : "Không khả dụng"}
            </Tag>

            <Progress
              percent={car.batteryCapacityKwh}
              size="small"
              strokeColor="#52c41a"
              showInfo={false}
            />
            <p>
              ⚡ Dung lượng pin: <b>{car.batteryCapacityKwh}%</b>
            </p>
            <p>
              💰 Chi phí: {car.operatingCostPerDay}₫ / ngày •{" "}
              {car.operatingCostPerKm}₫ / km
            </p>

            <div style={{ marginTop: 12 }}>
              <RangePicker
                onChange={setRange}
                value={range}
                format="DD/MM/YYYY"
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
                disabled={car.status !== "available"}
              />
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                onClick={handleBook}
                style={{ marginLeft: 8 }}
                disabled={car.status !== "available"}
              >
                Đặt lịch
              </Button>
            </div>
          </Col>
        </Row>

        <div style={{ marginBottom: 12 }}>
          <Tag color="green">Ngày trống</Tag>
          <Tag color="orange">Đang chờ xác nhận</Tag>
          <Tag color="red">Đã được đặt</Tag>
        </div>

        <Calendar cellRender={cellRender} />
      </Card>
    </div>
  );
};

export default CarBookingPage;
