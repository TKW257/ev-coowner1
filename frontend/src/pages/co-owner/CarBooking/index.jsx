import React, { useState, useEffect } from "react";
import {
  Calendar,
  Badge,
  DatePicker,
  Button,
  Card,
  Row,
  Col,
  Progress,
  Tag,
  Spin,
  App,
} from "antd";
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
  const { notification } = App.useApp();

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
      duration: 3,
    });
  };

  // 🧭 Lấy dữ liệu xe + tất cả bookings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carRes, bookingRes] = await Promise.all([
          vehiclesApi.getCarById(id),
          bookingApi.getAllBookings(),
        ]);
        setCar(carRes);
        setBookings(bookingRes.data || bookingRes || []); // 👈 đảm bảo bookings là mảng
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu:", err);
        openNotification("error", "Lỗi tải dữ liệu", "Không thể tải xe hoặc lịch đặt!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 🟩 Lấy trạng thái ngày trong Calendar
  const getListData = (value) => {
    const list = [];

    bookings.forEach((r) => {
      if (String(r.vehicle_id) !== String(id)) return;
      const isInRange = dayjs(value).isBetween(
        dayjs(r.start_time),
        dayjs(r.end_time),
        "day",
        "[]"
      );
      if (isInRange) {
        if (r.status === "success" || r.status === "confirmed")
          list.push({ type: "error" });
        else if (r.status === "pending")
          list.push({ type: "warning" });
      }
    });

    if (list.length === 0) list.push({ type: "success" }); // ngày trống
    return list;
  };

  // 🗓️ Custom render cho Calendar
  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {listData.map((item, idx) => (
          <li key={idx}>
            <Badge status={item.type} />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender = (current, info) =>
    info.type === "date" ? dateCellRender(current) : info.originNode;

  // 🚗 Hàm đặt xe
  const handleBook = async () => {
    if (!range || range.length !== 2) {
      openNotification("warning", "Khoảng ngày không hợp lệ", "Vui lòng chọn khoảng ngày hợp lệ!");
      return;
    }

    if (car.status !== "available") {
      openNotification("warning", "Xe không sẵn sàng", "Xe hiện không khả dụng để đặt!");
      return;
    }

    const start = range[0].startOf("day");
    const end = range[1].endOf("day");

    // ⚠️ Kiểm tra trùng lịch với tất cả bookings hiện có
    const isOverlap = bookings.some(
      (b) =>
        String(b.vehicle_id) === String(id) &&
        b.status !== "cancelled" &&
        dayjs(start).isBefore(dayjs(b.end_time)) &&
        dayjs(end).isAfter(dayjs(b.start_time))
    );

    if (isOverlap) {
      openNotification(
        "warning",
        "Khoảng thời gian trùng",
        "Khoảng thời gian này đã có người đặt xe!"
      );
      return;
    }

    const newBooking = {
      vehicle_id: parseInt(id),
      name: car?.model || "Xe chưa rõ",
      image: car?.imageUrl || "",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "pending",
    };

    try {
      await bookingApi.createBooking(newBooking);
      openNotification("success", "Thành công", "Đặt lịch xe thành công!");
      const updated = await bookingApi.getAllBookings();
      setBookings(updated.data || updated || []);
      setRange([]);
    } catch (err) {
      console.error("❌ Lỗi khi đặt lịch:", err);
      openNotification("error", "Lỗi đặt lịch", "Không thể đặt lịch. Vui lòng thử lại!");
    }
  };

  // 🌀 Loading UI
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

  // 🚀 Giao diện chính
  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false} style={{ borderRadius: 16, background: "#fafafa" }}>
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
              {car.status === "available" ? "Sẵn sàng" : "Không khả dụng"}
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
