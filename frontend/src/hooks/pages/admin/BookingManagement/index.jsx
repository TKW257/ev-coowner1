// src/pages/admin/ManageBookings.jsx
import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Button, message, Select, Modal, Form, Input, DatePicker, InputNumber, Switch } from "antd";
import bookingApi from "../../../../api/bookingApi";
import StorageKeys from "../../../../constants/storage-key";

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userFilter, setUserFilter] = useState("all");
  const [users, setUsers] = useState([]);
  
  // Check-in/Check-out modal states
  const [checkingModalVisible, setCheckingModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [checkingType, setCheckingType] = useState(""); // "checkin" or "checkout"
  const [form] = Form.useForm();

  useEffect(() => {
    // Log authentication info
    const token = localStorage.getItem(StorageKeys.TOKEN);
    console.log("🔑 Token from localStorage:", token);
    console.log("🔑 Token exists:", !!token);
    
    fetchBookings();
    fetchUsers();
  }, []);

  // Lấy danh sách booking khi filter user thay đổi
  useEffect(() => {
    if (userFilter !== "all") {
      fetchUserBookings(userFilter);
    } else {
      fetchBookings();
    }
  }, [userFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching all bookings...");
      const response = await bookingApi.getAllBookings();
      console.log("📊 API Response:", response);
      console.log("📋 Response type:", typeof response);
      console.log("📋 Is array:", Array.isArray(response));
      
      // Vì axiosClient interceptor đã trả về response.data
      // nên response ở đây chính là data array
      const bookingsData = Array.isArray(response) ? response : [];
      console.log("📋 Bookings data to set:", bookingsData);
      console.log("📋 Bookings data length:", bookingsData.length);
      console.log("📋 First booking item:", bookingsData[0]);
      
      setBookings(bookingsData);
      console.log("✅ Bookings state updated");
    } catch (error) {
      message.error("Không tải được danh sách booking!");
      console.error("❌ Error fetching bookings:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async (userId) => {
    setLoading(true);
    try {
      console.log("🔍 Fetching user bookings for user:", userId);
      const response = await bookingApi.getAllBookings();
      console.log("📊 User Bookings API Response:", response);
      console.log("📋 Is array:", Array.isArray(response));
      
      // Vì axiosClient interceptor đã trả về response.data
      const userBookings = Array.isArray(response) ? response : [];
      console.log("📋 User Bookings processed:", userBookings);
      setBookings(userBookings);
    } catch (error) {
      message.error("Không tải được booking của user!");
      console.error("❌ Error fetching user bookings:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
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

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      console.log("🔄 Updating booking status:", { bookingId, newStatus });
      
      // Check if token exists before making request
      const token = localStorage.getItem(StorageKeys.TOKEN);
      console.log("🔑 Token check:", { tokenExists: !!token, tokenPreview: token ? token.substring(0, 20) + "..." : "No token" });
      
      if (!token) {
        message.error("Không có token xác thực! Vui lòng đăng nhập lại.");
        return;
      }
      
      // Validate bookingId
      if (!bookingId) {
        message.error("ID booking không hợp lệ!");
        console.error("❌ Invalid bookingId:", bookingId);
        return;
      }
      
      // Validate status
      const validStatuses = ["Pending", "Completed", "Cancelled"];
      if (!validStatuses.includes(newStatus)) {
        message.error(`Trạng thái không hợp lệ: ${newStatus}`);
        console.error("❌ Invalid status:", newStatus);
        return;
      }
      
      console.log("🚀 Calling bookingApi.updateStatus with:", { bookingId, newStatus });
      const response = await bookingApi.updateStatus(bookingId, newStatus);
      console.log("✅ Status update response:", response);
      
      message.success(`Cập nhật trạng thái thành ${newStatus} thành công!`);
      
      // Refresh danh sách booking sau khi update thành công
      console.log("🔄 Refreshing bookings list...");
      if (userFilter !== "all") {
        await fetchUserBookings(userFilter);
      } else {
        await fetchBookings();
      }
      console.log("✅ Bookings list refreshed");
      
    } catch (error) {
      console.error("❌ Error updating status:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error status:", error.response?.status);
      console.error("❌ Error data:", error.response?.data);
      console.error("❌ Error message:", error.message);
      
      // Hiển thị lỗi chi tiết hơn
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
      
      console.error("❌ Final error message:", errorMessage);
      message.error(errorMessage);
    }
  };

  const handleCheckInOut = (booking, type) => {
    console.log("🚀 Starting check-in/out process...");
    console.log("📋 Selected booking:", booking);
    console.log("🔧 Checking type:", type);
    
    setCurrentBooking(booking);
    setCheckingType(type);
    setCheckingModalVisible(true);
    form.resetFields();
    
    console.log("✅ Modal opened for:", type);
  };

  const handleCheckingSubmit = async () => {
    try {
      console.log("📝 Form submission started...");
      const values = await form.validateFields();
      console.log("📋 Form values:", values);
      
      // Convert DatePicker to array format [year, month, day, hour, minute, second]
      const checkTime = values.checkingTime ? [
        values.checkingTime.year(),
        values.checkingTime.month() + 1, // month() returns 0-11, API expects 1-12
        values.checkingTime.date(),
        values.checkingTime.hour(),
        values.checkingTime.minute(),
        values.checkingTime.second()
      ] : [
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        new Date().getDate(),
        new Date().getHours(),
        new Date().getMinutes(),
        new Date().getSeconds()
      ];

      console.log("⏰ Check time array:", checkTime);

      const checkingData = {
        vehicleId: currentBooking.vehicleId,
        userEmail: values.userEmail || "admin@example.com", // TODO: Get from current user
        bookingId: currentBooking.bookingId,
        checkingType: checkingType === "checkin" ? "CheckIn" : "CheckOut",
        checkTime: checkTime,
        odometer: values.odometer || 0,
        batteryPercent: values.batteryPercent || 100,
        damageReported: values.damageReported || false,
        notes: values.notes || "",
        distanceTraveled: checkingType === "checkout" ? values.distanceTraveled : null,
        batteryUsedPercent: checkingType === "checkout" ? values.batteryUsedPercent : null
      };

      console.log("📦 Final checking data to send:", checkingData);
      console.log("🌐 API endpoint: /staff-checkings/createStaffChecking");
      
      await bookingApi.createStaffChecking(checkingData);
      
      console.log("✅ API call successful!");
      message.success(`${checkingType === "checkin" ? "Check-in" : "Check-out"} thành công!`);
      setCheckingModalVisible(false);
      
      console.log("🔄 Refreshing bookings list...");
      // Refresh danh sách booking
      if (userFilter !== "all") {
        fetchUserBookings(userFilter);
      } else {
        fetchBookings();
      }
    } catch (error) {
      console.error("❌ Error in checking submission:", error);
      console.error("❌ Error details:", error.response?.data);
      console.error("❌ Error status:", error.response?.status);
      message.error(`Không thể thực hiện ${checkingType === "checkin" ? "check-in" : "check-out"}!`);
    }
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
      render: (_, record) => (
        <Space>
          {record.bookingStatus === "Pending" && (
            <Button 
              type="primary" 
              size="small"
              onClick={() => handleStatusUpdate(record.bookingId, "Completed")}
            >
              Xác nhận
            </Button>
          )}
          {record.bookingStatus === "Completed" && (
            <>
              <Button 
                type="primary" 
                size="small"
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                onClick={() => handleCheckInOut(record, "checkin")}
              >
                Check-in
              </Button>
              <Button 
                type="primary" 
                size="small"
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                onClick={() => handleCheckInOut(record, "checkout")}
              >
                Check-out
              </Button>
            </>
          )}
          <Button 
            danger 
            size="small"
            onClick={() => handleStatusUpdate(record.bookingId, "Cancelled")}
          >
            Hủy
          </Button>
        </Space>
      ),
    },
  ];

  // Debug log for bookings state
  console.log("🔍 Current bookings state:", bookings);
  console.log("🔍 Bookings state length:", bookings.length);
  console.log("🔍 Loading state:", loading);

  // Debug function để kiểm tra token và API
  const debugTokenAndAPI = () => {
    const token = localStorage.getItem(StorageKeys.TOKEN);
    console.log("🔍 DEBUG: Current token:", token);
    console.log("🔍 DEBUG: Token exists:", !!token);
    console.log("🔍 DEBUG: All localStorage keys:", Object.keys(localStorage));
    console.log("🔍 DEBUG: Current bookings count:", bookings.length);
    console.log("🔍 DEBUG: Sample booking:", bookings[0]);
    
    message.info("Debug info logged to console. Press F12 to check.");
  };

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
        
        <Button 
          type="default" 
          onClick={debugTokenAndAPI}
          style={{ backgroundColor: '#f0f0f0' }}
        >
          🔍 Debug Token & API
        </Button>
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
        onCancel={() => setCheckingModalVisible(false)}
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
            rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
          >
            <Input placeholder="Nhập email người dùng" />
          </Form.Item>

          <Form.Item 
            name="checkingTime" 
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          >
            <DatePicker 
              showTime 
              format="DD/MM/YYYY HH:mm:ss"
              placeholder="Chọn thời gian"
              style={{ width: '100%' }}
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

          {checkingType === "checkout" && (
            <>
              <Form.Item 
                name="distanceTraveled" 
                label="Quãng đường đã đi (km)"
              >
                <InputNumber 
                  placeholder="Nhập quãng đường"
                  style={{ width: '100%' }}
                  min={0}
                  step={0.1}
                />
              </Form.Item>

              <Form.Item 
                name="batteryUsedPercent" 
                label="Phần trăm pin đã sử dụng (%)"
              >
                <InputNumber 
                  placeholder="Nhập phần trăm pin đã sử dụng"
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  step={0.1}
                />
              </Form.Item>
            </>
          )}

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
    </div>
  );
};

export default ManageBookings;
