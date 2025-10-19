import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Empty, message } from "antd";
import bookingApi from "../../../../api/bookingApi";
import { useParams } from "react-router-dom";

const BookingHistorySection = () => {
  const { vehicleId } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vehicleId) return;

    const fetchBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingApi.getBookingsByVehicle(vehicleId);
        setBookings(Array.isArray(res) ? res : res.data || []);
      } catch (error) {
        console.error("❌ Lỗi khi tải lịch sử đặt xe:", error);
        message.error("Không thể tải lịch sử đặt xe!");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [vehicleId]);

  // ----- Cancel booking -----
  const handleCancel = async (record) => {
    try {
      await bookingApi.cancelBooking(record.bookingId); // Gọi API hủy booking
      message.success(`Hủy booking thành công cho xe ${record.vehicleName || record.model}!`);

      // Cập nhật trạng thái booking trong table
      setBookings((prev) =>
        prev.map((b) =>
          b.bookingId === record.bookingId ? { ...b, bookingStatus: "Cancelled" } : b
        )
      );
    } catch (error) {
      console.error("❌ Lỗi khi hủy booking:", error);
      message.error("Không thể hủy booking. Vui lòng thử lại!");
    }
  };

  // ----- Format ngày giờ -----
  const formatDateTimeArray = (arr) => {
    if (!arr || !Array.isArray(arr) || arr.length < 3) return "-";
    const [year, month, day, hour = 0, minute = 0, second = 0] = arr;
    const mm = month.toString().padStart(2, "0");
    const dd = day.toString().padStart(2, "0");
    const hh = hour.toString().padStart(2, "0");
    const min = minute.toString().padStart(2, "0");
    const ss = second.toString().padStart(2, "0");
    return `${year}-${mm}-${dd} ${hh}:${min}:${ss}`;
  };

  // ----- Table columns -----
  const columns = [
    {
      title: "STT",
      dataIndex: "stt",
      align: "center",
      render: (_, __, index) => index + 1,
      width: 70,
    },
    {
      title: "Từ ngày",
      dataIndex: "startTime",
      render: formatDateTimeArray,
    },
    {
      title: "Đến ngày",
      dataIndex: "endTime",
      render: formatDateTimeArray,
    },
    {
      title: "Điểm ưu tiên",
      dataIndex: "priorityScore",
      align: "center",
      render: (score) =>
        score != null ? (
          <Tag color={score >= 8 ? "blue" : score >= 5 ? "green" : "orange"}>
            {Number(score).toFixed(2)}
          </Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Trạng thái",
      dataIndex: "bookingStatus",
      render: (status) => {
        const colorMap = {
          Confirmed: "green",
          Pending: "orange",
          Cancelled: "red",
          Completed: "blue",
        };
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      align: "center",
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          disabled={!["Pending", "Confirmed"].includes(record.bookingStatus)} // Cho phép hủy cả Pending và Confirmed
          onClick={() => handleCancel(record)}
        >
          Cancel
        </Button>
      ),
    },
  ];

  return (
    <>
      {!loading && bookings.length === 0 ? (
        <Empty description="Chưa có lịch sử đặt xe" />
      ) : (
        <Table
          rowKey="bookingId"
          columns={columns}
          dataSource={bookings}
          pagination={false}
          bordered
          loading={loading}
        />
      )}
    </>
  );
};

export default BookingHistorySection;
