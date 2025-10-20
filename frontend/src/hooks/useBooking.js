import { useState } from "react";
import { App } from "antd"; // dùng notification từ AntdApp
import bookingApi from "../api/bookingApi";

export const useBooking = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp(); // ✅ lấy notification từ AntdApp

  const createBooking = async ({ vehicleId, startTime }) => {
    if (!vehicleId || !startTime) {
      notification.warning({
        message: "Thiếu thông tin đặt xe",
        description: "Vui lòng chọn xe và ngày bắt đầu!",
        placement: "topRight",
      });
      return;
    }

    try {
      setLoading(true);
      console.log("%c📦 Booking payload gửi lên server:", "color:#03a9f4", {
        vehicleId,
        startTime,
      });

      const res = await bookingApi.createBooking({ vehicleId, startTime });
      console.log("%c✅ Booking thành công:", "color:#4caf50", res);

      // Hiển thị notification thành công
      notification.success({
        message: "Đặt xe thành công!",
        description: res?.message || "Bạn đã đặt xe thành công.",
        placement: "topRight",
      });

      // Giữ nguyên logic cũ
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

      // Hiển thị notification lỗi
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
