import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tag, Space, Input, Select, DatePicker, Modal, Descriptions, Row, Col, Statistic, message, Spin, Tooltip, Badge, Form, Popconfirm} from 'antd';
import { SearchOutlined, EyeOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined, CarOutlined, UserOutlined, CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined} from '@ant-design/icons';
import dayjs from 'dayjs';
import bookingApi from '../../../api/bookingApi';
import vehiclesApi from '../../../api/vehiclesApi';
import userApi from '../../../api/userApi';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('');
  const [dateFilter, setDateFilter] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [form] = Form.useForm();

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, vehiclesRes, usersRes] = await Promise.all([
          bookingApi.getAllBookings(),
          vehiclesApi.getAllVehicles(),
          userApi.getAllUsers(),
        ]);

        setBookings(bookingsRes.data || bookingsRes || []);
        setVehicles(vehiclesRes.data || vehiclesRes || []);
        setUsers(usersRes.data || usersRes || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        message.error('Không thể tải dữ liệu bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get vehicle info by ID
  const getVehicleInfo = (vehicleId) => {
    return vehicles.find(v => v.id === vehicleId) || {};
  };

  // Get user info by ID
  const getUserInfo = (userId) => {
    return users.find(u => u.id === userId) || {};
  };

  // Filter bookings based on search criteria
  const filteredBookings = bookings.filter(booking => {
    const vehicle = getVehicleInfo(booking.vehicle_id);
    const user = getUserInfo(booking.userId);
    
    const matchesSearch = !searchText || 
      booking.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.brand?.toLowerCase().includes(searchText.toLowerCase()) ||
      vehicle.model?.toLowerCase().includes(searchText.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = !statusFilter || booking.status === statusFilter;
    
    const matchesVehicle = !vehicleFilter || booking.vehicle_id == vehicleFilter;

    const matchesDate = !dateFilter.length || 
      (dayjs(booking.start_time).isAfter(dateFilter[0]) && 
       dayjs(booking.end_time).isBefore(dateFilter[1]));

    return matchesSearch && matchesStatus && matchesVehicle && matchesDate;
  });

  // Handle status update
  const handleStatusUpdate = async (bookingId, newStatus) => {
    setActionLoading(true);
    try {
      await bookingApi.updateBooking(bookingId, { status: newStatus });
      message.success('Cập nhật trạng thái thành công');
      
      // Update local state
      setBookings(prev => prev.map(booking => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(false);
    }
  };

  // Show booking detail
  const showBookingDetail = (booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  // Handle create booking
  const handleCreateBooking = async (values) => {
    setActionLoading(true);
    try {
      const newBooking = {
        vehicle_id: values.vehicle_id,
        name: getVehicleInfo(values.vehicle_id).model || 'Xe chưa rõ',
        image: getVehicleInfo(values.vehicle_id).imageUrl || '',
        start_time: values.dateRange[0].toISOString(),
        end_time: values.dateRange[1].toISOString(),
        status: values.status || 'pending',
        userId: values.user_id,
      };

      await bookingApi.createBooking(newBooking);
      message.success('Tạo booking thành công');
      
      // Refresh data
      const updatedBookings = await bookingApi.getAllBookings();
      setBookings(updatedBookings.data || updatedBookings || []);
      setCreateModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error creating booking:', error);
      message.error('Không thể tạo booking');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle edit booking
  const handleEditBooking = async (values) => {
    setActionLoading(true);
    try {
      const updatedBooking = {
        vehicle_id: values.vehicle_id,
        name: getVehicleInfo(values.vehicle_id).model || 'Xe chưa rõ',
        image: getVehicleInfo(values.vehicle_id).imageUrl || '',
        start_time: values.dateRange[0].toISOString(),
        end_time: values.dateRange[1].toISOString(),
        status: values.status,
        userId: values.user_id,
      };

      await bookingApi.updateBooking(selectedBooking.id, updatedBooking);
      message.success('Cập nhật booking thành công');
      
      // Refresh data
      const updatedBookings = await bookingApi.getAllBookings();
      setBookings(updatedBookings.data || updatedBookings || []);
      setEditModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error updating booking:', error);
      message.error('Không thể cập nhật booking');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete booking
  const handleDeleteBooking = async (bookingId) => {
    setActionLoading(true);
    try {
      await bookingApi.deleteBooking(bookingId);
      message.success('Xóa booking thành công');
      
      // Refresh data
      const updatedBookings = await bookingApi.getAllBookings();
      setBookings(updatedBookings.data || updatedBookings || []);
    } catch (error) {
      console.error('Error deleting booking:', error);
      message.error('Không thể xóa booking');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    setActionLoading(true);
    try {
      await Promise.all(selectedRowKeys.map(id => bookingApi.deleteBooking(id)));
      message.success(`Đã xóa ${selectedRowKeys.length} booking`);
      
      // Refresh data
      const updatedBookings = await bookingApi.getAllBookings();
      setBookings(updatedBookings.data || updatedBookings || []);
      setSelectedRowKeys([]);
    } catch (error) {
      console.error('Error bulk deleting:', error);
      message.error('Không thể xóa các booking đã chọn');
    } finally {
      setActionLoading(false);
    }
  };

  // Show edit modal
  const showEditModal = (booking) => {
    setSelectedBooking(booking);
    
    form.setFieldsValue({
      vehicle_id: booking.vehicle_id,
      user_id: booking.userId,
      dateRange: [dayjs(booking.start_time), dayjs(booking.end_time)],
      status: booking.status,
    });
    
    setEditModalVisible(true);
  };

  // Show create modal
  const showCreateModal = () => {
    form.resetFields();
    setCreateModalVisible(true);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'success':
      case 'confirmed': return 'Đã xác nhận';
      case 'pending': return 'Đang chờ';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  // Calculate statistics
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'success' || b.status === 'confirmed').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text) => <code>{text}</code>,
    },
    {
      title: 'Xe',
      key: 'vehicle',
      render: (_, record) => {
        const vehicle = getVehicleInfo(record.vehicle_id);
        return (
          <Space>
            <CarOutlined />
            <div>
              <div style={{ fontWeight: 500 }}>{vehicle.brand} {vehicle.model}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {vehicle.plateNumber}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => {
        const user = getUserInfo(record.userId);
        return (
          <Space>
            <UserOutlined />
            <div>
              <div>{user.full_name || 'N/A'}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                {user.email || 'N/A'}
              </div>
            </div>
          </Space>
        );
      },
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <Space direction="vertical" size="small">
          <div>
            <CalendarOutlined style={{ marginRight: 4 }} />
            Từ: {dayjs(record.start_time).format('DD/MM/YYYY HH:mm')}
          </div>
          <div>
            <CalendarOutlined style={{ marginRight: 4 }} />
            Đến: {dayjs(record.end_time).format('DD/MM/YYYY HH:mm')}
          </div>
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
      filters: [
        { text: 'Đang chờ', value: 'pending' },
        { text: 'Đã xác nhận', value: 'success' },
        { text: 'Đã xác nhận', value: 'confirmed' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => showBookingDetail(record)}
            />
          </Tooltip>
          
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => showEditModal(record)}
            />
          </Tooltip>

          <Popconfirm
            title="Xóa booking"
            description="Bạn có chắc chắn muốn xóa booking này?"
            onConfirm={() => handleDeleteBooking(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
          >
            <Tooltip title="Xóa">
              <Button
                danger
                icon={<DeleteOutlined />}
                size="small"
                loading={actionLoading}
              />
            </Tooltip>
          </Popconfirm>
          
          {record.status === 'pending' && (
            <>
              <Tooltip title="Xác nhận">
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  size="small"
                  loading={actionLoading}
                  onClick={() => handleStatusUpdate(record.id, 'confirmed')}
                />
              </Tooltip>
              <Tooltip title="Hủy">
                <Button
                  danger
                  icon={<CloseOutlined />}
                  size="small"
                  loading={actionLoading}
                  onClick={() => handleStatusUpdate(record.id, 'cancelled')}
                />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>
            Quản lý đặt xe
          </h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Quản lý và theo dõi tất cả các lượt đặt xe trong hệ thống
          </p>
        </div>
        <Space>
          {selectedRowKeys.length > 0 && (
            <Popconfirm
              title="Xóa nhiều booking"
              description={`Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} booking đã chọn?`}
              onConfirm={handleBulkDelete}
              okText="Xóa"
              cancelText="Hủy"
              icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
            >
              <Button danger icon={<DeleteOutlined />} loading={actionLoading}>
                Xóa ({selectedRowKeys.length})
              </Button>
            </Popconfirm>
          )}
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={showCreateModal}
          >
            Thêm booking
          </Button>
        </Space>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng đặt xe"
              value={stats.total}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang chờ"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã xác nhận"
              value={stats.confirmed}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã hủy"
              value={stats.cancelled}
              prefix={<CloseOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Tìm kiếm theo xe, khách hàng..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={4}>
            <Select
              placeholder="Trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              allowClear
              style={{ width: '100%' }}
            >
              <Option value="pending">Đang chờ</Option>
              <Option value="success">Đã xác nhận</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <Select
              placeholder="Chọn xe"
              value={vehicleFilter}
              onChange={setVehicleFilter}
              allowClear
              style={{ width: '100%' }}
            >
              {vehicles.map(vehicle => (
                <Option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.plateNumber}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={6}>
            <RangePicker
              value={dateFilter}
              onChange={setDateFilter}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              style={{ width: '100%' }}
            />
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredBookings}
          rowKey="id"
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
            getCheckboxProps: (record) => ({
              name: record.name,
            }),
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} bản ghi`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết đặt xe"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedBooking && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID đặt xe" span={2}>
              <code>{selectedBooking.id}</code>
            </Descriptions.Item>
            <Descriptions.Item label="Xe">
              {(() => {
                const vehicle = getVehicleInfo(selectedBooking.vehicle_id);
                return `${vehicle.brand} ${vehicle.model} - ${vehicle.plateNumber}`;
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Khách hàng">
              {(() => {
                const user = getUserInfo(selectedBooking.userId);
                return user.full_name || 'N/A';
              })()}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian bắt đầu">
              {dayjs(selectedBooking.start_time).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian kết thúc">
              {dayjs(selectedBooking.end_time).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={2}>
              <Tag color={getStatusColor(selectedBooking.status)}>
                {getStatusText(selectedBooking.status)}
              </Tag>
            </Descriptions.Item>
            {selectedBooking.priorityScore && (
              <Descriptions.Item label="Điểm ưu tiên" span={2}>
                <Badge count={selectedBooking.priorityScore} style={{ backgroundColor: '#52c41a' }} />
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày tạo">
              {selectedBooking.createdAt 
                ? dayjs(selectedBooking.createdAt).format('DD/MM/YYYY HH:mm')
                : 'N/A'
              }
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Create Booking Modal */}
      <Modal
        title="Thêm booking mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateBooking}
        >
          <Form.Item
            name="vehicle_id"
            label="Xe"
            rules={[{ required: true, message: 'Vui lòng chọn xe' }]}
          >
            <Select placeholder="Chọn xe">
              {vehicles.map(vehicle => (
                <Option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.plateNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="user_id"
            label="Khách hàng"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
          >
            <Select placeholder="Chọn khách hàng">
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.full_name} - {user.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian đặt xe"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <RangePicker
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            initialValue="pending"
          >
            <Select>
              <Option value="pending">Đang chờ</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={actionLoading}>
                Tạo booking
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Booking Modal */}
      <Modal
        title="Chỉnh sửa booking"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditBooking}
        >
          <Form.Item
            name="vehicle_id"
            label="Xe"
            rules={[{ required: true, message: 'Vui lòng chọn xe' }]}
          >
            <Select placeholder="Chọn xe">
              {vehicles.map(vehicle => (
                <Option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model} - {vehicle.plateNumber}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="user_id"
            label="Khách hàng"
            rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
          >
            <Select placeholder="Chọn khách hàng">
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  {user.full_name} - {user.email}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian đặt xe"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <RangePicker
              format="DD/MM/YYYY"
              placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
          >
            <Select>
              <Option value="pending">Đang chờ</Option>
              <Option value="confirmed">Đã xác nhận</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => {
                setEditModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={actionLoading}>
                Cập nhật booking
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookingManagement;
