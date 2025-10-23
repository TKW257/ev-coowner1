import React, { useState, useEffect, useCallback } from "react";
import { Steps, Card, Row, Col, Tag, Typography, Button, Space, Spin, Empty, Popconfirm, Modal } from "antd";
import { CalendarOutlined, StopOutlined, CarOutlined, SwapOutlined } from "@ant-design/icons";
import bookingApi from "../../../api/bookingApi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import StaffCheckingReport from "./StaffCheckingReport";

const { Title, Text } = Typography;
const { Step } = Steps;

const BookingTracking = () => {
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const [staffCheckings, setStaffCheckings] = useState([]);
  const [loadingStaffCheckings, setLoadingStaffCheckings] = useState(false);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [confirmApproved, setConfirmApproved] = useState(true);
  const [confirmComment, setConfirmComment] = useState("");

  const statusStepIndex = {
    Pending: 0,
    Confirmed: 1,
    InProgress: 2,
    Completed: 3,
    Cancelled: 4,
  };

  const statusColor = {
    Pending: "orange",
    Confirmed: "blue",
    InProgress: "blue",
    Completed: "green",
    Cancelled: "red",
  };

  const convertDateArray = (arr) => {
    if (!Array.isArray(arr)) return arr;
    return dayjs(
      new Date(arr[0], arr[1] - 1, arr[2], arr[3] || 0, arr[4] || 0, arr[5] || 0)
    );
  };


  //Get My Bookings
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await bookingApi.getMyBooking();
      const data = Array.isArray(res) ? res : res.data || [];

      const normalized = data.map((b) => ({
        ...b,
        bookingStatus: b.bookingStatus?.trim(),
        startTime: convertDateArray(b.startTime),
        endTime: convertDateArray(b.endTime),
        createdAt: convertDateArray(b.createdAt),
      }));

      setBookings(normalized);
    } catch (error) {
      console.error("❌ Lỗi khi tải lịch sử đặt xe:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Cancel
  const handleCancelBooking = async (bookingId) => {
    try {
      setProcessingId(bookingId);
      await bookingApi.cancelBooking(bookingId);
      fetchBookings();
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  // Xác nhận biên bản kiểm tra
  const handleConfirmChecking = async () => {
    if (!staffCheckings || staffCheckings.length === 0) {
      console.error("❌ Không tìm thấy biên bản để xác nhận");
      return;
    }

    const checking = staffCheckings[0];
    const checkingId = checking.checkingId || checking.id || checking.staffCheckingId;

    if (!checkingId) {
      console.error("❌ Không có ID hợp lệ trong staffChecking:", checking);
      return;
    }

    try {
      console.log("📤 Gửi confirm cho ID:", checkingId);
      await bookingApi.confirmStaffChecking(checkingId, {
        id: checkingId,
        approved: confirmApproved,
        userComment: confirmComment,
      });

      setIsConfirmModalVisible(false);
      setIsModalVisible(false);
      setConfirmComment("");
      fetchBookings();
    } catch (err) {
      console.error("❌ Lỗi khi xác nhận biên bản:", err);
    }
  };



  // 🟩 Mở modal & lọc biên bản theo type (CheckIn / CheckOut)
  const openModal = async (booking, type) => {
    setSelectedBooking(booking);
    setModalType(type);
    setIsModalVisible(true);
    setLoadingStaffCheckings(true);

    try {
      const res = await bookingApi.getStaffCheckingsByBookingId(booking.bookingId);
      const allCheckings = Array.isArray(res)
        ? res
        : Array.isArray(res.data)
          ? res.data
          : [];

      // 🔍 Lọc chính xác không phân biệt hoa/thường
      const filtered = allCheckings.filter(
        (c) => c.checkingType?.toLowerCase() === type?.toLowerCase()
      );

      console.log("✅ API trả về:", allCheckings);
      console.log("🧩 Loại cần lọc:", type);
      console.log("🎯 Kết quả lọc:", filtered);

      setStaffCheckings(filtered.length > 0 ? filtered : []);
    } catch (err) {
      console.error("❌ Lỗi khi gọi API:", err);
    } finally {
      setLoadingStaffCheckings(false);
    }

  };


  // 🧾 Xuất PDF
  const generatePDF = async () => {
    const element = document.getElementById("pdf-content");
    if (!element) return;

    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Booking-${selectedBooking.bookingId}-${modalType}.pdf`);
  };

  const handleStatusChange = (index) =>
    setSelectedStatus(index === selectedStatus ? null : index);
  const handleCancelledClick = () =>
    setSelectedStatus(selectedStatus === 4 ? null : 4);

  const filteredBookings =
    selectedStatus === null
      ? bookings
      : bookings.filter(
        (b) => statusStepIndex[b.bookingStatus] === selectedStatus
      );





  return (
    <div style={{ margin: 24 }}>
      {/* Bộ lọc trạng thái */}
      <Card style={{ borderRadius: 12, marginBottom: 20 }}>
        <Space
          style={{
            justifyContent: "space-between",
            width: "100%",
            alignItems: "center",
          }}
        >
          <Steps
            onChange={handleStatusChange}
            current={selectedStatus ?? -1}
            responsive
          >
            <Step title="Đã đặt xe" />
            <Step title="Đã xác nhận" />
            <Step title="Đang sử dụng" />
            <Step title="Hoàn tất" />
          </Steps>

          <Button
            type={selectedStatus === 4 ? "primary" : "default"}
            danger
            onClick={handleCancelledClick}
          >
            Đã hủy
          </Button>
        </Space>
      </Card>

      {/* Modal hiển thị biên bản */}
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >

        <div id="pdf-content" style={{ background: "#fff", padding: 16 }}>
          {loadingStaffCheckings ? (
            <p>Đang tải biên bản...</p>
          ) : staffCheckings.length === 0 ? (
            <Card
              style={{
                border: "1px dashed #bbb",
                borderRadius: 12,
                textAlign: "center",
                padding: 32,
                color: "#666",
              }}
            >
              <Title level={5}>Chưa có biên bản cho loại này</Title>
              <p>Vui lòng chờ nhân viên cập nhật biên bản kiểm tra xe.</p>
            </Card>
          ) : (
            staffCheckings.map((checking) => (
              <StaffCheckingReport key={checking.checkingId} checking={checking} />
            ))
          )}
        </div>

        <div style={{ textAlign: "right", marginTop: 20 }}>
          <Space>
            <Button onClick={() => setIsModalVisible(false)}>Đóng</Button>

            <Button
              onClick={generatePDF}
              disabled={loadingStaffCheckings || staffCheckings.length === 0}
            >
              Xuất PDF
            </Button>

            <Button
              type="primary"
              onClick={() => setIsConfirmModalVisible(true)}
              disabled={
                loadingStaffCheckings ||
                staffCheckings.length === 0 ||
                selectedBooking?.bookingStatus === "Completed"
              }
            >
              Xác nhận
            </Button>
          </Space>
        </div>

      </Modal>

      {/* Modal con xác nhận */}
      <Modal
        title="Xác nhận Staff Checking"
        open={isConfirmModalVisible}
        onCancel={() => setIsConfirmModalVisible(false)}
        okText="Gửi"
        cancelText="Hủy"
        onOk={handleConfirmChecking}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label>
              <input
                type="radio"
                name="approved"
                checked={confirmApproved}
                onChange={() => setConfirmApproved(true)}
              />{" "}
              Đồng ý
            </label>
            <label style={{ marginLeft: 20 }}>
              <input
                type="radio"
                name="approved"
                checked={!confirmApproved}
                onChange={() => setConfirmApproved(false)}
              />{" "}
              Không đồng ý
            </label>
          </div>
          <div>
            <label>Ghi chú / bình luận:</label>
            <textarea
              style={{ width: "100%", minHeight: 80, marginTop: 4 }}
              value={confirmComment}
              onChange={(e) => setConfirmComment(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Danh sách booking */}
      {loading ? (
        <div style={{ textAlign: "center", marginTop: 80 }}>
          <Spin size="large" />
        </div>
      ) : filteredBookings.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Bạn chưa có lịch đặt nào cả"
          style={{ marginTop: 50 }}
        />
      ) : (
        filteredBookings.map((b) => (
          <Card
            key={b.bookingId}
            style={{
              borderRadius: 16,
              marginBottom: 20,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8} md={6}>
                <img
                  src={
                    b.imageUrl ||
                    "https://via.placeholder.com/250x150?text=No+Image"
                  }
                  alt={b.vehicleName}
                  style={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                    borderRadius: 12,
                  }}
                />
              </Col>

              <Col xs={24} sm={16} md={18}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong>Booking #{b.bookingId}</Text>
                    <Tag color={statusColor[b.bookingStatus]} style={{ marginLeft: 8 }}>
                      {b.bookingStatus}
                    </Tag>
                  </Col>
                  <Col>
                    <Text type="secondary">
                      Đặt vào {b.createdAt?.format("YYYY-MM-DD")}
                    </Text>
                  </Col>
                </Row>

                <div style={{ marginTop: 8 }}>
                  <Title level={4} style={{ marginBottom: 4 }}>
                    {b.vehicleName}
                  </Title>
                  <Text>
                    <CalendarOutlined /> {b.startTime?.format("YYYY-MM-DD")} →{" "}
                    {b.endTime?.format("YYYY-MM-DD")}
                  </Text>
                </div>

                {/* Nút hành động */}
                <div style={{ marginTop: 12, textAlign: "right" }}>
                  {b.bookingStatus === "Cancelled" && (
                    <Text type="secondary">Đơn hàng đã bị hủy</Text>
                  )}

                  {(b.bookingStatus === "Pending" ||
                    b.bookingStatus === "Confirmed") && (
                      <Space>
                        <Popconfirm
                          title="Xác nhận hủy đặt xe?"
                          okText="Có"
                          cancelText="Không"
                          onConfirm={() => handleCancelBooking(b.bookingId)}
                        >
                          <Button
                            danger
                            icon={<StopOutlined />}
                            loading={processingId === b.bookingId}
                          >
                            Hủy đặt xe
                          </Button>
                        </Popconfirm>

                        {b.bookingStatus === "Confirmed" && (
                          <Button
                            type="primary"
                            icon={<CarOutlined />}
                            onClick={() => openModal(b, "CheckOut")}
                          >
                            Nhận xe
                          </Button>
                        )}
                      </Space>
                    )}

                  {(b.bookingStatus === "InProgress" ||
                    b.bookingStatus === "Completed") && (
                      <Space>
                        <Button
                          type="primary"
                          icon={<CarOutlined />}
                          onClick={() => openModal(b, "CheckOut")}
                        >
                          Nhận xe
                        </Button>

                        <Button
                          type="dashed"
                          icon={<SwapOutlined />}
                          onClick={() => openModal(b, "CheckIn")}
                        >
                          Trả xe
                        </Button>
                      </Space>
                    )}

                  {b.bookingStatus === "Completed" && (
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">Đã hoàn tất, cảm ơn bạn!</Text>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        ))
      )}
    </div>
  );
};

export default BookingTracking;
