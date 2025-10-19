import React from "react";
import { Card, Row, Col, Statistic, Typography } from "antd";
import { 
  BookOutlined, 
  CarOutlined, 
  UserOutlined, 
  CheckCircleOutlined 
} from "@ant-design/icons";

const { Title } = Typography;

const AdminDashboard = () => {
  // Mock data - trong thực tế sẽ lấy từ API
  const stats = {
    totalBookings: 156,
    pendingBookings: 23,
    totalUsers: 89,
    totalVehicles: 45
  };

  const quickActions = [
    {
      title: "Quản lý Booking",
      description: "Xem và quản lý tất cả booking",
      icon: <BookOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      path: "/admin/bookingmanage"
    },
    {
      title: "Quản lý Xe",
      description: "Quản lý danh sách xe",
      icon: <CarOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      path: "/admin/vehicles"
    },
    {
      title: "Quản lý User",
      description: "Quản lý người dùng",
      icon: <UserOutlined style={{ fontSize: '24px', color: '#faad14' }} />,
      path: "/admin/users"
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Admin Dashboard</Title>
      
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Booking"
              value={stats.totalBookings}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Booking Chờ Xử Lý"
              value={stats.pendingBookings}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng User"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Xe"
              value={stats.totalVehicles}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#722ed1' }}
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
              style={{ textAlign: 'center', height: '150px' }}
              onClick={() => window.location.href = action.path}
            >
              <div style={{ marginBottom: '16px' }}>
                {action.icon}
              </div>
              <Title level={4}>{action.title}</Title>
              <p style={{ color: '#666' }}>{action.description}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default AdminDashboard;
