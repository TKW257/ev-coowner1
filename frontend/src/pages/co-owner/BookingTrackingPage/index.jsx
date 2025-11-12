import React, { useState, useEffect, useCallback } from "react";
import { Steps, Card, Row, Col, Tag, Typography, Button, Space, Spin, Empty, Popconfirm, Modal } from "antd";
import { CalendarOutlined, StopOutlined, SwapOutlined } from "@ant-design/icons";
import bookingApi from "../../../api/bookingApi";
import StaffCheckingReport from "../../../components/StaffCheckingReport";
import { App } from "antd";
import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import "./style.scss";

const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

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
  const { message, notification } = App.useApp();
  const sigCanvas = useRef();

  const statusStepIndex = {
    Pending: 0,
    Confirmed: 1,
    InProgress: 2,
    Completed: 3,
    Cancelled: 4,
  };

  const statusColor = {
    Pending: "orange",
    Confirmed: "#1890ff",
    InProgress: "#1890ff",
    Completed: "#52c41a",
    Cancelled: "red",
  };

  const getCarImageUrl = (imagePath) => {
    if (!imagePath) return ""; // fallback
    return `${baseURL}/${imagePath.replaceAll("\\", "/")}`;
  };

  const convertDateArray = (arr) => {
    if (!Array.isArray(arr)) return arr;
    return dayjs(
      new Date(arr[0], arr[1] - 1, arr[2], arr[3] || 0, arr[4] || 0, arr[5] || 0)
    );
  };

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
      console.log("Lịch status:", res);
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

  const handleCancelBooking = async (bookingId) => {
    try {
      setProcessingId(bookingId);
      await bookingApi.cancelBooking(bookingId);
      message.success("✅ Hủy đặt xe thành công!");
      fetchBookings();
    } catch (error) {
      console.error(error);
      message.error("❌ Hủy thất bại, thử lại sau!");
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmChecking = async () => {
    if (!staffCheckings || staffCheckings.length === 0) return;

    const checking = staffCheckings[0];
    const checkingId = checking.checkingId || checking.id || checking.staffCheckingId;
    if (!checkingId) return;

    // Hàm chuyển base64 sang Blob
    const dataURLtoBlob = (dataurl) => {
      const arr = dataurl.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new Blob([u8arr], { type: mime });
    };

    try {
      const formData = new FormData();
      formData.append("approved", confirmApproved);
      formData.append("userComment", confirmComment);


      // Kiểm tra canvas có chữ ký hay không
      if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
        notification.warning({
          message: "Chưa ký xác nhận",
          description: "Vui lòng ký trước khi gửi xác nhận.",
        });
        return;
      }

      // Lấy chữ ký từ canvas và append vào FormData
      const dataUrl = sigCanvas.current.toDataURL("image/png");
      const blob = dataURLtoBlob(dataUrl);
      formData.append("userSignature", blob, "signature.png");

      // Gửi lên backend
      await bookingApi.confirmStaffChecking(checkingId, formData);

      notification.success({
        message: "Xác nhận biên bản thành công",
        description: confirmApproved
          ? "Bạn đã đồng ý biên bản kiểm tra xe."
          : "Bạn đã từ chối và gửi phản hồi.",
      });

      // Reset modal
      setIsConfirmModalVisible(false);
      setIsModalVisible(false);
      setConfirmComment("");
      fetchBookings();

    } catch (err) {
      notification.error({
        message: "Lỗi xác nhận",
        description: "Vui lòng thử lại sau.",
      });
      console.error(err);
    }
  };


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
      const filtered = allCheckings.filter(
        (c) => c.checkingType?.toLowerCase() === type?.toLowerCase()
      );
      console.log("staff:", res);
      setStaffCheckings(filtered.length > 0 ? filtered : []);
    } catch (err) {
      console.error("❌ Lỗi khi gọi API:", err);
    } finally {
      setLoadingStaffCheckings(false);
    }
  };

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
    <div className="booking-tracking-container">
      {/* Bộ lọc */}
      <Card className="booking-filter-card">
        <Space className="booking-filter-space">
          <Steps
            className="booking-steps"
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

      {/* Modal biên bản */}
      <Modal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
        className="checking-modal"
      >
        <div id="pdf-content" className="checking-content">
          {loadingStaffCheckings ? (
            <p>Đang tải biên bản...</p>
          ) : staffCheckings.length === 0 ? (
            <Card className="empty-report-card">
              <Title level={5}>Chưa có biên bản cho loại này</Title>
              <p>Vui lòng chờ nhân viên cập nhật biên bản kiểm tra xe.</p>
            </Card>
          ) : (
            staffCheckings.map((checking) => (
              <StaffCheckingReport key={checking.checkingId} checking={checking} />
            ))
          )}
        </div>

        <div className="modal-footer">
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

      {/* Modal xác nhận */}
      <Modal
        title="Xác nhận biên bản này"
        open={isConfirmModalVisible}
        onCancel={() => setIsConfirmModalVisible(false)}
        okText="Gửi"
        cancelText="Hủy"
        onOk={handleConfirmChecking}
      >
        <div className="confirm-modal-content">
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
              className="confirm-textarea"
              value={confirmComment}
              onChange={(e) => setConfirmComment(e.target.value)}
            />
          </div>

          {/* ✍️ Khu vực ký */}
          <div style={{ marginTop: 15 }}>
            <label>Chữ ký xác nhận:</label>
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              backgroundColor="#f5f5f5"
              canvasProps={{
                width: 400,
                height: 200,
                className: "border rounded",
              }}
            />
            <Button onClick={() => sigCanvas.current.clear()} style={{ marginTop: 8 }}>
              Xóa chữ ký
            </Button>
          </div>
        </div>
      </Modal>


      {/* Danh sách booking */}
      {loading ? (
        <div className="loading-state">
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
          <Card key={b.bookingId} className="booking-card">
            <Row gutter={16} align="middle">
              <Col xs={24} sm={8} md={6}>
                <img src={getCarImageUrl(b.imageUrl)} alt={b.vehicleName} className="booking-card-image"/>
              </Col>

              <Col xs={24} sm={16} md={18}>
                <Row justify="space-between" align="middle">
                  <Col>
                    <Text strong>Booking #{b.bookingId}</Text>
                    <Tag
                      color={statusColor[b.bookingStatus]}
                      className="booking-status-tag"
                    >
                      {b.bookingStatus}
                    </Tag>
                  </Col>
                  <Col>
                    <Text type="secondary">
                      Đặt vào {b.createdAt?.format("DD-MM-YYYY (HH:mm)")}
                    </Text>
                  </Col>
                </Row>

                <div className="booking-info">
                  <Title level={4}>{b.vehicleName}</Title>
                  <Text>
                    <CalendarOutlined />{" "}
                    {b.startTime?.format("DD-MM-YYYY (HH:mm)")} →{" "}
                    {b.endTime?.format("DD-MM-YYYY (HH:mm)")}
                  </Text>
                </div>


                <div className="booking-actions">
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
                            onClick={() => openModal(b, "CheckOut")}
                          >
                            Nhận xe
                          </Button>
                        )}
                      </Space>
                    )}

                  {(b.bookingStatus === "InProgress") && (
                    <Space>
                      <Button
                        type="dashed"
                        className="return-btn"
                        icon={<SwapOutlined />}
                        onClick={() => openModal(b, "CheckIn")}
                      >
                        Trả xe
                      </Button>
                    </Space>
                  )}

                  {(b.bookingStatus === "Completed") && (
                    <Space>
                      <Button
                        type="primary"
                        onClick={() => openModal(b, "CheckOut")}
                      >
                        Biên Bản Nhận Xe
                      </Button>
                      <Button
                        type="dashed"
                        className="return-btn"
                        icon={<SwapOutlined />}
                        onClick={() => openModal(b, "CheckIn")}
                      >
                        Biên Bản Trả Xe
                      </Button>
                    </Space>
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