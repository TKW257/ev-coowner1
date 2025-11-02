import React, { useState, useEffect, useCallback, useRef } from "react";
import { Table, Tag, Space, Button, Select, Modal, Form, Input, InputNumber, Switch, Typography, Card, Row, Col } from "antd";
import { ClockCircleOutlined, CheckCircleOutlined, SyncOutlined, SmileOutlined, StopOutlined, AppstoreOutlined } from "@ant-design/icons";
import bookingApi from "../../../api/bookingApi";
import { App } from "antd";
import SignatureCanvas from "react-signature-canvas";

const { Title } = Typography;

const ManageBookings = () => {
  /** -------------------- STATE -------------------- */
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [staffCheckings, setStaffCheckings] = useState([]);

  const [checkingModalVisible, setCheckingModalVisible] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [checkingType, setCheckingType] = useState("");
  const [hasUserEmail, setHasUserEmail] = useState(false);
  const [form] = Form.useForm();
  const sigPadRef = useRef(null);
  const { notification } = App.useApp();

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  /** -------------------- FETCH API -------------------- */
  // Lấy tất cả booking
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingApi.getAllBookings();
      const bookingsData = Array.isArray(response) ? response : [];
      setBookings(bookingsData);
      setAllBookings(bookingsData);
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy tất cả staff check-in/out
  const fetchStaffCheckings = useCallback(async () => {
    try {
      const response = await bookingApi.getAllStaffCheckings();
      const checkingsData = Array.isArray(response) ? response : [];
      setStaffCheckings(checkingsData);
      console.log("📋 Staff Checkings:", checkingsData);
    } catch (error) {
      console.error("❌ Error fetching staff checkings:", error);
    }
  }, []);

  /** -------------------- KHỞI TẠO DỮ LIỆU -------------------- */
  useEffect(() => {
    fetchBookings();
    fetchStaffCheckings();
  }, [fetchBookings, fetchStaffCheckings]);

  /** -------------------- LỌC & SẮP XẾP -------------------- */
  useEffect(() => {
    let filtered = allBookings;
    if (statusFilter !== "all") {
      filtered = allBookings.filter((b) => String(b.bookingStatus) === statusFilter);
    }
    const sorted = [...filtered].sort((a, b) => {
      const aId = Number(a.bookingId ?? a.id ?? 0);
      const bId = Number(b.bookingId ?? b.id ?? 0);
      return sortOrder === "newest" ? bId - aId : aId - bId;
    });
    setBookings(sorted);
  }, [statusFilter, sortOrder, allBookings]);

  /** -------------------- CẬP NHẬT TRẠNG THÁI -------------------- */
  const handleStatusUpdateClick = (bookingId, newStatus, actionType) => {
    setPendingAction({ bookingId, newStatus, actionType });
    setConfirmModalVisible(true);
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;

    const { bookingId, newStatus } = pendingAction;
    setConfirmModalVisible(false);

    try {
      const validStatuses = ["Pending", "Confirmed", "InProgress", "Completed", "Cancelled"];
      if (!validStatuses.includes(newStatus)) return;

      await bookingApi.updateStatus(bookingId, newStatus);
      await fetchBookings();

      notification.success({
        message: "Thành công",
        description: `Trạng thái đơn đặt xe đã được cập nhật thành "${newStatus}".`,
        placement: "topRight",
      });
    } catch (error) {
      console.error("❌ Error update status:", error);
      notification.error({
        message: "Lỗi cập nhật trạng thái",
        description: "Không thể cập nhật trạng thái đơn đặt xe. Vui lòng thử lại!",
        placement: "topRight",
      });
    } finally {
      setPendingAction(null);
    }
  };


  const handleCancelAction = () => {
    setConfirmModalVisible(false);
    setPendingAction(null);
  };

  /** -------------------- CHECK-IN / CHECK-OUT -------------------- */
  const handleCheckInOut = (booking, type) => {
    setCurrentBooking(booking);
    setCheckingType(type);
    const hasUserEmailFromBooking = !!(booking.userEmail && booking.userEmail.trim());
    setHasUserEmail(hasUserEmailFromBooking);
    setCheckingModalVisible(true);

    if (hasUserEmailFromBooking) {
      form.setFieldsValue({ userEmail: booking.userEmail });
    } else {
      form.resetFields(["userEmail"]);
    }
  };

  const handleCheckingSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!currentBooking) return;

      const formData = new FormData();
      formData.append("vehicleId", currentBooking.vehicleId ?? "");
      formData.append("bookingId", currentBooking.bookingId ?? "");
      formData.append(
        "userEmail",
        values.userEmail || currentBooking.userEmail || "admin@example.com"
      );
      formData.append(
        "staffCheckingType",
        checkingType === "checkin" ? "CheckIn" : "CheckOut"
      );
      formData.append("odometer", (values.odometer ?? 0).toString());
      formData.append("batteryPercent", (values.batteryPercent ?? 100).toString());
      formData.append("damageReported", (values.damageReported ?? false).toString());
      formData.append("notes", values.notes ?? "");

      const sigPad = sigPadRef.current;
      if (sigPad && !sigPad.isEmpty()) {
        const blob = await new Promise((resolve) => sigPad.getCanvas().toBlob(resolve));
        if (blob) formData.append("staffSignature", blob, "signature.png");
      }

      await bookingApi.createStaffChecking(formData);

      let newStatus = null;
      if (checkingType === "checkin") newStatus = "InProgress";
      else if (checkingType === "checkout") newStatus = "Confirmed";

      if (newStatus) await bookingApi.updateStatus(currentBooking.bookingId, newStatus);

      // Thông báo thành công
      notification.success({
        message: checkingType === "checkin" ? "Check-in thành công" : "Check-out thành công",
        description:
          checkingType === "checkin"
            ? "Xe đã được bàn giao thành công cho người dùng."
            : "Xe đã được hoàn trả và kiểm tra xong.",
        placement: "topRight",
      });

      // Reset UI
      setCheckingModalVisible(false);
      setHasUserEmail(false);
      setCurrentBooking(null);
      form.resetFields();
      sigPadRef.current?.clear();

      await fetchStaffCheckings();
      await fetchBookings();
    } catch (error) {
      console.error("❌ Error during checking submit:", error);
      notification.error({
        message: "Lỗi khi thực hiện",
        description: "Đã xảy ra lỗi khi xử lý Check-in/Check-out. Vui lòng thử lại!",
        placement: "topRight",
      });
    }
  };


  /** -------------------- TRẠNG THÁI CHECKING -------------------- */
  const getBookingCheckingStatus = (bookingId) => {
    const idStr = String(bookingId);
    const bookingCheckings = staffCheckings.filter((checking) => {
      const cId = String(checking.bookingId ?? checking.booking_id ?? checking.bookingId);
      return cId === idStr;
    });

    const hasCheckIn = bookingCheckings.some(
      (checking) =>
        checking.checkingType === "CheckIn" || checking.staffCheckingType === "CheckIn"
    );
    const hasCheckOut = bookingCheckings.some(
      (checking) =>
        checking.checkingType === "CheckOut" || checking.staffCheckingType === "CheckOut"
    );

    return { hasCheckIn, hasCheckOut };
  };

  /** -------------------- THỐNG KÊ TRẠNG THÁI -------------------- */
  const statusCounts = allBookings.reduce((acc, booking) => {
    const status = booking.bookingStatus || "Unknown";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  /** -------------------- CẤU HÌNH CÁC STATUS CARD -------------------- */
  const statusCards = [
    { label: "Tất cả", value: "all", color: "default", icon: <AppstoreOutlined /> },
    { label: "Pending", value: "Pending", color: "orange", icon: <ClockCircleOutlined /> },
    { label: "Confirmed", value: "Confirmed", color: "blue", icon: <CheckCircleOutlined /> },
    { label: "In Progress", value: "InProgress", color: "purple", icon: <SyncOutlined spin /> },
    { label: "Completed", value: "Completed", color: "green", icon: <SmileOutlined /> },
    { label: "Cancelled", value: "Cancelled", color: "red", icon: <StopOutlined /> },
  ];

  /** -------------------- CẤU HÌNH BẢNG HIỂN THỊ -------------------- */
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
        if (record.bookingStatus === "Cancelled") return <span>-</span>;

        const { hasCheckIn, hasCheckOut } = getBookingCheckingStatus(record.bookingId);

        return (
          <Space>
            {record.bookingStatus === "Pending" && (
              <>
                <Button
                  type="primary"
                  size="small"
                  onClick={() =>
                    handleStatusUpdateClick(record.bookingId, "Confirmed", "Xác nhận")
                  }
                >
                  Xác nhận
                </Button>
                <Button
                  danger
                  size="small"
                  onClick={() =>
                    handleStatusUpdateClick(record.bookingId, "Cancelled", "Hủy")
                  }
                >
                  Hủy
                </Button>
              </>
            )}

            {record.bookingStatus === "Confirmed" && !hasCheckOut && (
              <Button
                type="primary"
                size="small"
                onClick={() => handleCheckInOut(record, "checkout")}
              >
                Check-out
              </Button>
            )}

            {record.bookingStatus === "InProgress" && hasCheckOut && !hasCheckIn && (
              <Button
                type="primary"
                size="small"
                onClick={() => handleCheckInOut(record, "checkin")}
              >
                Check-in
              </Button>
            )}

            {record.bookingStatus === "Completed" && (
              <span style={{ fontSize: "12px", color: "#52c41a" }}>
                {hasCheckIn && hasCheckOut
                  ? "Đã hoàn thành"
                  : hasCheckIn
                    ? "Đã check-in"
                    : "Đã check-out"}
              </span>
            )}
          </Space>
        );
      },
    },
  ];
  return (
    <div>
      <div style={{ marginBottom: 36 }} />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statusCards.map((item) => {
          const isActive = statusFilter === item.value;
          const iconMap = {
            all: <AppstoreOutlined style={{ fontSize: 24 }} />,
            Pending: <ClockCircleOutlined style={{ fontSize: 24 }} />,
            Confirmed: <CheckCircleOutlined style={{ fontSize: 24 }} />,
            InProgress: <SyncOutlined spin style={{ fontSize: 24 }} />,
            Completed: <SmileOutlined style={{ fontSize: 24 }} />,
            Cancelled: <StopOutlined style={{ fontSize: 24 }} />,
          };

          const colorMap = {
            Pending: "#faad14",
            Confirmed: "#1890ff",
            InProgress: "#722ed1",
            Completed: "#52c41a",
            Cancelled: "#ff4d4f",
            all: "#595959",
          };

          const cardColor = colorMap[item.value] || "#d9d9d9";

          return (
            <Col key={item.value} xs={12} sm={8} md={6} lg={4}>
              <Card
                hoverable
                onClick={() => setStatusFilter(item.value)}
                style={{
                  textAlign: "center",
                  border: `2px solid ${isActive ? cardColor : "#f0f0f0"}`,
                  backgroundColor: isActive ? `${cardColor}15` : "#fff",
                  boxShadow: isActive
                    ? `0 0 8px ${cardColor}60`
                    : "0 1px 3px rgba(0,0,0,0.1)",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                <div style={{ color: cardColor, marginBottom: 6 }}>
                  {iconMap[item.value]}
                </div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: isActive ? cardColor : "#000",
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    marginTop: 4,
                    color: isActive ? cardColor : "#000",
                  }}
                >
                  {item.value === "all"
                    ? allBookings.length
                    : statusCounts[item.value] || 0}
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Select
        style={{ width: 200, marginBottom: 16 }}
        placeholder="Sắp xếp theo ID"
        value={sortOrder}
        onChange={setSortOrder}
      >
        <Select.Option value="newest">Mới nhất</Select.Option>
        <Select.Option value="oldest">Cũ nhất</Select.Option>
      </Select>

      <Table
        rowKey={(record) => String(record.bookingId)}
        columns={columns}
        dataSource={bookings}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

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
