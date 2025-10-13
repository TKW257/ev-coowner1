// src/pages/admin/ManageBookings.jsx
import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Button, message } from "antd";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data trực tiếp trong component
  const bookingsMock = [
    { id: 1, vehicle: { name: "Tesla Model 3" }, user: { full_name: "Phu Nguyen" }, startDate: "2025-10-15", endDate: "2025-10-20", status: "confirmed" },
    { id: 2, vehicle: { name: "Nissan Leaf" }, user: { full_name: "Jane Doe" }, startDate: "2025-11-01", endDate: "2025-11-05", status: "pending" },
    { id: 3, vehicle: { name: "BMW iX" }, user: { full_name: "John Smith" }, startDate: "2025-12-05", endDate: "2025-12-10", status: "confirmed" },
    { id: 4, vehicle: { name: "Hyundai Ioniq 5" }, user: { full_name: "Alice Nguyen" }, startDate: "2025-12-12", endDate: "2025-12-15", status: "pending" },
    { id: 5, vehicle: { name: "Chevrolet Bolt" }, user: { full_name: "Bob Tran" }, startDate: "2025-11-20", endDate: "2025-11-25", status: "confirmed" },
  ];

  // Lấy danh sách booking khi mount component (mock)
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Giả lập call API bằng Promise
      const data = await new Promise((resolve) => {
        setTimeout(() => resolve(bookingsMock), 300);
      });
      setBookings(data);
    } catch {
      message.error("Không tải được booking!");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    {
      title: "Xe",
      dataIndex: "vehicle",
      key: "vehicle",
      render: (vehicle) => vehicle.name,
    },
    {
      title: "Người đặt",
      dataIndex: "user",
      key: "user",
      render: (user) => user.full_name,
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
      render: () => (
        <Space>
          <Button type="primary" size="small">
            Xác nhận
          </Button>
          <Button danger size="small">
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
    />
  );
};

export default ManageBookings;
