import React, { useState, useEffect, useCallback, useRef } from "react";
import { Table, Tag, Space, Button,
  message,
  Select,
  Modal,
  Form,
  Input,
  InputNumber,
  Switch,
  Typography,
} from "antd";
import bookingApi from "../../../api/bookingApi";
import StorageKeys from "../../../constants/storage-key";
import SignatureCanvas from "react-signature-canvas";

const { Title } = Typography;

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userFilter, setUserFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest"); // "newest" hoặc "oldest"
  const [users, setUsers] = useState([]);
  const [staffCheckings, setStaffCheckings] = useState([]);

  // Check-in/Check-out modal states
  const [checkingModalVisible, setCheckingModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [checkingType, setCheckingType] = useState("");
  const [hasUserEmail, setHasUserEmail] = useState(false);
  const [form] = Form.useForm();

  // useRef cho signature canvas (không dùng state để tránh re-render)
  const sigPadRef = useRef(null);

  // Confirmation modal states
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const extractUsersFromBookings = useCallback((bookingsData) => {
    const usersMap = new Map();

    bookingsData.forEach((booking) => {
      // cố gắng lấy nhiều trường khả dĩ
      const userId =
        booking.userId ??
        booking.user_id ??
        booking.user?.id ??
        booking.userName ??
        booking.user_name ??
        booking.email ??
        booking.userEmail ??
        null;

      const userName =
        booking.userName ??
        booking.user_name ??
        booking.full_name ??
        booking.user?.full_name ??
        booking.user?.name ??
        booking.userEmail ??
        null;

      // Nếu trùng key null thì bỏ
      if (userId && userName && !usersMap.has(String(userId))) {
        usersMap.set(String(userId), {
          id: String(userId),
          name: userName,
          full_name: userName,
        });
      }
    });

    return Array.from(usersMap.values());
  }, []);

  const filterBookingsByUser = useCallback((bookingsData, userId) => {
    if (userId === "all") {
      return bookingsData;
    }

    return bookingsData.filter((booking) => {
      const bookingUserId =
        booking.userId ??
        booking.user_id ??
        booking.user?.id ??
        booking.userName ??
        booking.user_name ??
        null;
      return String(bookingUserId) === String(userId);
    });
  }, []);

  // Hàm sắp xếp bookings theo ID (chuyển về số nếu có thể)
  const sortBookingsById = useCallback((bookingsData, order) => {
    return [...bookingsData].sort((a, b) => {
      const aId = Number(a.bookingId ?? a.id ?? 0) || 0;
      const bId = Number(b.bookingId ?? b.id ?? 0) || 0;
      return order === "newest" ? bId - aId : aId - bId;
    });
  }, []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingApi.getAllBookings();
      // bookingApi phải trả về mảng
      const bookingsData = Array.isArray(response) ? response : [];
      setBookings(bookingsData);
      setAllBookings(bookingsData);

      const usersFromBookings = extractUsersFromBookings(bookingsData);
      setUsers(usersFromBookings);
      console.log("📋 Users from bookings:", usersFromBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Không tải được danh sách booking!");
    } finally {
      setLoading(false);
    }
  }, [extractUsersFromBookings]);

  const fetchStaffCheckings = useCallback(async () => {
    try {
      const response = await bookingApi.getAllStaffCheckings();
      const checkingsData = Array.isArray(response) ? response : [];
      setStaffCheckings(checkingsData);
      console.log("📋 Staff Checkings:", checkingsData);
    } catch (error) {
      console.error("Error fetching staff checkings:", error);
    }
  }, []);

  // Mount: lấy dữ liệu 1 lần
  useEffect(() => {
    fetchBookings();
    fetchStaffCheckings();
  }, [fetchBookings, fetchStaffCheckings]);

  // Khi filter/sort/allBookings thay đổi => cập nhật bookings hiển thị
  useEffect(() => {
    const filteredByUser = filterBookingsByUser(allBookings, userFilter);
    const sortedAndFiltered = sortBookingsById(filteredByUser, sortOrder);
    setBookings(sortedAndFiltered);
    console.log("📋 Filtered and sorted bookings:", sortedAndFiltered);
  }, [userFilter, sortOrder, allBookings, filterBookingsByUser, sortBookingsById]);

  // Set form khi modal mở và có email
  useEffect(() => {
    if (checkingModalVisible && currentBooking && currentBooking.userEmail) {
      form.setFieldsValue({
        userEmail: currentBooking.userEmail,
      });
    }
  }, [checkingModalVisible, currentBooking, form]);

  const handleStatusUpdateClick = (bookingId, newStatus, actionType) => {
    setPendingAction({
      bookingId,
      newStatus,
      actionType,
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

      const validStatuses = ["Pending", "Confirmed", "InProgress", "Completed", "Cancelled"];
      if (!validStatuses.includes(newStatus)) {
        message.error(`Trạng thái không hợp lệ: ${newStatus}`);
        return;
      }

      await bookingApi.updateStatus(bookingId, newStatus);
      message.success(`Cập nhật trạng thái thành ${newStatus} thành công!`);

      await fetchBookings();
    } catch (error) {
      console.error("Error update status:", error);
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

    const hasUserEmailFromBooking = !!(booking.userEmail && booking.userEmail.trim());
    setHasUserEmail(hasUserEmailFromBooking);
    setCheckingModalVisible(true);

    // set form immediately nếu có email
    if (hasUserEmailFromBooking) {
      form.setFieldsValue({
        userEmail: booking.userEmail,
      });
    } else {
      form.resetFields(["userEmail"]);
    }
  };

  const handleCheckingSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!currentBooking) {
        message.error("Không có booking hiện tại để check-in/check-out.");
        return;
      }

      // Tạo FormData
      const formData = new FormData();
      formData.append("vehicleId", currentBooking.vehicleId ?? "");
      formData.append("bookingId", currentBooking.bookingId ?? "");
      formData.append("userEmail", values.userEmail || currentBooking.userEmail || "admin@example.com");
      formData.append("staffCheckingType", checkingType === "checkin" ? "CheckIn" : "CheckOut");
      formData.append("odometer", (values.odometer ?? 0).toString());
      formData.append("batteryPercent", (values.batteryPercent ?? 100).toString());
      formData.append("damageReported", (values.damageReported ?? false).toString());
      formData.append("notes", values.notes ?? "");

      // Lấy file chữ ký từ Signature Canvas (nếu có)
      const sigPad = sigPadRef.current;
      if (sigPad && !sigPad.isEmpty()) {
        const blob = await new Promise((resolve) => sigPad.getCanvas().toBlob(resolve));
        if (blob) {
          formData.append("staffSignature", blob, "signature.png");
        }
      }

      await bookingApi.createStaffChecking(formData);

      // Cập nhật trạng thái dựa trên loại checking
      let newStatus = null;

      if (checkingType === "checkin") {
        // Khi check-in -> chuyển trạng thái thành InProgress
        newStatus = "InProgress";
      } else if (checkingType === "checkout") {
        // Khi check-out -> chuyển trạng thái thành Confirmed
        newStatus = "Confirmed";
      }


      if (newStatus) {
        await bookingApi.updateStatus(currentBooking.bookingId, newStatus);
        message.success(
          `${checkingType === "checkin" ? "Check-in" : "Check-out"} thành công và cập nhật trạng thái thành ${newStatus}!`
        );
      } else {
        message.success(`${checkingType === "checkin" ? "Check-in" : "Check-out"} thành công!`);
      }


      // Đóng modal và refresh dữ liệu
      setCheckingModalVisible(false);
      setHasUserEmail(false);
      setCurrentBooking(null);
      form.resetFields();
      if (sigPadRef.current) sigPadRef.current.clear();

      await fetchStaffCheckings();
      await fetchBookings();
    } catch (error) {
      console.error("Error during checking submit:", error);
      message.error(`Không thể thực hiện ${checkingType === "checkin" ? "check-in" : "check-out"}!`);
    }
  };

  const getBookingCheckingStatus = (bookingId) => {
    const idStr = String(bookingId);
    const bookingCheckings = staffCheckings.filter((checking) => {
      const cId = String(checking.bookingId ?? checking.booking_id ?? checking.bookingId);
      return cId === idStr;
    });

    const hasCheckIn = bookingCheckings.some(
      (checking) => checking.checkingType === "CheckIn" || checking.staffCheckingType === "CheckIn"
    );

    const hasCheckOut = bookingCheckings.some(
      (checking) => checking.checkingType === "CheckOut" || checking.staffCheckingType === "CheckOut"
    );

    return { hasCheckIn, hasCheckOut };
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "bookingId",
      key: "bookingId",
    },
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
        if (!timeArray || !Array.isArray(timeArray)) return "-";
        const [year, month, day, hour, minute] = timeArray;
        return `${day}/${month}/${year} ${hour}:${String(minute ?? 0).padStart(2, "0")}`;
      },
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endTime",
      key: "endTime",
      render: (timeArray) => {
        if (!timeArray || !Array.isArray(timeArray)) return "-";
        const [year, month, day, hour, minute] = timeArray;
        return `${day}/${month}/${year} ${hour}:${String(minute ?? 0).padStart(2, "0")}`;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "bookingStatus",
      key: "bookingStatus",
      render: (status) => {
        const colorMap = {
          Confirmed: "blue",
          InProgress: "purple",
          Completed: "green",
          Pending: "orange",
          Cancelled: "red",
        };
        return <Tag color={colorMap[status] || "default"}>{String(status).toUpperCase()}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        if (record.bookingStatus === "Cancelled") {
          return <span>-</span>;
        }

        const { hasCheckIn, hasCheckOut } = getBookingCheckingStatus(record.bookingId);

        return (
          <Space>
            {record.bookingStatus === "Pending" && (
              <>
                <Button type="primary" size="small" onClick={() => handleStatusUpdateClick(record.bookingId, "Confirmed", "Xác nhận")}>
                  Xác nhận
                </Button>
                <Button danger size="small" onClick={() => handleStatusUpdateClick(record.bookingId, "Cancelled", "Hủy")}>
                  Hủy
                </Button>
              </>
            )}

            {record.bookingStatus === "Confirmed" && (
              <>
                {!hasCheckIn && !hasCheckOut && (
                  <Button type="primary" size="small" onClick={() => handleCheckInOut(record, "checkout")}>
                    Check-out
                  </Button>
                )}
              </>
            )}

            {record.bookingStatus === "InProgress" && (
              <>
                {hasCheckOut && !hasCheckIn && (
                  <Button type="primary" size="small" onClick={() => handleCheckInOut(record, "checkin")}>
                    Check-in
                  </Button>
                )}
              </>
            )}

            {record.bookingStatus === "Completed" && (
              <>
                {(hasCheckIn || hasCheckOut) && <span style={{ fontSize: "12px", color: "#52c41a" }}>{hasCheckIn && hasCheckOut ? "Đã hoàn thành" : hasCheckIn ? "Đã check-in" : "Đã check-out"}</span>}
              </>
            )}
          </Space>
        );
      },
    },
  ];

  // Debug logs (giữ hoặc xóa tuỳ bạn)
  console.log("🔍 BookingManagement - Current bookings state:", bookings);
  console.log("🔍 BookingManagement - Bookings count:", bookings.length);
  console.log("🔍 BookingManagement - Loading state:", loading);

  return (
    <div>
      <Title level={2} style={{ marginBottom: 24, textAlign: "left" }}>
        Đặt xe
      </Title>

      <div style={{ marginBottom: 16, display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
        <Select style={{ width: 200 }} placeholder="Chọn user để lọc" value={userFilter} onChange={setUserFilter}>
          <Select.Option value="all">Tất cả users</Select.Option>
          {users.map((user) => (
            <Select.Option key={user.id} value={user.id}>
              {user.full_name || user.name}
            </Select.Option>
          ))}
        </Select>

        <Select style={{ width: 200 }} placeholder="Sắp xếp theo ID" value={sortOrder} onChange={setSortOrder}>
          <Select.Option value="newest">Mới nhất</Select.Option>
          <Select.Option value="oldest">Cũ nhất</Select.Option>
        </Select>
      </div>

      <Table rowKey={(record) => String(record.bookingId)} columns={columns} dataSource={bookings} loading={loading} pagination={{ pageSize: 10 }} />

      {/* Check-in/Check-out Modal */}
      <Modal
        title={`${checkingType === "checkin" ? "Check-in" : "Check-out"} - ${currentBooking?.vehicleName ?? ""}`}
        open={checkingModalVisible}
        onOk={handleCheckingSubmit}
        onCancel={() => {
          setCheckingModalVisible(false);
          setHasUserEmail(false);
          setCurrentBooking(null);
          form.resetFields();
          if (sigPadRef.current) sigPadRef.current.clear();
        }}
        okText={checkingType === "checkin" ? "Check-in" : "Check-out"}
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Booking ID">
            <Input value={currentBooking?.bookingId ?? ""} disabled />
          </Form.Item>
          <Form.Item label="Tên xe">
            <Input value={currentBooking?.vehicleName ?? ""} disabled />
          </Form.Item>
          <Form.Item label="Người đặt">
            <Input value={currentBooking?.userName ?? ""} disabled />
          </Form.Item>

          <Form.Item name="userEmail" label="Email người dùng" rules={[{ required: !hasUserEmail, message: "Vui lòng nhập email!" }]}>
            <Input placeholder={hasUserEmail ? "Email từ dữ liệu booking" : "Nhập email người dùng"} disabled={hasUserEmail} />
          </Form.Item>

          <Form.Item name="odometer" label="Số km đồng hồ" rules={[{ required: true, message: "Vui lòng nhập số km!" }]}>
            <InputNumber placeholder="Nhập số km" style={{ width: "100%" }} min={0} step={0.1} />
          </Form.Item>

          <Form.Item name="batteryPercent" label="Phần trăm pin (%)" rules={[{ required: true, message: "Vui lòng nhập phần trăm pin!" }]}>
            <InputNumber placeholder="Nhập phần trăm pin" style={{ width: "100%" }} min={0} max={100} step={0.1} />
          </Form.Item>

          <Form.Item name="damageReported" label="Có hư hỏng" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item label="Chữ ký nhân viên">
            <SignatureCanvas
              ref={sigPadRef}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 150,
                className: "signatureCanvas",
                style: { border: "1px solid #ccc", borderRadius: "6px" },
              }}
            />
            <Button
              type="link"
              onClick={() => {
                if (sigPadRef.current) sigPadRef.current.clear();
              }}
              style={{ padding: 0, marginTop: 5 }}
            >
              Xóa chữ ký
            </Button>
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Nhập ghi chú (tùy chọn)" />
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
          style: pendingAction?.newStatus === "Cancelled" ? { backgroundColor: "#ff4d4f", borderColor: "#ff4d4f" } : {},
        }}
      >
        <p>
          {pendingAction?.newStatus === "Confirmed" && `Bạn có chắc chắn muốn xác nhận booking này?`}
          {pendingAction?.newStatus === "InProgress" && `Bạn có chắc chắn muốn chuyển booking này sang trạng thái đang thực hiện?`}
          {pendingAction?.newStatus === "Completed" && `Bạn có chắc chắn muốn hoàn thành booking này?`}
          {pendingAction?.newStatus === "Cancelled" && `Bạn có chắc chắn muốn hủy booking này?`}
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
