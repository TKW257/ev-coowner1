import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Calendar, Tag, DatePicker, Typography, Button, message, Card, Spin, Alert } from "antd";
import bookingApi from "../../../api/bookingApi";
import { useBooking } from "../../../hooks/useBooking";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "./style.scss";
dayjs.extend(isBetween);

const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

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

  const [disputeWindows, setDisputeWindows] = useState([]);
  const [disputeLoading, setDisputeLoading] = useState(false);

  const getCarImageUrl = (imagePath) => {
    if (!imagePath) return "";
    return `${baseURL}/${imagePath.replaceAll("\\", "/")}`;
  };


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


  // ✅  lấy status ngày của all owner 
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

  // ✅ Fetch danh sách ngày tranh chấp
  useEffect(() => {
    if (!vehicleId) return;

    const fetchDisputeWindows = async () => {
      setDisputeLoading(true);
      try {
        const currentYear = dayjs().year();
        const currentMonth = dayjs().month() + 1; // month() trả 0-11

        const res = await bookingApi.getDisputeWindows(vehicleId, currentYear, currentMonth);
        const data = Array.isArray(res) ? res : res.data || [];
        console.log("%c✅ Dispute Windows:", "color:orange", data);
        setDisputeWindows(data);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu tranh chấp:", err);
        message.error("Không thể tải dữ liệu tranh chấp!");
      } finally {
        setDisputeLoading(false);
      }
    };

    fetchDisputeWindows();
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

    const startTime = dayjs(startDate).hour(4).minute(0).second(0);
    const endTime = dayjs(endDate).hour(23).minute(0).second(0);

    const payload = {
      vehicleId: Number(vehicleId),
      startTime: startTime.format("YYYY-MM-DD HH:mm:ss"),
      endTime: endTime.format("YYYY-MM-DD HH:mm:ss"),
    };

    console.log("%c🚀 Sending booking request:", "color:#52c41a", payload);
    await createBooking(payload);
  };

  // ❌ Chặn chọn ngoài tháng hiện tại
  const disabledDate = (current) => {
    return !current.isSame(now, "month");
  };

  // ✅ Xác định trạng thái theo ngày
  const getStatusByDate = (date) => {
    const dayOnly = date.startOf("day");

    for (const booking of bookings) {
      const startArray = booking.startTime;
      const endArray = booking.endTime;
      if (!Array.isArray(startArray) || !Array.isArray(endArray)) continue;

      const start = dayjs(
        new Date(startArray[0], startArray[1] - 1, startArray[2])
      ).startOf("day");
      const end = dayjs(
        new Date(endArray[0], endArray[1] - 1, endArray[2])
      ).endOf("day");

      const status = booking.bookingStatus?.toLowerCase();

      // ✅ so sánh theo ngày (bao gồm ranh giới)
      if (dayOnly.isBetween(start, end, "day", "[]")) {
        return status; // ngừng vòng lặp ngay khi match
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
          <img src={getCarImageUrl(vehicle.imageUrl) || "/placeholder-car.png"} alt={vehicle.model} className="car-image" />
          <div className="car-info">
            <Title level={4} className="car-title">
              {vehicle.brand} {vehicle.model}
            </Title>
            <Text className="car-subtitle">
              Năm {vehicle.year} • Biển số: {vehicle.plateNumber}
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
            <Spin size="large" />
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
              disabledDate={(date) => {
                const isSameMonth = date.month() === now.month();
                const isSameYear = date.year() === now.year();
                return !(isSameMonth && isSameYear);
              }}
              onSelect={(date) => {
                if (!date.isSame(now, "month") || !date.isSame(now, "year")) {
                  message.warning("Chỉ được chọn trong tháng và năm hiện tại!");
                  return;
                }
                handleDateChange(date);
              }}
            />
          </>
        )}
      </Card>

      {/* ✅ Bảng hiển thị ngày & thời gian tranh chấp */}
      <Card
        style={{
          borderRadius: 12,
          marginTop: 24,
        }}
        title="Các ngày có tranh chấp trong tháng"
      >
        {disputeLoading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" />
          </div>
        ) : disputeWindows.length === 0 ? (
          <Alert
            message="Không có ngày nào có tranh chấp trong tháng này 🎉"
            type="success"
            showIcon
          />
        ) : (
          <table className="dispute-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f0f2f5", textAlign: "left" }}>
                <th style={{ padding: "8px" }}>Ngày tranh chấp</th>
                <th style={{ padding: "8px" }}>Thời điểm tạo đầu tiên</th>
                <th style={{ padding: "8px" }}>Kết thúc khung giờ</th>
                <th style={{ padding: "8px" }}>Thời lượng (giờ)</th>
              </tr>
            </thead>
            <tbody>
              {disputeWindows.map((item, index) => {
                // format dữ liệu trả về từ backend
                const formatArrayDate = (arr) => {
                  if (!arr || arr.length < 3) return "—";
                  return dayjs(
                    new Date(arr[0], arr[1] - 1, arr[2], arr[3] || 0, arr[4] || 0, arr[5] || 0)
                  ).format("DD/MM/YYYY HH:mm");
                };

                const disputeDate = formatArrayDate(item.date);
                const firstCreated = formatArrayDate(item.firstCreatedAt);
                const windowEnd = formatArrayDate(item.windowEndAt);

                return (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{disputeDate}</td>
                    <td style={{ padding: "8px" }}>{firstCreated}</td>
                    <td style={{ padding: "8px" }}>{windowEnd}</td>
                    <td style={{ padding: "8px" }}>
                      <Tag color="red">{item.windowHours} giờ</Tag>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>


    </div>
  );
};

export default BookingPage;





