import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Tag, DatePicker, Typography, Button, message, Card, Spin, Alert } from "antd";
import bookingApi from "../../../api/bookingApi";
import { useBooking } from "../../../hooks/useBooking";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "./style.scss";
dayjs.extend(isBetween);

const now = dayjs();
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const BookingPage = ({ onBookingSuccess }) => {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [startDate, setStartDate] = useState(null);

  const [endDate, setEndDate] = useState(null);
  const { createBooking, loading } = useBooking(onBookingSuccess);

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);


  //✅ lấy data 1 xe 
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) return;
      try {
        const res = await bookingApi.getBookingsByVehicle(vehicleId);
        console.log("%c✅ Booking API response:", "color:green", res);
        if (Array.isArray(res) && res.length > 0) {
          setVehicle(res[0]);
        } else {
          setVehicle(res?.vehicle || {});
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải thông tin xe:", err);
        message.error("Không thể tải thông tin xe!");
      }
    };
    fetchVehicle();
  }, [vehicleId]);


  // ✅  lấy status của all owner 
  useEffect(() => {
    if (!vehicleId) return;

    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const res = await bookingApi.getVehicleSchedule(vehicleId);
        const data = Array.isArray(res) ? res : res.data || [];
        console.log("✅ API response:", data);
        setBookings(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải lịch sử đặt xe:", err);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [vehicleId]);


  // ✅ Chọn ngày
  const handleDateChange = (value) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(value);
      setEndDate(null);
    } else if (value.isAfter(startDate)) {
      setEndDate(value);
    } else {
      setStartDate(value);
      setEndDate(null);
    }
  };

  // ✅ Submit booking
  const handleBooking = async () => {
    if (!startDate || !endDate) {
      message.warning("Vui lòng chọn ngày bắt đầu và kết thúc!");
      return;
    }

    if (!vehicleId) {
      message.error("Không có vehicleId hợp lệ!");
      return;
    }

    const payload = {
      vehicleId: Number(vehicleId),
      startTime: dayjs(startDate).format("YYYY-MM-DD HH:mm:ss"),
      endTime: dayjs(endDate).format("YYYY-MM-DD HH:mm:ss"),
    };

    console.log("%c🚀 Sending booking request:", "color:#ff9800", payload);
    await createBooking(payload);
  };

  // ❌ Chặn chọn ngoài tháng hiện tại
  const disabledDate = (current) => {
    return !current.isSame(now, "month");
  };

  // ✅ Xác định trạng thái theo ngày
  const getStatusByDate = (date) => {
    for (const booking of bookings) {
      // ✅ convert mảng thời gian thành dayjs
      const startArray = booking.startTime;
      const endArray = booking.endTime;

      if (!Array.isArray(startArray) || !Array.isArray(endArray)) continue;

      const start = dayjs(new Date(...startArray));
      const end = dayjs(new Date(...endArray));
      const status = booking.bookingStatus?.toLowerCase();

      if (date.isBetween(start, end, "day", "[]")) {
        return status;
      }
    }
    return null;
  };

  // ✅ Render trạng thái trong lịch
  const renderCell = (date) => {
    const status = getStatusByDate(date);
    if (!status) return null;

    const colors = {
      inprogress: "blue",
      completed: "green",
      pending: "gold",
    };

    return (
      <div style={{ textAlign: "center" }}>
        <Tag color={colors[status] || "default"} style={{ fontSize: 11, borderRadius: 6 }}>
          {status === "inprogress"
            ? "Đang chạy"
            : status === "completed"
              ? "Hoàn tất"
              : status === "pending"
                ? "Chờ duyệt"
                : status}
        </Tag>
      </div>
    );
  };



  if (!vehicle)
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Text>Đang tải thông tin xe...</Text>
      </div>
    );

  return (
    <div style={{ padding: 24 }}>

      {/* CURRENT CAR */}
      <Card className="car-card">
        <div className="car-card-content">
          <img src={vehicle.imageUrl || "/placeholder-car.png"} alt={vehicle.model} className="car-image" />
          <div className="car-info">
            <Title level={4} className="car-title">
              {vehicle.brand} {vehicle.model}
            </Title>
            <Text className="car-subtitle">
              Năm {vehicle.year} • Biển số: {vehicle.licensePlate}
            </Text>
            <Tag color="blue" className="status-tag">
              {vehicle.status}
            </Tag>

            <div className="booking-section">
              <Text className="booking-text">
                Chọn khoảng ngày để đặt xe. Thời gian mặc định: từ <b>4:00</b> đến{" "}
                <b>23:00</b> của ngày kết thúc.
              </Text>

              <div className="booking-actions">
                <RangePicker
                  disabledDate={disabledDate}
                  format="DD/MM/YYYY"
                  value={
                    startDate && endDate
                      ? [startDate, endDate]
                      : startDate
                        ? [startDate, null]
                        : []
                  }
                  onChange={(dates) => {
                    setStartDate(dates?.[0] || null);
                    setEndDate(dates?.[1] || null);
                  }}
                />
                <Button
                  type="primary"
                  loading={loading}
                  onClick={handleBooking}
                  disabled={!startDate || !endDate}
                >
                  Đặt xe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>


      {/* ✅ Calendar hiển thị trạng thái */}
      <Card style={{ borderRadius: 12, marginTop: 24 }}>
        {bookingsLoading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải lịch xe..." />
          </div>
        ) : (
          <>
            <Alert
              message={
                startDate && endDate
                  ? `Khoảng chọn: ${startDate.format("YYYY-MM-DD")} → ${endDate.format("YYYY-MM-DD")}`
                  : startDate
                    ? `Ngày bắt đầu: ${startDate.format("YYYY-MM-DD")}`
                    : "Chưa chọn ngày nào"
              }
              style={{ marginBottom: 16 }}
            />
            <Calendar
              fullscreen={false}
              cellRender={renderCell}
              onSelect={handleDateChange} />
          </>
        )}
      </Card>
    </div>
  );
};

export default BookingPage;





