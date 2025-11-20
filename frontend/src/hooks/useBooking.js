import { useState } from "react";
import { App } from "antd";
import bookingApi from "../api/bookingApi";

export const useBooking = (onSuccess) => {
  const [loading, setLoading] = useState(false);
  const { notification } = App.useApp();

  const notify = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
    });
  };

  const createBooking = async ({ vehicleId, startTime, endTime }) => {
    if (!vehicleId || !startTime || !endTime) {
      return notify("warning", "Thiếu thông tin đặt xe", "Vui lòng chọn xe và khoảng thời gian!");
    }

    try {
      setLoading(true);
      console.log("%c Booking payload:", "color:#03a9f4", { vehicleId, startTime, endTime });

      const res = await bookingApi.createBooking({ vehicleId, startTime, endTime });
      console.log("%c Booking thành công:", "color:#4caf50", res);

      notify("success", "Đặt xe thành công!", "Bạn đã đặt xe thành công.");
      onSuccess?.(res);
      return res;
    } catch (error) {
      console.error("%c Booking Error", "color:#f44336;font-weight:bold", error);
      notify(
        "error",
        "Đặt xe thất bại",
        "Vui lòng không chọn ngày trong quá khứ và ngày đã đặt!"
      );
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading };
};
