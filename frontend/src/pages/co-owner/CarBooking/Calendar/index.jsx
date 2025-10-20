import React, { useEffect, useState } from "react";
import { Calendar, Badge, message } from "antd";
import axios from "axios";
import dayjs from "dayjs";

const CalendarSection = ({ vehicleId }) => {
  const [bookings, setBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const res = await axios.get(`/api/bookings/byVehicle/${vehicleId}`);
      setBookings(res.data);
    } catch {
      message.error("Không thể tải lịch xe!");
    }
  };

  useEffect(() => {
    if (vehicleId) fetchBookings();
  }, [vehicleId]);

  const getListData = (value) => {
    const dateStr = value.format("YYYY-MM-DD");
    return bookings
      .filter((b) => dayjs(b.startTime).format("YYYY-MM-DD") === dateStr)
      .map((b) => ({
        type:
          b.bookingStatus === "Confirmed"
            ? "success"
            : b.bookingStatus === "Pending"
            ? "warning"
            : "error",
        content: `${b.userName} (${b.bookingStatus})`,
      }));
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul style={{ padding: 0, listStyle: "none" }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  return <Calendar cellRender={dateCellRender} />;
};

export default CalendarSection;
