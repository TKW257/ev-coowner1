import React, { useState, useEffect } from "react";
import { Calendar, Badge, DatePicker, Button, message, Card, Row, Col, Progress, Tag, Spin, } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { useParams } from "react-router-dom";
import bookingApi from "../../../api/bookingApi";
import vehiclesApi from "../../../api/vehiclesApi";
import { ThunderboltOutlined } from "@ant-design/icons";

dayjs.extend(isBetween);
const { RangePicker } = DatePicker;

const CarBookingPage = () => {
  const { id } = useParams();
  const [range, setRange] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy dữ liệu xe và lịch đặt
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carRes, bookingRes] = await Promise.all([
          vehiclesApi.getCarById(id),
          bookingApi.getBookings(),
        ]);
        setCar(carRes);
        setBookings(bookingRes || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        message.error("Không thể tải dữ liệu xe hoặc lịch đặt!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🔹 Lấy danh sách lịch đã đặt theo xe
  const getListData = (value) =>
    bookings
      .filter(
        (r) =>
          String(r.vehicle_id) === String(id) &&
          dayjs(value).isBetween(dayjs(r.start_time), dayjs(r.end_time), "day", "[]")
      )
      .map((r) => ({
        type: r.status === "success" ? "success" : "warning",
        content: r.name || "Đã đặt",
        id: r.id,
      }));

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {listData.map((item) => (
          <li key={item.id}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender = (current, info) =>
    info.type === "date" ? dateCellRender(current) : info.originNode;

  // 🔹 Xử lý đặt lịch
  const handleBook = async () => {
    if (!range || range.length !== 2) {
      message.warning("Vui lòng chọn khoảng ngày hợp lệ!");
      return;
    }

    const start = range[0].startOf("day");
    const end = range[1].endOf("day");

    const newBooking = {
      vehicle_id: parseInt(id),
      name: car?.model || "Xe chưa rõ",
      image: car?.imageUrl || "",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "success",
    };

    try {
      await bookingApi.createBooking(newBooking);
      message.success("✅ Đặt lịch thành công!");
      const updated = await bookingApi.getBookings();
      setBookings(updated || []);
    } catch (err) {
      console.error("❌ Lỗi khi đặt lịch:", err);
      message.error("Không thể đặt lịch!");
    }
  };

  // 🔹 Loading
  if (loading)
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <Spin tip="Đang tải dữ liệu xe..." size="large" />
      </div>
    );

  if (!car)
    return (
      <div style={{ padding: 24 }}>
        <Card>Không tìm thấy xe có ID {id}</Card>
      </div>
    );

  // 🔹 Giao diện chính
  return (
    <div style={{ padding: 24 }}>
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          background: "#fafafa",
        }}
      >
        {/* Phần đầu: thông tin xe + pin */}
        <Row gutter={[24, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <img
              src={car.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"}
              alt={car.model}
              style={{
                width: "100%",
                borderRadius: 12,
                objectFit: "cover",
                maxHeight: 200,
              }}
            />
          </Col>

          <Col xs={24} md={16}>
            <h2 style={{ margin: 0, fontWeight: 700 }}>
              {car.brand} {car.model}
            </h2>
            <p style={{ color: "#555", marginTop: 4 }}>
              Biển số: {car.plateNumber} • Năm: {car.year}
            </p>

            <Tag color={car.status === "available" ? "green" : "orange"}>
              {car.status === "available" ? "Sẵn sàng" : "Đang được đặt"}
            </Tag>

            <div style={{ marginTop: 12 }}>
              <Progress
                percent={car.batteryCapacityKwh}
                size="small"
                strokeColor="#52c41a"
                showInfo={false}
              />
              <p style={{ color: "#666", marginTop: 4 }}>
                ⚡ Dung lượng pin: <b>{car.batteryCapacityKwh}%</b>
              </p>
              <p style={{ color: "#666" }}>
                💰 Chi phí: {car.operatingCostPerDay}₫ / ngày • {car.operatingCostPerKm}₫ / km
              </p>
            </div>

            <div style={{ marginTop: 12 }}>
              <RangePicker
                onChange={setRange}
                format="DD/MM/YYYY"
                placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
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

        {/* Lịch đặt xe */}
        <Calendar cellRender={cellRender} />
      </Card>
    </div>
  );
};

export default CarBookingPage;
