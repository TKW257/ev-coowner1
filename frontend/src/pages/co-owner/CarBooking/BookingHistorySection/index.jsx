import React, { useState, useEffect } from "react";
import { Table, Tag, Button, Empty, message } from "antd";
import dayjs from "dayjs";
import bookingApi from "../../../../api/bookingApi";
import { useParams } from "react-router-dom";

const BookingHistorySection = () => {
  const { vehicleId } = useParams(); 
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vehicleId) return;

    const fetchVehicle = async () => {
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

    fetchVehicle();
  }, [vehicleId]);

  const handlePayment = (record) => {
    message.success(`Thanh toán thành công cho xe ${record.vehicleName || record.model}!`);
  };

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
      render: (t) => dayjs(t).format("DD/MM/YYYY"),
    },
    {
      title: "Đến ngày",
      dataIndex: "endTime",
      render: (t) => dayjs(t).format("DD/MM/YYYY"),
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
          disabled={!["Confirmed", "Completed"].includes(record.bookingStatus)}
          onClick={() => handlePayment(record)}
        >
          Thanh toán
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
