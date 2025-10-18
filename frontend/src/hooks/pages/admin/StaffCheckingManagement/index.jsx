import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Button, message, Select, Card, Statistic, Row, Col } from "antd";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined, 
  UserOutlined,
  CalendarOutlined 
} from "@ant-design/icons";
import bookingApi from "../../../../api/bookingApi";

const StaffCheckingManagement = () => {
  const [checkings, setCheckings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [stats, setStats] = useState({
    totalCheckings: 0,
    checkIns: 0,
    checkOuts: 0,
    todayCheckings: 0
  });

  useEffect(() => {
    // Log authentication info
    const token = localStorage.getItem('access_token');
    console.log("🔑 Token from localStorage:", token);
    console.log("🔑 Token exists:", !!token);
    
    fetchStaffCheckings();
  }, []);

  // Filter checkings when filter type changes
  useEffect(() => {
    fetchStaffCheckings();
  }, [filterType]);

  const fetchStaffCheckings = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching staff checkings...");
      const response = await bookingApi.getAllStaffCheckings();
      console.log("📊 Staff Checkings API Response:", response);
      console.log("📋 Is array:", Array.isArray(response));
      
      // Vì axiosClient interceptor đã trả về response.data
      const checkingsData = Array.isArray(response) ? response : [];
      console.log("📋 Staff Checkings processed:", checkingsData);
      
      setCheckings(checkingsData);
      calculateStats(checkingsData);
    } catch (error) {
      message.error("Không tải được danh sách staff checking!");
      console.error("❌ Error fetching staff checkings:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    const today = new Date().toDateString();
    
    const stats = {
      totalCheckings: data.length,
      checkIns: data.filter(item => item.checkingType === "CheckIn").length,
      checkOuts: data.filter(item => item.checkingType === "CheckOut").length,
      todayCheckings: data.filter(item => {
        if (item.checkTime && Array.isArray(item.checkTime)) {
          const [year, month, day] = item.checkTime;
          const checkDate = new Date(year, month - 1, day).toDateString();
          return checkDate === today;
        }
        return false;
      }).length
    };
    
    setStats(stats);
  };

  const formatCheckTime = (timeArray) => {
    if (!timeArray || !Array.isArray(timeArray)) return '-';
    const [year, month, day, hour, minute, second] = timeArray;
    return `${day}/${month}/${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  };

  const columns = [
    { 
      title: "ID", 
      dataIndex: "id", 
      key: "id",
      width: 80
    },
    {
      title: "Loại",
      dataIndex: "checkingType",
      key: "checkingType",
      width: 100,
      render: (type) => (
        <Tag color={type === "CheckIn" ? "green" : "blue"}>
          {type === "CheckIn" ? "Check-in" : "Check-out"}
        </Tag>
      ),
    },
    {
      title: "Booking ID",
      dataIndex: "bookingId",
      key: "bookingId",
      width: 100,
    },
    {
      title: "Vehicle ID",
      dataIndex: "vehicleId",
      key: "vehicleId",
      width: 100,
    },
    {
      title: "Email User",
      dataIndex: "userEmail",
      key: "userEmail",
      width: 150,
    },
    {
      title: "Thời gian",
      dataIndex: "checkTime",
      key: "checkTime",
      width: 150,
      render: (timeArray) => formatCheckTime(timeArray),
    },
    {
      title: "Số km",
      dataIndex: "odometer",
      key: "odometer",
      width: 100,
      render: (value) => value ? `${value} km` : '-',
    },
    {
      title: "Pin (%)",
      dataIndex: "batteryPercent",
      key: "batteryPercent",
      width: 80,
      render: (value) => value ? `${value}%` : '-',
    },
    {
      title: "Hư hỏng",
      dataIndex: "damageReported",
      key: "damageReported",
      width: 100,
      render: (damaged) => (
        <Tag color={damaged ? "red" : "green"}>
          {damaged ? "Có" : "Không"}
        </Tag>
      ),
    },
    {
      title: "Quãng đường",
      dataIndex: "distanceTraveled",
      key: "distanceTraveled",
      width: 120,
      render: (value) => value ? `${value} km` : '-',
    },
    {
      title: "Pin đã dùng (%)",
      dataIndex: "batteryUsedPercent",
      key: "batteryUsedPercent",
      width: 120,
      render: (value) => value ? `${value}%` : '-',
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
      ellipsis: true,
    },
  ];

  // Debug log for checkings state
  console.log("🔍 Current checkings state:", checkings);
  console.log("🔍 Checkings state length:", checkings.length);
  console.log("🔍 Loading state:", loading);

  return (
    <div style={{ padding: '24px' }}>
      <h2>Quản lý Staff Checking</h2>
      
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Checking"
              value={stats.totalCheckings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Check-in"
              value={stats.checkIns}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Check-out"
              value={stats.checkOuts}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hôm nay"
              value={stats.todayCheckings}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Lọc theo loại"
          value={filterType}
          onChange={setFilterType}
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="CheckIn">Check-in</Select.Option>
          <Select.Option value="CheckOut">Check-out</Select.Option>
        </Select>
      </div>

      {/* Table */}
      <Table
        rowKey="id"
        columns={columns}
        dataSource={filterType === "all" ? checkings : checkings.filter(item => item.checkingType === filterType)}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default StaffCheckingManagement;
