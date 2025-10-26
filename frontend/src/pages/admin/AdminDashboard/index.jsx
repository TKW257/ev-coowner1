import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Statistic, Typography, Spin, message } from "antd";
import {
  BookOutlined,
  CarOutlined,
  UserOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import bookingApi from "../../../api/bookingApi";
import userApi from "../../../api/userApi";
import vehiclesApi from "../../../api/vehiclesApi";

const { Title } = Typography;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalUsers: 0,
    totalVehicles: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      // Sử dụng các API hiện có để lấy dữ liệu
      const [bookingsResponse, usersResponse, vehiclesResponse] =
        await Promise.all([
          bookingApi.getAllBookings(),
          userApi.getAll(),
          vehiclesApi.getAllVehicles(),
        ]);

      // Xử lý dữ liệu bookings
      const bookingsData = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : [];
      const pendingBookings = bookingsData.filter(
        (booking) =>
          booking.bookingStatus &&
          booking.bookingStatus.toLowerCase() === "pending"
      ).length;

      // Xử lý dữ liệu users
      const usersData = Array.isArray(usersResponse) ? usersResponse : [];

      // Xử lý dữ liệu vehicles
      const vehiclesData = Array.isArray(vehiclesResponse)
        ? vehiclesResponse
        : [];

      setStats({
        totalBookings: bookingsData.length,
        pendingBookings: pendingBookings,
        totalUsers: usersData.length,
        totalVehicles: vehiclesData.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      message.error("Không thể tải thống kê dashboard!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const quickActions = [
    {
      title: "Quản lý Booking",
      description: "Xem và quản lý tất cả booking",
      icon: <BookOutlined style={{ fontSize: "24px", color: "#1890ff" }} />,
      path: "/admin/bookingmanage",
    },
    {
      title: "Quản lý Xe",
      description: "Quản lý danh sách xe",
      icon: <CarOutlined style={{ fontSize: "24px", color: "#52c41a" }} />,
      path: "/admin/vehicles",
    },
    {
      title: "Quản lý User",
      description: "Quản lý người dùng",
      icon: <UserOutlined style={{ fontSize: "24px", color: "#faad14" }} />,
      path: "/admin/users",
    },
    {
      title: "Vote",
      description: "Biểu quyết",
      icon: <UserOutlined style={{ fontSize: "24px", color: "#faad14" }} />,
      path: "/admin/vote",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Admin Dashboard</Title>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <p style={{ marginTop: "16px" }}>Đang tải thống kê...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <Row gutter={16} style={{ marginBottom: "24px" }}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng Booking"
                  value={stats.totalBookings}
                  prefix={<BookOutlined />}
                  valueStyle={{ color: "#1890ff" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Booking Chờ Xử Lý"
                  value={stats.pendingBookings}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#faad14" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng User"
                  value={stats.totalUsers}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng Xe"
                  value={stats.totalVehicles}
                  prefix={<CarOutlined />}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Title level={3}>Thao tác nhanh</Title>
          <Row gutter={16}>
            {quickActions.map((action, index) => (
              <Col span={8} key={index}>
                <Card
                  hoverable
                  style={{ textAlign: "center", height: "150px" }}
                  onClick={() => (window.location.href = action.path)}
                >
                  <div style={{ marginBottom: "16px" }}>{action.icon}</div>
                  <Title level={4}>{action.title}</Title>
                  <p style={{ color: "#666" }}>{action.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
