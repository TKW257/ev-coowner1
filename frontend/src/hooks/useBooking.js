import { useState } from "react";
import { App } from "antd"; 
import bookingApi from "../api/bookingApi";


export const useBooking = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();

  const createBooking = async ({ vehicleId, startTime, endTime }) => {
    if (!vehicleId || !startTime || !endTime) {
      notification.warning({
        message: "Thiếu thông tin đặt xe",
        description: "Vui lòng chọn xe và khoảng thời gian!",
        placement: "topRight",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("%c📦 Booking payload gửi lên server:", "color:#03a9f4", {
        vehicleId,
        startTime,
        endTime,
      });

      const res = await bookingApi.createBooking({ vehicleId, startTime, endTime });
      console.log("%c✅ Booking thành công:", "color:#4caf50", res);

      notification.success({
        message: "Đặt xe thành công!",
        description: res?.message || "Bạn đã đặt xe thành công.",
        placement: "topRight",
      });

      onSuccess?.(res);
      return res;
    } catch (error) {
      console.group("%c❌ Booking Error", "color:#f44336;font-weight:bold");
      console.error("Response:", error.response);
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data);
      console.groupEnd();

      const errMsg = error.response?.data?.message || "Đặt xe thất bại, vui lòng thử lại!";

      notification.error({
        message: "Đặt xe thất bại",
        description: errMsg,
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading };
};
