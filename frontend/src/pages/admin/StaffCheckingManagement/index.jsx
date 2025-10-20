import React, { useState, useEffect, useCallback } from "react";
import { Table, Tag, Space, Button, message, Select, Card, Statistic, Row, Col, Modal, Descriptions, Dropdown } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, CarOutlined, UserOutlined, CalendarOutlined, EyeOutlined, DownloadOutlined, MailOutlined, CheckOutlined, DownOutlined } from "@ant-design/icons";
import bookingApi from "../../../api/bookingApi";
import StorageKeys from "../../../constants/storage-key";

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
      const response = await bookingApi.getAllStaffCheckings();
      
      const checkingsData = Array.isArray(response) ? response : [];
      setCheckings(checkingsData);
      calculateStats(checkingsData);
    } catch (error) {
      message.error("Không tải được danh sách staff checking!");
      console.error("Error fetching staff checkings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (data) => {
    const today = new Date().toDateString();
    
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
    
    setStats(stats);
  };

  useEffect(() => {
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
    setSelectedChecking(checking);
    setDetailModalVisible(true);
  };

  const handleCloseModal = () => {
    setDetailModalVisible(false);
    setSelectedChecking(null);
  };

  // Xử lý download PDF
  const handleDownloadPDF = () => {
    if (!selectedChecking) {
      message.error("Không có dữ liệu để xuất PDF!");
      return;
    }

    message.success("Đang tạo file PDF...");
    
    // Tạo nội dung HTML cho form PDF
    const pdfContent = generatePDFContent(selectedChecking);
    
    // Tạo window mới để in PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Staff Checking Report - ${selectedChecking.checkingId || selectedChecking.id}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1890ff;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #1890ff;
              margin: 0;
            }
            .form-container {
              max-width: 800px;
              margin: 0 auto;
            }
            .form-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }
            .form-table th, .form-table td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            .form-table th {
              background-color: #f5f5f5;
              font-weight: bold;
              width: 30%;
            }
            .form-table td {
              background-color: #fff;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              color: white;
              font-size: 12px;
            }
            .status-checkin {
              background-color: #52c41a;
            }
            .status-checkout {
              background-color: #1890ff;
            }
            .status-damage-yes {
              background-color: #ff4d4f;
            }
            .status-damage-no {
              background-color: #52c41a;
            }
            .signature-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              width: 45%;
              text-align: center;
            }
            .signature-line {
              border-bottom: 1px solid #333;
              height: 40px;
              margin-bottom: 10px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${pdfContent}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 1000);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Tạo nội dung HTML cho PDF
  const generatePDFContent = (checking) => {
    return `
      <div class="header">
        <h1>BÁO CÁO STAFF CHECKING</h1>
        <p>Ngày tạo: ${new Date().toLocaleString('vi-VN')}</p>
      </div>
      
      <div class="form-container">
        <table class="form-table">
          <tr>
            <th>Checking ID</th>
            <td>${checking.checkingId || checking.id || '-'}</td>
          </tr>
          <tr>
            <th>Loại Checking</th>
            <td>
              <span class="status-badge ${checking.checkingType === "CheckIn" ? 'status-checkin' : 'status-checkout'}">
                ${checking.checkingType === "CheckIn" ? "Check-in" : "Check-out"}
              </span>
            </td>
          </tr>
          <tr>
            <th>Vehicle Model</th>
            <td>${checking.vehicleModel || '-'}</td>
          </tr>
          <tr>
            <th>Tên User</th>
            <td>${checking.userName || '-'}</td>
          </tr>
          <tr>
            <th>Tên Staff</th>
            <td>${checking.staffName || '-'}</td>
          </tr>
          <tr>
            <th>Thời gian</th>
            <td>${formatCheckTime(checking.checkTime)}</td>
          </tr>
          <tr>
            <th>Số km đồng hồ</th>
            <td>${checking.odometer ? `${checking.odometer} km` : '-'}</td>
          </tr>
          <tr>
            <th>Phần trăm pin</th>
            <td>${checking.batteryPercent ? `${checking.batteryPercent}%` : '-'}</td>
          </tr>
          <tr>
            <th>Có hư hỏng</th>
            <td>
              <span class="status-badge ${checking.damageReported ? 'status-damage-yes' : 'status-damage-no'}">
                ${checking.damageReported ? "Có" : "Không"}
              </span>
            </td>
          </tr>
          <tr>
            <th>Quãng đường đã đi</th>
            <td>${checking.distanceTraveled ? `${checking.distanceTraveled} km` : '-'}</td>
          </tr>
          <tr>
            <th>Phần trăm pin đã dùng</th>
            <td>${checking.batteryUsedPercent ? `${checking.batteryUsedPercent}%` : '-'}</td>
          </tr>
          <tr>
            <th>Ghi chú</th>
            <td>${checking.notes || '-'}</td>
          </tr>
        </table>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <p><strong>Ký tên Staff</strong></p>
            <p>(${checking.staffName || '-'})</p>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <p><strong>Ký tên User</strong></p>
            <p>(${checking.userName || '-'})</p>
          </div>
        </div>
      </div>
    `;
  };

  // Xử lý gửi mail
  const handleSendEmail = () => {
    message.info("Tính năng gửi mail đang được phát triển...");
    // TODO: Implement email sending
    console.log("Send email for checking:", selectedChecking);
  };

  // Menu items cho dropdown
  const getConfirmMenuItems = () => [
    {
      key: 'pdf',
      icon: <DownloadOutlined />,
      label: 'Download file PDF',
      onClick: () => handleDownloadPDF()
    },
    {
      key: 'email',
      icon: <MailOutlined />,
      label: 'Gửi mail (đang phát triển)',
      onClick: () => handleSendEmail()
    }
  ];

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


  return (
    <div style={{ padding: '24px', color: "black" }}>
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
          </Button>,
          <Dropdown key="confirm" menu={{ items: getConfirmMenuItems() }} placement="topRight">
            <Button 
              type="primary" 
              icon={<CheckOutlined />}
            >
              Xác nhận checking <DownOutlined />
            </Button>
          </Dropdown>
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
