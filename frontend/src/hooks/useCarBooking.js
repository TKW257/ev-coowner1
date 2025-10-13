// src/hooks/useCarBooking.js
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import bookingApi from "../api/bookingApi";
import vehiclesApi from "../api/vehiclesApi";

dayjs.extend(isBetween);

const useCarBooking = (carId, notification) => {
  const [car, setCar] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  
  // GET DATA XE và BOOKINGs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [carRes, bookingRes] = await Promise.all([
          vehiclesApi.getCarById(carId),
          bookingApi.getAllBookings(),
        ]);
        setCar(carRes);
        setBookings(bookingRes.data || bookingRes || []);
      } catch (err) {
        console.error("❌ Lỗi tải dữ liệu:", err);
        notification?.error({
          message: "Lỗi tải dữ liệu",
          description: "Không thể tải xe hoặc lịch đặt!",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [carId, notification]);

  // 🟢 Trạng thái của một ngày
  const getDateStatus = (value) => {
    if (!bookings) return "success";
    for (const b of bookings) {
      if (String(b.vehicle_id) !== String(carId)) continue;
      const inRange = dayjs(value).isBetween(dayjs(b.start_time), dayjs(b.end_time), "day", "[]");
      if (inRange) {
        if (b.status === "success" || b.status === "confirmed") return "error";
        if (b.status === "pending") return "warning";
      }
    }
    return "success";
  };

  // BOOKING
  const bookCar = async (range) => {
    if (!range || range.length !== 2) return { success: false, message: "Khoảng ngày không hợp lệ" };

    const start = range[0].startOf("day");
    const end = range[1].endOf("day");

    if (car?.status !== "available") return { success: false, message: "Xe không khả dụng" };

    const isOverlap = bookings.some(
      (b) =>
        String(b.vehicle_id) === String(carId) &&
        b.status !== "cancelled" &&
        dayjs(start).isBefore(dayjs(b.end_time)) &&
        dayjs(end).isAfter(dayjs(b.start_time))
    );

    if (isOverlap) return { success: false, message: "Khoảng thời gian trùng với booking khác" };

    const newBooking = { // data sẽ trả về
      vehicle_id: parseInt(carId),
      name: car?.model || "Xe chưa rõ",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: "pending",
    };

    try {
      await bookingApi.createBooking(newBooking);
      const updated = await bookingApi.getAllBookings();
      setBookings(updated.data || updated || []);
      return { success: true };
    } catch (err) {
      console.error(err);
      return { success: false, message: "Lỗi khi đặt lịch" };
    }
  };

  return { car, bookings, loading, getDateStatus, bookCar };
};

export default useCarBooking;
