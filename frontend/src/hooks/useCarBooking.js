import { useState, useEffect } from "react";
import bookingApi from "../api/bookingApi";
import vehiclesApi from "../api/vehiclesApi";
import { isDateInRange, isRangeOverlap } from "../utils/dateUtils";
import { useSelector } from "react-redux";

const useCarBooking = (carId, notification) => {
  const currentUser = useSelector((state) => state.user.current);
  const [car, setCar] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [carRes, bookingRes] = await Promise.all([
          vehiclesApi.getCarById(carId),
          bookingApi.getAllBookings(),
        ]);
        setCar(carRes?.data || carRes);
        setBookings(bookingRes?.data || []);
      } catch (error) {
        console.error("Load data error:", error);
        notification?.error({
          message: "Lỗi tải dữ liệu",
          description: "Không thể tải xe hoặc lịch đặt!",
        });
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [carId, notification]);

  // ✅ dùng utils isDateInRange()
  const getDateStatus = (value) => {
    if (!bookings?.length) return "success";

    for (const b of bookings) {
      if (String(b.vehicle_id) !== String(carId)) continue;

      if (isDateInRange(value, b.start_time, b.end_time)) {
        if (b.user?.id === currentUser?.id) return "processing";
        if (b.status === "pending") return "warning";
        if (b.status === "confirmed") return "error";
      }
    }
    return "success";
  };

  // ✅ dùng utils isRangeOverlap()
  const bookCar = async (range) => {
    if (!range || range.length !== 2)
      return { success: false, message: "Khoảng ngày không hợp lệ" };

    const newRange = {
      start: range[0].startOf("day"),
      end: range[1].endOf("day"),
    };

    const overlap = bookings.some(
      (b) =>
        String(b.vehicle_id) === String(carId) &&
        b.status !== "cancelled" &&
        isRangeOverlap(
          { start: newRange.start, end: newRange.end },
          { start: b.start_time, end: b.end_time }
        )
    );

    if (overlap) return { success: false, message: "Khoảng thời gian đã được đặt" };

    const newBooking = {
      vehicle_id: parseInt(carId),
      userId: currentUser?.id,
      name: car?.model || "Xe chưa rõ",
      start_time: newRange.start.toISOString(),
      end_time: newRange.end.toISOString(),
      status: "pending",
    };

    try {
      await bookingApi.createBooking(newBooking);
      const updated = await bookingApi.getAllBookings();
      setBookings(updated?.data || updated);
      return { success: true };
    } catch (error) {
      console.error("Booking error:", error);
      return { success: false, message: "Lỗi khi đặt lịch" };
    }
  };

  return { car, bookings, loading, getDateStatus, bookCar };
};

export default useCarBooking;
