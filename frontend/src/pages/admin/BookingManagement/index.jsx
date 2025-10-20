// src/pages/admin/ManageBookings.jsx
import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Button, message, Select, Modal, Form, Input, InputNumber, Switch } from "antd";
import bookingApi from "../../../api/bookingApi";
import StorageKeys from "../../../constants/storage-key";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userFilter, setUserFilter] = useState("all");
  const [users, setUsers] = useState([]);
  const [staffCheckings, setStaffCheckings] = useState([]);
  
  // Check-in/Check-out modal states
  const [checkingModalVisible, setCheckingModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [checkingType, setCheckingType] = useState(""); // "checkin" or "checkout"
  const [hasUserEmail, setHasUserEmail] = useState(false);
  const [form] = Form.useForm();
  
  // Confirmation modal states
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // { bookingId, newStatus, actionType }

  useEffect(() => {
    fetchBookings();
    fetchUsers();
    fetchStaffCheckings();
  }, []);

  // Lấy danh sách booking khi filter user thay đổi
  useEffect(() => {
    fetchStaffCheckings(); // Luôn fetch lại staff checkings để đảm bảo dữ liệu mới nhất
    if (userFilter !== "all") {
      fetchUserBookings();
    } else {
      fetchBookings();
    }
  }, [userFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingApi.getAllBookings();
      console.log("📊 BookingManagement - API Response:", response);
      console.log("📋 Response Type:", typeof response);
      console.log("📋 Is Array:", Array.isArray(response));
      
      const bookingsData = Array.isArray(response) ? response : [];
      console.log("📋 Bookings Data:", bookingsData);
      console.log("📋 Total bookings:", bookingsData.length);
      
      if (bookingsData.length > 0) {
        console.log("📋 First booking sample:", bookingsData[0]);
      }
      
      setBookings(bookingsData);
    } catch (error) {
      message.error("Không tải được danh sách booking!");
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingApi.getAllBookings();
      console.log("📊 BookingManagement - User Bookings API Response:", response);
      console.log("📋 User Bookings Type:", typeof response);
      console.log("📋 User Bookings Is Array:", Array.isArray(response));
      
      const userBookings = Array.isArray(response) ? response : [];
      console.log("📋 User Bookings Data:", userBookings);
      console.log("📋 Total user bookings:", userBookings.length);
      
      setBookings(userBookings);
    } catch (error) {
      message.error("Không tải được booking của user!");
      console.error("Error fetching user bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      // Mock users data - trong thực tế sẽ call API để lấy danh sách users
      const mockUsers = [
        { id: "1", full_name: "Phu Nguyen" },
        { id: "2", full_name: "Jane Doe" },
        { id: "3", full_name: "Jack Doe" }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchStaffCheckings = async () => {
    try {
      const response = await bookingApi.getAllStaffCheckings();
      const checkingsData = Array.isArray(response) ? response : [];
      setStaffCheckings(checkingsData);
      console.log("📋 Staff Checkings:", checkingsData);
    } catch (error) {
      console.error("Error fetching staff checkings:", error);
    }
  };

  const handleStatusUpdateClick = (bookingId, newStatus, actionType) => {
    setPendingAction({
      bookingId,
      newStatus,
      actionType
    });
    setConfirmModalVisible(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    
    const { bookingId, newStatus } = pendingAction;
    setConfirmModalVisible(false);
    
    try {
      const token = localStorage.getItem(StorageKeys.TOKEN);
      
      if (!token) {
        message.error("Không có token xác thực! Vui lòng đăng nhập lại.");
        return;
      }
      
      if (!bookingId) {
        message.error("ID booking không hợp lệ!");
        return;
      }
      
      const validStatuses = ["Pending", "Completed", "Cancelled"];
      if (!validStatuses.includes(newStatus)) {
        message.error(`Trạng thái không hợp lệ: ${newStatus}`);
        return;
      }
      
      await bookingApi.updateStatus(bookingId, newStatus);
      message.success(`Cập nhật trạng thái thành ${newStatus} thành công!`);
      
      if (userFilter !== "all") {
        await fetchUserBookings();
      } else {
        await fetchBookings();
      }
      
    } catch (error) {
      let errorMessage = "Không thể cập nhật trạng thái!";
      
      if (error.response?.status === 401) {
        errorMessage = "Không có quyền truy cập! Vui lòng đăng nhập lại.";
      } else if (error.response?.status === 403) {
        errorMessage = "Bạn không có quyền thực hiện hành động này!";
      } else if (error.response?.status === 404) {
        errorMessage = "Không tìm thấy booking với ID này!";
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || "Dữ liệu đầu vào không hợp lệ!";
      } else if (error.response?.status >= 500) {
        errorMessage = "Lỗi máy chủ! Vui lòng thử lại sau.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = `Lỗi: ${error.message}`;
      }
      
      message.error(errorMessage);
    } finally {
      setPendingAction(null);
    }
  };

  const handleCancelAction = () => {
    setConfirmModalVisible(false);
    setPendingAction(null);
  };


  const handleCheckInOut = (booking, type) => {
    setCurrentBooking(booking);
    setCheckingType(type);
    setHasUserEmail(!!booking.userEmail);
    setCheckingModalVisible(true);
    
    // Set initial values cho form
    setTimeout(() => {
      form.setFieldsValue({
        userEmail: booking.userEmail || ''
      });
    }, 100);
  };

  const handleCheckingSubmit = async () => {
    try {
      const values = await form.validateFields();

      const checkingData = {
        vehicleId: currentBooking.vehicleId,
        userEmail: values.userEmail || currentBooking.userEmail || "admin@example.com",
        bookingId: currentBooking.bookingId,
        staffCheckingType: checkingType === "checkin" ? "CheckIn" : "CheckOut",
        odometer: values.odometer || 0,
        batteryPercent: values.batteryPercent || 100,
        damageReported: values.damageReported || false,
        notes: values.notes || ""
      };
      
      await bookingApi.createStaffChecking(checkingData);
      message.success(`${checkingType === "checkin" ? "Check-in" : "Check-out"} thành công!`);
      setCheckingModalVisible(false);
      setHasUserEmail(false);
      
      // Fetch lại dữ liệu để cập nhật trạng thái
      fetchStaffCheckings();
      if (userFilter !== "all") {
        fetchUserBookings();
      } else {
        fetchBookings();
      }
    } catch {
      message.error(`Không thể thực hiện ${checkingType === "checkin" ? "check-in" : "check-out"}!`);
    }
  };

  // Function để kiểm tra trạng thái check-in/check-out của booking
  const getBookingCheckingStatus = (bookingId) => {
    const bookingCheckings = staffCheckings.filter(
      checking => checking.bookingId === bookingId || checking.booking_id === bookingId
    );
    
    const hasCheckIn = bookingCheckings.some(
      checking => checking.checkingType === "CheckIn" || checking.staffCheckingType === "CheckIn"
    );
    
    const hasCheckOut = bookingCheckings.some(
      checking => checking.checkingType === "CheckOut" || checking.staffCheckingType === "CheckOut"
    );
    
    return { hasCheckIn, hasCheckOut };
  };

  const columns = [
    { title: "ID",
      dataIndex: "bookingId",
      key: "bookingId" },
    {
      title: "Tên xe",
      dataIndex: "vehicleName",
      key: "vehicleName",
    },
    {
      title: "Người đặt",
      dataIndex: "userName",
      key: "userName",
    },
    { 
      title: "Ngày bắt đầu", 
      dataIndex: "startTime", 
      key: "startTime",
      render: (timeArray) => {
        if (!timeArray || !Array.isArray(timeArray)) return '-';
        const [year, month, day, hour, minute] = timeArray;
        return `${day}/${month}/${year} ${hour}:${minute.toString().padStart(2, '0')}`;
      }
    },
    { 
      title: "Ngày kết thúc", 
      dataIndex: "endTime", 
      key: "endTime",
      render: (timeArray) => {
        if (!timeArray || !Array.isArray(timeArray)) return '-';
        const [year, month, day, hour, minute] = timeArray;
        return `${day}/${month}/${year} ${hour}:${minute.toString().padStart(2, '0')}`;
      }
    },
    {
      title: "Trạng thái",
      dataIndex: "bookingStatus",
      key: "bookingStatus",
      render: (status) => (
        <Tag color={status === "Completed" ? "green" : status === "Pending" ? "orange" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        // Nếu trạng thái là Cancelled thì không hiển thị nút nào
        if (record.bookingStatus === "Cancelled") {
          return <span>-</span>;
        }

        // Lấy trạng thái checking của booking
        const { hasCheckIn, hasCheckOut } = getBookingCheckingStatus(record.bookingId);

        return (
          <Space>
            {/* Trạng thái Pending: hiển thị 2 nút Xác nhận và Hủy */}
            {record.bookingStatus === "Pending" && (
              <>
                <Button 
                  type="primary" 
                  size="small"
                  onClick={() => handleStatusUpdateClick(record.bookingId, "Completed", "Xác nhận")}
                >
                  Xác nhận
                </Button>
                <Button 
                  danger 
                  size="small"
                  onClick={() => handleStatusUpdateClick(record.bookingId, "Cancelled", "Hủy")}
                >
                  Hủy
                </Button>
              </>
            )}
            
            {/* Trạng thái Completed: Logic hiển thị nút theo trạng thái check-in/check-out */}
            {record.bookingStatus === "Completed" && (
              <>
                {/* Sau khi xác nhận, hiển thị nút Check-out */}
                {!hasCheckIn && !hasCheckOut && (
                  <Button 
                    type="primary" 
                    size="small"
                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                    onClick={() => handleCheckInOut(record, "checkout")}
                  >
                    Check-out
                  </Button>
                )}
                
                {/* Sau khi đã check-out, hiển thị nút Check-in */}
                {!hasCheckIn && hasCheckOut && (
                  <Button 
                    type="primary" 
                    size="small"
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    onClick={() => handleCheckInOut(record, "checkin")}
                  >
                    Check-in
                  </Button>
                )}
              </>
            )}
          </Space>
        );
      },
    },
  ];

  // Log bookings state để debug
  console.log("🔍 BookingManagement - Current bookings state:", bookings);
  console.log("🔍 BookingManagement - Bookings count:", bookings.length);
  console.log("🔍 BookingManagement - Loading state:", loading);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Select
          style={{ width: 200 }}
          placeholder="Chọn user để lọc"
          value={userFilter}
          onChange={setUserFilter}
        >
          <Select.Option value="all">Tất cả users</Select.Option>
          {users.map(user => (
            <Select.Option key={user.id} value={user.id}>
              {user.full_name}
            </Select.Option>
          ))}
        </Select>
        
      </div>
      <Table
        rowKey="bookingId"
        columns={columns}
        dataSource={bookings}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Check-in/Check-out Modal */}
      <Modal
        title={`${checkingType === "checkin" ? "Check-in" : "Check-out"} - ${currentBooking?.vehicleName}`}
        open={checkingModalVisible}
        onOk={handleCheckingSubmit}
        onCancel={() => {
          setCheckingModalVisible(false);
          setHasUserEmail(false);
        }}
        okText={checkingType === "checkin" ? "Check-in" : "Check-out"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Booking ID">
            <Input value={currentBooking?.bookingId} disabled />
          </Form.Item>
          <Form.Item label="Tên xe">
            <Input value={currentBooking?.vehicleName} disabled />
          </Form.Item>
          <Form.Item label="Người đặt">
            <Input value={currentBooking?.userName} disabled />
          </Form.Item>
          
          <Form.Item 
            name="userEmail" 
            label="Email người dùng"
            rules={[{ required: !hasUserEmail, message: 'Vui lòng nhập email!' }]}
          >
            <Input 
              placeholder={hasUserEmail ? "Email từ dữ liệu booking" : "Nhập email người dùng"} 
              disabled={hasUserEmail}
            />
          </Form.Item>


          <Form.Item 
            name="odometer" 
            label="Số km đồng hồ"
            rules={[{ required: true, message: 'Vui lòng nhập số km!' }]}
          >
            <InputNumber 
              placeholder="Nhập số km"
              style={{ width: '100%' }}
              min={0}
              step={0.1}
            />
          </Form.Item>

          <Form.Item 
            name="batteryPercent" 
            label="Phần trăm pin (%)"
            rules={[{ required: true, message: 'Vui lòng nhập phần trăm pin!' }]}
          >
            <InputNumber 
              placeholder="Nhập phần trăm pin"
              style={{ width: '100%' }}
              min={0}
              max={100}
              step={0.1}
            />
          </Form.Item>

          <Form.Item 
            name="damageReported" 
            label="Có hư hỏng"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>


          <Form.Item 
            name="notes" 
            label="Ghi chú"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Nhập ghi chú (tùy chọn)"
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        title="Xác nhận hành động"
        open={confirmModalVisible}
        onOk={handleConfirmAction}
        onCancel={handleCancelAction}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{
          style: pendingAction?.newStatus === "Cancelled" 
            ? { backgroundColor: '#ff4d4f', borderColor: '#ff4d4f' }
            : {}
        }}
      >
        <p>
          {pendingAction?.newStatus === "Completed" && 
            `Bạn có chắc chắn muốn xác nhận booking này?`}
          {pendingAction?.newStatus === "Cancelled" && 
            `Bạn có chắc chắn muốn hủy booking này?`}
        </p>
        {pendingAction && (
          <p>
            <strong>Booking ID:</strong> {pendingAction.bookingId}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default ManageBookings;
