import React, { useEffect, useState } from "react";
import { Calendar, Row, Col,  Spin } from "antd";
import { useParams } from "react-router-dom";
import bookingApi from "../../../../api/bookingApi";
import dayjs from "dayjs";

const CalendarSection = () => {
  const { vehicleId } = useParams();
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!vehicleId) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingApi.getVehicleSchedule(vehicleId);

        const data = Array.isArray(res) ? res : res.data || [];
        console.log("✅ API response:", data);
        setBookings(data);
      } catch (error) {
        console.error("❌ Lỗi khi tải lịch sử đặt xe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [vehicleId]);

  const getBookingForDay = (value) => {
    const dateStr = value.format("YYYY-MM-DD");

    const found = bookings.find((b) => {
      if (!b.startTime || !Array.isArray(b.startTime)) return false;

      const [year, month, day, hour, minute] = b.startTime;
      // ⚠️ Trừ 1 cho month vì JS đếm tháng từ 0
      const bookingDate = dayjs(new Date(year, month - 1, day, hour, minute)).format("YYYY-MM-DD");

      return bookingDate === dateStr;
    });

   // if (found) console.log("📆 Found booking on", dateStr, ":", found);
    return found;
  };

  const dateCellRender = (value) => {
    const booking = getBookingForDay(value);
    if (!booking) return null;

    const color =
      booking.bookingStatus === "Pending"
        ? "orange"
        : booking.bookingStatus === "Confirmed"
          ? "green"
          : booking.bookingStatus === "Completed"
            ? "gray"
            : "blue";

    return (
      <span
        style={{
          display: "inline-block",
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
        }}
      />
    );
  };

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "green",
              marginRight: 6,
            }}
          />
          Confirmed
        </Col>
        <Col>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "orange",
              marginRight: 6,
            }}
          />
          Pending
        </Col>
        <Col>
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: "gray",
              marginRight: 6,
            }}
          />
          Completed
        </Col>
      </Row>

      {loading ? <Spin /> : <Calendar cellRender={dateCellRender} />}
    </div>
  );
};

export default CalendarSection;
