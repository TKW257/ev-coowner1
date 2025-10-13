// src/pages/admin/ManageBookings.jsx
import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Button, message } from "antd";
import booking from "../../../api/bookingApi"; // import API thật

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  // Lấy danh sách booking từ backend, an toàn với undefined
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await booking.getAllBookings();
      // Kiểm tra res.data có tồn tại không
      const data = res?.data || [];
      const mapped = data.map((b) => ({
        id: b.id,
        vehicle: b.vehicle || { name: "Không xác định" },
        user: b.user || { full_name: "Không xác định" },
        startDate: b.startTime ? b.startTime.split("T")[0] : "",
        endDate: b.endTime ? b.endTime.split("T")[0] : "",
        status: b.status || "pending",
      }));
      setBookings(mapped);
    } catch (err) {
      console.error(err);
      message.error("Không tải được booking từ server!");
      setBookings([]); // đảm bảo luôn là mảng
    } finally {
      setLoading(false);
    }
  };

  // Xác nhận booking
  const handleConfirm = async (id) => {
    try {
      await booking.updateStatus(id, "confirmed");
      message.success("Xác nhận booking thành công");
      fetchBookings();
    } catch (err) {
      console.error(err);
      message.error("Không xác nhận được booking");
    }
  };

  // Hủy booking
  const handleCancel = async (id) => {
    try {
      await booking.cancelBooking(id);
      message.success("Hủy booking thành công");
      fetchBookings();
    } catch (err) {
      console.error(err);
      message.error("Không hủy được booking");
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Xe",
      dataIndex: ["vehicle", "name"],
      key: "vehicle",
    },
    {
      title: "Người đặt",
      dataIndex: ["user", "full_name"],
      key: "user",
    },
    { title: "Ngày bắt đầu", dataIndex: "startDate", key: "startDate" },
    { title: "Ngày kết thúc", dataIndex: "endDate", key: "endDate" },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "confirmed" ? "green" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          {record.status !== "confirmed" && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleConfirm(record.id)}
            >
              Xác nhận
            </Button>
          )}
          <Button danger size="small" onClick={() => handleCancel(record.id)}>
            Hủy
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      dataSource={bookings}
      loading={loading}
      bordered
      pagination={{ pageSize: 10 }}
    />
  );
};

export default ManageBookings;
