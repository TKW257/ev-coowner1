import React, { useState, useEffect, useCallback } from "react";
import { Table, Tag, Space, Button, message, Select, Card, Statistic, Row, Col, Modal, Descriptions } from "antd";
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CarOutlined, 
  UserOutlined,
  CalendarOutlined,
  EyeOutlined
} from "@ant-design/icons";
import bookingApi from "../../../../api/bookingApi";
import StorageKeys from "../../../../constants/storage-key";

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
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedChecking, setSelectedChecking] = useState(null);

  const fetchStaffCheckings = useCallback(async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching staff checkings...");
      console.log("🌐 API endpoint: /staff-checkings/viewAllStaffChecking");
      
      const response = await bookingApi.getAllStaffCheckings();
      console.log("📊 Staff Checkings API Response:", response);
      console.log("📋 Response type:", typeof response);
      console.log("📋 Is array:", Array.isArray(response));
      
      // Vì axiosClient interceptor đã trả về response.data
      const checkingsData = Array.isArray(response) ? response : [];
      console.log("📋 Staff Checkings processed:", checkingsData);
      console.log("📋 Total checkings found:", checkingsData.length);
      
      if (checkingsData.length > 0) {
        console.log("📋 First checking item:", checkingsData[0]);
        console.log("📋 Sample checking structure:", {
          id: checkingsData[0].id,
          checkingType: checkingsData[0].checkingType,
          bookingId: checkingsData[0].bookingId,
          vehicleId: checkingsData[0].vehicleId,
          userEmail: checkingsData[0].userEmail,
          checkTime: checkingsData[0].checkTime
        });
      }
      
      setCheckings(checkingsData);
      calculateStats(checkingsData);
      
      console.log("✅ Staff checkings loaded successfully!");
    } catch (error) {
      message.error("Không tải được danh sách staff checking!");
      console.error("❌ Error fetching staff checkings:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error message:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (data) => {
    console.log("📊 Calculating statistics...");
    const today = new Date().toDateString();
    console.log("📅 Today's date:", today);
    
    const checkIns = data.filter(item => item.checkingType === "CheckIn");
    const checkOuts = data.filter(item => item.checkingType === "CheckOut");
    const todayCheckings = data.filter(item => {
      if (item.checkTime && Array.isArray(item.checkTime)) {
        const [year, month, day] = item.checkTime;
        const checkDate = new Date(year, month - 1, day).toDateString();
        return checkDate === today;
      }
      return false;
    });
    
    const stats = {
      totalCheckings: data.length,
      checkIns: checkIns.length,
      checkOuts: checkOuts.length,
      todayCheckings: todayCheckings.length
    };
    
    console.log("📈 Statistics calculated:", stats);
    console.log("📋 Check-ins found:", checkIns.length);
    console.log("📋 Check-outs found:", checkOuts.length);
    console.log("📋 Today's checkings:", todayCheckings.length);
    
    setStats(stats);
  };

  useEffect(() => {
    // Log authentication info
    const token = localStorage.getItem(StorageKeys.TOKEN);
    console.log("🔑 Token from localStorage:", token);
    console.log("🔑 Token exists:", !!token);
    
    fetchStaffCheckings();
  }, [fetchStaffCheckings]);

  // Filter checkings when filter type changes
  useEffect(() => {
    fetchStaffCheckings();
  }, [filterType, fetchStaffCheckings]);

  const formatCheckTime = (timeArray) => {
    if (!timeArray || !Array.isArray(timeArray)) return '-';
    const [year, month, day, hour, minute, second] = timeArray;
    return `${day}/${month}/${year} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
  };

  const handleViewDetails = (checking) => {
    console.log("🔍 Viewing details for checking:", checking);
    setSelectedChecking(checking);
    setDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setDetailModalVisible(false);
    setSelectedChecking(null);
  };

  const columns = [
    { 
      title: "Checking ID", 
      dataIndex: "checkingId", 
      key: "checkingId",
      width: 120,
      render: (text, record) => record.checkingId || record.id
    },
    {
      title: "Loại",
      dataIndex: "checkingType",
      key: "checkingType",
      width: 120,
      render: (type) => (
        <Tag color={type === "CheckIn" ? "green" : "blue"}>
          {type === "CheckIn" ? "Check-in" : "Check-out"}
        </Tag>
      ),
    },
    {
      title: "Tên User",
      dataIndex: "userName",
      key: "userName",
      width: 150,
    },
    {
      title: "Tên Staff",
      dataIndex: "staffName",
      key: "staffName",
      width: 150,
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      render: (_, record) => (
        <Space>
          <Button 
            type="primary" 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
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
        rowKey={(record) => record.checkingId || record.id}
        columns={columns}
        dataSource={filterType === "all" ? checkings : checkings.filter(item => item.checkingType === filterType)}
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 600 }}
      />

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết Staff Checking - ID: ${selectedChecking?.checkingId || selectedChecking?.id}`}
        open={detailModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedChecking && (
          <Descriptions column={2} bordered>
            <Descriptions.Item label="Checking ID" span={1}>
              {selectedChecking.checkingId || selectedChecking.id || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Loại">
              <Tag color={selectedChecking.checkingType === "CheckIn" ? "green" : "blue"}>
                {selectedChecking.checkingType === "CheckIn" ? "Check-in" : "Check-out"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle ID">
              {selectedChecking.vehicleId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Vehicle Model">
              {selectedChecking.vehicleModel || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="User ID">
              {selectedChecking.userId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Tên User">
              {selectedChecking.userName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Staff ID">
              {selectedChecking.staffId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Tên Staff">
              {selectedChecking.staffName || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Booking ID">
              {selectedChecking.bookingId || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian">
              {formatCheckTime(selectedChecking.checkTime)}
            </Descriptions.Item>
            <Descriptions.Item label="Số km đồng hồ">
              {selectedChecking.odometer ? `${selectedChecking.odometer} km` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Phần trăm pin">
              {selectedChecking.batteryPercent ? `${selectedChecking.batteryPercent}%` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Có hư hỏng">
              <Tag color={selectedChecking.damageReported ? "red" : "green"}>
                {selectedChecking.damageReported ? "Có" : "Không"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Quãng đường đã đi">
              {selectedChecking.distanceTraveled ? `${selectedChecking.distanceTraveled} km` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Phần trăm pin đã dùng">
              {selectedChecking.batteryUsedPercent ? `${selectedChecking.batteryUsedPercent}%` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú" span={2}>
              {selectedChecking.notes || '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default StaffCheckingManagement;
