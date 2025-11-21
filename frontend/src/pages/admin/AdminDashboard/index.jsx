import React, { useState, useEffect, useCallback } from "react";
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Spin, 
  message,
  Table,
  Tag,
  Space,
  Button,
  Empty,
  Progress
} from "antd";
import { 
  BookOutlined, 
  CarOutlined, 
  UserOutlined, 
  CheckCircleOutlined,
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
  EyeOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import bookingApi from "../../../api/bookingApi";
import userApi from "../../../api/userApi";
import vehiclesApi from "../../../api/vehiclesApi";
import invoiceApi from "../../../api/invoiceApi";
import contractApi from "../../../api/contractApi";
import dayjs from "dayjs";

const { Title, Text } = Typography;

const COLORS = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
  orange: '#fa8c16',
  green: '#52c41a'
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalVehicles: 0,
    totalInvoices: 0,
    openInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    totalRevenue: 0,
    totalContracts: 0,
    pendingContracts: 0,
    approvedContracts: 0
  });

  const [recentBookings, setRecentBookings] = useState([]);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [invoiceStatusData, setInvoiceStatusData] = useState([]);
  const [contractStatusData, setContractStatusData] = useState([]);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [bookingsResponse, usersResponse, vehiclesResponse, invoicesResponse, contractsResponse] = await Promise.all([
        bookingApi.getAllBookings().catch(() => []),
        userApi.getAll().catch(() => []),
        vehiclesApi.getAllVehicles().catch(() => []),
        invoiceApi.getAllSumaInvoices().catch(() => []),
        contractApi.getAll().catch(() => [])
      ]);

      // Process bookings
      const bookingsData = Array.isArray(bookingsResponse) ? bookingsResponse : [];
      const pendingBookings = bookingsData.filter(b => 
        b.bookingStatus && b.bookingStatus.toLowerCase() === 'pending'
      ).length;
      const confirmedBookings = bookingsData.filter(b => 
        b.bookingStatus && (b.bookingStatus.toLowerCase() === 'confirmed' || b.bookingStatus.toLowerCase() === 'approved')
      ).length;
      const cancelledBookings = bookingsData.filter(b => 
        b.bookingStatus && b.bookingStatus.toLowerCase() === 'cancelled'
      ).length;

      // Process users
      const usersData = Array.isArray(usersResponse) ? usersResponse : [];
      const activeUsers = usersData.filter(u => 
        u.status === 'ACTIVE' || u.status === 'active' || !u.status
      ).length;

      // Process vehicles
      const vehiclesData = Array.isArray(vehiclesResponse) ? vehiclesResponse : [];

      // Process invoices
      const invoicesData = Array.isArray(invoicesResponse) ? invoicesResponse : [];
      const openInvoices = invoicesData.filter(i => i.status === 'OPEN').length;
      const paidInvoices = invoicesData.filter(i => 
        i.status === 'SETTLED' || i.status === 'PAID'
      ).length;
      const overdueInvoices = invoicesData.filter(i => {
        const isOverdue = i.status === 'OPEN' && i.dueDate && 
          dayjs(i.dueDate).isBefore(dayjs(), 'day');
        return isOverdue;
      }).length;
      const totalRevenue = invoicesData
        .filter(i => i.status === 'SETTLED' || i.status === 'PAID')
        .reduce((sum, i) => sum + (i.totalAmount || 0), 0);

      // Process contracts
      const contractsData = Array.isArray(contractsResponse) ? contractsResponse : [];
      const pendingContracts = contractsData.filter(c => c.status === 'PENDING').length;
      const approvedContracts = contractsData.filter(c => c.status === 'APPROVED').length;

      // Set statistics
      setStats({
        totalBookings: bookingsData.length,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        totalUsers: usersData.length,
        activeUsers,
        totalVehicles: vehiclesData.length,
        totalInvoices: invoicesData.length,
        openInvoices,
        paidInvoices,
        overdueInvoices,
        totalRevenue,
        totalContracts: contractsData.length,
        pendingContracts,
        approvedContracts
      });

      // Set recent bookings (last 5)
      const sortedBookings = [...bookingsData]
        .sort((a, b) => {
          // Handle createdAt - could be string, array, or Date
          let dateA = new Date(0);
          let dateB = new Date(0);
          
          if (a.createdAt) {
            if (Array.isArray(a.createdAt)) {
              // Array format: [year, month, day, hour, minute, second]
              dateA = new Date(...a.createdAt.slice(0, 6));
            } else if (typeof a.createdAt === 'string') {
              dateA = new Date(a.createdAt);
            } else if (a.createdAt instanceof Date) {
              dateA = a.createdAt;
            }
          }
          
          if (b.createdAt) {
            if (Array.isArray(b.createdAt)) {
              dateB = new Date(...b.createdAt.slice(0, 6));
            } else if (typeof b.createdAt === 'string') {
              dateB = new Date(b.createdAt);
            } else if (b.createdAt instanceof Date) {
              dateB = b.createdAt;
            }
          }
          
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentBookings(sortedBookings);

      // Set recent invoices (last 5)
      const sortedInvoices = [...invoicesData]
        .sort((a, b) => {
          const dateA = a.issuedDate ? new Date(...a.issuedDate.slice(0, 6)) : new Date(0);
          const dateB = b.issuedDate ? new Date(...b.issuedDate.slice(0, 6)) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5);
      setRecentInvoices(sortedInvoices);

      // Prepare chart data
      setBookingStatusData([
        { name: 'Đã xác nhận', value: confirmedBookings },
        { name: 'Chờ xử lý', value: pendingBookings },
        { name: 'Đã hủy', value: cancelledBookings }
      ]);

      setInvoiceStatusData([
        { name: 'Đã thanh toán', value: paidInvoices },
        { name: 'Đang mở', value: openInvoices - overdueInvoices },
        { name: 'Quá hạn', value: overdueInvoices }
      ]);

      setContractStatusData([
        { name: 'Đã duyệt', value: approvedContracts },
        { name: 'Chờ duyệt', value: pendingContracts },
        { name: 'Khác', value: contractsData.length - approvedContracts - pendingContracts }
      ]);

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
      icon: <BookOutlined style={{ fontSize: '32px' }} />,
      path: "/admin/bookingmanage",
      color: COLORS.primary
    },
    {
      title: "Quản lý Hóa đơn",
      description: "Quản lý hóa đơn và thanh toán",
      icon: <FileTextOutlined style={{ fontSize: '32px' }} />,
      path: "/admin/invoice",
      color: COLORS.success
    },
    {
      title: "Quản lý Hợp đồng",
      description: "Quản lý hợp đồng phương tiện",
      icon: <FileTextOutlined style={{ fontSize: '32px' }} />,
      path: "/admin/contracts",
      color: COLORS.warning
    },
    {
      title: "Quản lý Xe",
      description: "Quản lý danh sách xe",
      icon: <CarOutlined style={{ fontSize: '32px' }} />,
      path: "/admin/vehicles",
      color: COLORS.purple
    },
    {
      title: "Quản lý User",
      description: "Quản lý người dùng",
      icon: <UserOutlined style={{ fontSize: '32px' }} />,
      path: "/admin/users",
      color: COLORS.cyan
    },
    {
      title: "Hợp đồng Đồng sở hữu",
      description: "Quản lý hợp đồng đồng sở hữu",
      icon: <TeamOutlined style={{ fontSize: '32px' }} />,
      path: "/admin/owner-contracts",
      color: COLORS.orange
    }
  ];

  const getStatusTag = (status) => {
    const statusLower = status?.toLowerCase() || '';
    const statusMap = {
      'pending': { color: 'orange', label: 'Chờ xử lý' },
      'confirmed': { color: 'blue', label: 'Đã xác nhận' },
      'approved': { color: 'green', label: 'Đã duyệt' },
      'cancelled': { color: 'red', label: 'Đã hủy' },
      'open': { color: 'orange', label: 'Đang mở' },
      'settled': { color: 'green', label: 'Đã thanh toán' },
      'paid': { color: 'green', label: 'Đã thanh toán' },
      'overdue': { color: 'red', label: 'Quá hạn' }
    };
    const mapped = statusMap[statusLower] || { color: 'default', label: status };
    return <Tag color={mapped.color}>{mapped.label}</Tag>;
  };

  const bookingColumns = [
    {
      title: 'Mã Booking',
      dataIndex: 'bookingId',
      key: 'bookingId',
      render: (id) => id ? `#${id}` : '-'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'bookingStatus',
      key: 'bookingStatus',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return '-';
        
        try {
          // Handle array format: [year, month, day, hour, minute, second]
          if (Array.isArray(date)) {
            const [year, month, day] = date.slice(0, 3);
            return dayjs(new Date(year, month - 1, day)).format('DD/MM/YYYY');
          }
          
          // Handle string or Date object
          return dayjs(date).format('DD/MM/YYYY');
        } catch (error) {
          console.error('Error parsing date:', date, error);
          return '-';
        }
      }
    }
  ];

  const invoiceColumns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'sumaInvoiceId',
      key: 'sumaInvoiceId',
      render: (id) => id ? `#SUMA-${id}` : '-'
    },
    {
      title: 'Người dùng',
      dataIndex: 'userName',
      key: 'userName'
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => amount ? amount.toLocaleString('vi-VN') + ' ₫' : '0 ₫'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        const isOverdue = status === 'OPEN' && record.dueDate && 
          dayjs(record.dueDate).isBefore(dayjs(), 'day');
        return getStatusTag(isOverdue ? 'OVERDUE' : status);
      }
    }
  ];

  const renderPieChart = (data, colors) => (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={true}
          label={({ name, percent }) => {
            const percentage = (percent * 100).toFixed(0);
            return `${name}: ${percentage}%`;
          }}
          outerRadius={70}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <ReTooltip />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div>
          <Title level={2} style={{ margin: 0, color: '#001529' }}>
            Dashboard Quản Trị
          </Title>
          <Text type="secondary">Tổng quan hệ thống và thống kê</Text>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={fetchDashboardStats}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" />
          <p style={{ marginTop: '16px', color: '#666' }}>Đang tải thống kê...</p>
        </div>
      ) : (
        <>
          {/* Main Statistics Cards */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{ 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng Booking</span>}
                  value={stats.totalBookings}
                  prefix={<BookOutlined style={{ color: 'white' }} />}
                  valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div style={{ marginTop: '8px' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                    {stats.confirmedBookings} đã xác nhận
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{ 
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng Hóa đơn</span>}
                  value={stats.totalInvoices}
                  prefix={<FileTextOutlined style={{ color: 'white' }} />}
                  valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div style={{ marginTop: '8px' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                    {stats.paidInvoices} đã thanh toán
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{ 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  border: 'none'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng User</span>}
                  value={stats.totalUsers}
                  prefix={<UserOutlined style={{ color: 'white' }} />}
                  valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div style={{ marginTop: '8px' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                    {stats.activeUsers} đang hoạt động
                  </Text>
                </div>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card 
                hoverable
                style={{ 
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                  border: 'none'
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng Xe</span>}
                  value={stats.totalVehicles}
                  prefix={<CarOutlined style={{ color: 'white' }} />}
                  valueStyle={{ color: '#fff', fontSize: '28px', fontWeight: 'bold' }}
                />
                <div style={{ marginTop: '8px' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>
                    {stats.totalContracts} hợp đồng
                  </Text>
                </div>
              </Card>
            </Col>
          </Row>

          {/* Secondary Statistics */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Booking Chờ Xử Lý"
                  value={stats.pendingBookings}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: COLORS.warning, fontSize: '24px', fontWeight: 'bold' }}
                />
                {stats.totalBookings > 0 && (
                  <Progress 
                    percent={Math.round((stats.pendingBookings / stats.totalBookings) * 100)} 
                    size="small" 
                    status="active"
                    style={{ marginTop: '8px' }}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Hóa đơn Quá hạn"
                  value={stats.overdueInvoices}
                  prefix={<WarningOutlined />}
                  valueStyle={{ color: COLORS.danger, fontSize: '24px', fontWeight: 'bold' }}
                />
                {stats.totalInvoices > 0 && (
                  <Progress 
                    percent={Math.round((stats.overdueInvoices / stats.totalInvoices) * 100)} 
                    size="small" 
                    status="exception"
                    style={{ marginTop: '8px' }}
                  />
                )}
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card styles={{ body: { minHeight: '138px' } }}>
                <Statistic
                  title="Tổng Doanh thu"
                  value={stats.totalRevenue}
                  prefix={<DollarOutlined />}
                  suffix="₫"
                  valueStyle={{ color: COLORS.success, fontSize: '24px', fontWeight: 'bold' }}
                  formatter={(value) => value.toLocaleString('vi-VN')}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Hợp đồng Chờ duyệt"
                  value={stats.pendingContracts}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: COLORS.warning, fontSize: '24px', fontWeight: 'bold' }}
                />
                {stats.totalContracts > 0 && (
                  <Progress 
                    percent={Math.round((stats.pendingContracts / stats.totalContracts) * 100)} 
                    size="small" 
                    status="active"
                    style={{ marginTop: '8px' }}
                  />
                )}
              </Card>
            </Col>
          </Row>

          {/* Charts Row */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} lg={8}>
              <Card title="Trạng thái Booking">
                {bookingStatusData.some(d => d.value > 0) ? (
                  renderPieChart(bookingStatusData, [COLORS.success, COLORS.warning, COLORS.danger])
                ) : (
                  <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Trạng thái Hóa đơn">
                {invoiceStatusData.some(d => d.value > 0) ? (
                  renderPieChart(invoiceStatusData, [COLORS.success, COLORS.warning, COLORS.danger])
                ) : (
                  <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={8}>
              <Card title="Trạng thái Hợp đồng">
                {contractStatusData.some(d => d.value > 0) ? (
                  renderPieChart(contractStatusData, [COLORS.success, COLORS.warning, COLORS.cyan])
                ) : (
                  <Empty description="Chưa có dữ liệu" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
          </Row>

          {/* Recent Activity and Quick Actions */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card 
                title="Booking Gần Đây" 
                extra={
                  <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => navigate('/admin/bookingmanage')}
                  >
                    Xem tất cả
                  </Button>
                }
              >
                {recentBookings.length > 0 ? (
                  <Table
                    columns={bookingColumns}
                    dataSource={recentBookings}
                    rowKey="bookingId"
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Empty description="Chưa có booking nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                title="Hóa đơn Gần Đây" 
                extra={
                  <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => navigate('/admin/invoice')}
                  >
                    Xem tất cả
                  </Button>
                }
              >
                {recentInvoices.length > 0 ? (
                  <Table
                    columns={invoiceColumns}
                    dataSource={recentInvoices}
                    rowKey="sumaInvoiceId"
                    pagination={false}
                    size="small"
                  />
                ) : (
                  <Empty description="Chưa có hóa đơn nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            </Col>
          </Row>

          {/* Quick Actions */}
          <Card 
            title="Thao tác nhanh" 
            style={{ marginTop: '24px' }}
          >
            <Row gutter={[16, 16]}>
              {quickActions.map((action, index) => (
                <Col xs={24} sm={12} lg={8} key={index}>
                  <Card
                    hoverable
                    style={{
                      textAlign: 'center',
                      height: '140px',
                      border: `2px solid ${action.color}`,
                      borderRadius: '8px',
                      transition: 'all 0.3s'
                    }}
                    styles={{
                      body: {
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                      }
                    }}
                    onClick={() => navigate(action.path)}
                  >
                    <div style={{ 
                      color: action.color, 
                      marginBottom: '12px',
                      fontSize: '32px'
                    }}>
                      {action.icon}
                    </div>
                    <Title level={5} style={{ margin: 0, marginBottom: '4px' }}>
                      {action.title}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {action.description}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
