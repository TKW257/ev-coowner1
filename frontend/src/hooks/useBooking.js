import { useState } from "react";
import { message } from "antd";
import bookingApi from "../api/bookingApi";

export const useBooking = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  const createBooking = async ({ vehicleId, startTime }) => {
    if (!vehicleId || !startTime) {
      message.warning("Vui lòng chọn xe và ngày bắt đầu!");
      return;
    }

    try {
      setLoading(true);
      console.log("%c📦 Booking payload gửi lên server:", "color:#03a9f4", {
        vehicleId,
        startTime,
      });

      // ✅ Endpoint đúng với BE: /bookings/createBooking
      const res = await bookingApi.createBooking({ vehicleId, startTime });

      console.log("%c✅ Booking thành công:", "color:#4caf50", res);
      message.success("Đặt xe thành công!");
      onSuccess?.(res);
      return res;
    } catch (error) {
      console.group("%c❌ Booking Error", "color:#f44336;font-weight:bold");
      console.error("Response:", error.response);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.groupEnd();

      const errMsg =
        error.response?.data?.message || "Đặt xe thất bại, vui lòng thử lại!";
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading };
};
