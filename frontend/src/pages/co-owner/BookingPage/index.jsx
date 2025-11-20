import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useBooking } from "../../../hooks/useBooking";
import { App } from "antd";
import { Calendar, Tag, DatePicker, Typography, Button, Card, Spin, Alert } from "antd";
import bookingApi from "../../../api/bookingApi";
import vehicleApi from "../../../api/vehiclesApi";
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

  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [singleDate, setSingleDate] = useState(null);
  const { createBooking, loading } = useBooking(onBookingSuccess);

  const [disputeWindows, setDisputeWindows] = useState([]);
  const [disputeLoading, setDisputeLoading] = useState(false);
  const { message } = App.useApp();

  const getCarImageUrl = (imagePath) => {
    if (!imagePath) return "";
    return `${baseURL}/${imagePath.replaceAll("\\", "/")}`;
  };

  const formatDateTime = (arr) => {
    if (!arr || arr.length < 3) return "—";
    return dayjs(
      new Date(arr[0], arr[1] - 1, arr[2], arr[3] || 0, arr[4] || 0, arr[5] || 0)
    ).format("DD/MM/YYYY HH:mm");
  };

  /* Get chosen car data */
  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) return;
      try {
        const res = await vehicleApi.getById(vehicleId);
        const data = res?.data || res;
        setVehicle(data);
        console.log("%c Chosen car response:", "color:green", res);


      } catch (err) {
        console.error(" Lỗi khi tải thông tin xe:", err);
      }
    };
    fetchVehicle();
  }, [vehicleId]);


  /* Get status to dispay in calendar */
  useEffect(() => {
    if (!vehicleId) return;

    const fetchBookings = async () => {
      setBookingsLoading(true);
      try {
        const res = await bookingApi.getVehicleSchedule(vehicleId);
        const data = res?.data || res;
        console.log("Schedule response:", data);
        setBookings(data);
      } catch (err) {
        console.error("Lỗi khi tải lịch sử đặt xe:", err);
      } finally {
        setBookingsLoading(false);
      }
    };

    fetchBookings();
  }, [vehicleId]);

  /* Get Dispute days by Chosen Car */
  useEffect(() => {
    if (!vehicleId) return;

    const fetchDisputeWindows = async () => {
      setDisputeLoading(true);
      try {
        const currentYear = dayjs().year();
        const currentMonth = dayjs().month() + 1; // month() trả 0-11

        const res = await bookingApi.getDisputeWindows(vehicleId, currentYear, currentMonth);
        const data = res?.data || res;
        setDisputeWindows(data);
        console.log("%c Dispute Day:", "color:orange", data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu tranh chấp:", err);
      } finally {
        setDisputeLoading(false);
      }
    };

    fetchDisputeWindows();
  }, [vehicleId]);


  // Date Selection 
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

  /* Create Booking */
  const handleBooking = async () => {

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

  /* Create Single Booking */
  const handleSingleBooking = async () => {
    if (!singleDate) return;

    const startTime = singleDate.hour(4).minute(0).second(0);
    const endTime = singleDate.hour(23).minute(0).second(0);

    const payload = {
      vehicleId: Number(vehicleId),
      startTime: startTime.format("YYYY-MM-DD HH:mm:ss"),
      endTime: endTime.format("YYYY-MM-DD HH:mm:ss"),
    };

    console.log("Booking 1 ngày:", payload);

    await createBooking(payload);
  };


  // Block pick date (month)
  const disabledDate = (current) => {
    return !current.isSame(now, "month");
  };

  // Identify status schedule
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

      // compare date match
      if (dayOnly.isBetween(start, end, "day", "[]")) {
        return status; // stop if found
      }
    }

    return null;
  };


  // Render schedule stautus
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

      {/* Chosen car to book */}
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
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {/* Chọn 1 ngày duy nhất */}
                <div className="booking-actions-one">
                  <DatePicker
                    placeholder="Chọn 1 ngày"
                    format="DD/MM/YYYY"
                    value={singleDate}
                    onChange={(value) => setSingleDate(value)}
                    style={{ marginTop: 8 }}
                    disabledDate={(date) => !date.isSame(now, "month")}
                  />

                  <Button
                    type="primary"
                    loading={loading}
                    onClick={handleSingleBooking}
                    disabled={!singleDate}
                  >
                    Đặt 1 ngày
                  </Button>
                </div>

                {/* Chọn range ngày  */}
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
        </div>
      </Card>


      {/* Calendar  display  status by day */}
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

      {/* Table dispute day */}
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
                <th style={{ padding: "8px" }}>Giới hạn đặt lịch</th>
                <th style={{ padding: "8px" }}>Thời gian tranh chấp</th>
              </tr>
            </thead>
            <tbody>
              {disputeWindows.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px" }}>{formatDateTime(item.date)}</td>
                  <td style={{ padding: "8px" }}>{formatDateTime(item.firstCreatedAt)}</td>
                  <td style={{ padding: "8px" }}>{formatDateTime(item.windowEndAt)}</td>
                  <td style={{ padding: "8px" }}>
                    <Tag color="red">{item.windowHours} giờ</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

    </div>
  );
};

export default BookingPage;





