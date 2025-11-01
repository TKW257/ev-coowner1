import React, { useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  Modal,
  Descriptions,
  message,
  Spin,
  Empty,
  Checkbox,
  Space
} from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import invoiceApi from "../../../api/invoiceApi";
import userApi from "../../../api/userApi";

const AdminInvoiceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const pdfRef = useRef();

  // === Bulk Create ===
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [openBulkCreate, setOpenBulkCreate] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  const roleOptions = [
    { value: "USER", label: "User" },
    { value: "STAFF", label: "Staff" },
    { value: "ADMIN", label: "Admin" },
  ];

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN": return "red";
      case "STAFF": return "blue";
      case "USER": return "green";
      default: return "default";
    }
  };

  // === Fetch users ===
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await userApi.getAll();
      const usersData = Array.isArray(response) ? response : [];
      setUsers(usersData);
    } catch (error) {
      message.error("Không thể tải danh sách người dùng!");
      console.error("❌ [InvoiceDashboard] Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // === Fetch invoices ===
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await invoiceApi.getAllSumaInvoices();
        if (Array.isArray(res)) {
          const formatted = res.map((sumaInv) => ({
            sumaInvoiceId: sumaInv.sumaInvoiceId,
            userName: sumaInv.userName,
            month: sumaInv.month,
            totalAmount: sumaInv.totalAmount,
            status: sumaInv.status,
            invoices: sumaInv.invoices || [],
            invoiceId: sumaInv.sumaInvoiceId,
            invoiceMonth: sumaInv.month,
            email: sumaInv.invoices?.[0]?.email || "",
            phone: sumaInv.invoices?.[0]?.phone || "",
            vehicleName: sumaInv.invoices?.[0]?.vehicleName || "",
            plateNumber: sumaInv.invoices?.[0]?.plateNumber || "",
            issuedDate: sumaInv.invoices?.[0]?.issuedDate
              ? new Date(...sumaInv.invoices[0].issuedDate.slice(0, 6))
              : new Date(),
            dueDate: sumaInv.invoices?.[0]?.dueDate
              ? new Date(...sumaInv.invoices[0].dueDate.slice(0, 6))
              : new Date(),
            note: `Tổng hợp hóa đơn tháng ${sumaInv.month}`,
            details:
              sumaInv.invoices?.map((inv, invIndex) => ({
                detailId: inv.invoiceId || invIndex,
                feeType: "Tổng hợp",
                sourceType: "Suma Invoice",
                description: `Hóa đơn ${inv.invoiceId || invIndex + 1}`,
                amount: inv.totalAmount || 0,
              })) || [],
          }));
          setInvoices(formatted);
        }
      } catch (err) {
        console.error("❌ [InvoiceManagement] Fetch suma invoices failed:", err);
        message.error("Không thể tải danh sách hóa đơn.");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const handleView = (record) => setSelectedInvoice(record);

  const handleDownloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`Invoice_SUMA-${selectedInvoice.sumaInvoiceId}.pdf`);
  };

  // === Bulk invoice logic ===
  const handleUserSelection = (userId, checked) => {
    if (checked) setSelectedUserIds((prev) => [...prev, userId]);
    else setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleBulkCreateInvoice = async () => {
    if (selectedUserIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất một người dùng!");
      return;
    }

    try {
      setCreating(true);
      const promises = selectedUserIds.map((userId) => {
        const user = users.find((u) => u.id === userId);
        return invoiceApi.createAutoInvoiceByEmail(user.email);
      });

      await Promise.all(promises);
      message.success(`Tạo hóa đơn thành công cho ${selectedUserIds.length} người dùng!`);
      setOpenBulkCreate(false);
      setSelectedUserIds([]);

      // refresh invoices
      const updated = await invoiceApi.getAllSumaInvoices();
      if (Array.isArray(updated)) {
        const formatted = updated.map((sumaInv) => ({
          sumaInvoiceId: sumaInv.sumaInvoiceId,
          userName: sumaInv.userName,
          month: sumaInv.month,
          totalAmount: sumaInv.totalAmount,
          status: sumaInv.status,
          invoices: sumaInv.invoices || [],
          invoiceId: sumaInv.sumaInvoiceId,
          invoiceMonth: sumaInv.month,
          email: sumaInv.invoices?.[0]?.email || "",
          phone: sumaInv.invoices?.[0]?.phone || "",
          vehicleName: sumaInv.invoices?.[0]?.vehicleName || "",
          plateNumber: sumaInv.invoices?.[0]?.plateNumber || "",
          issuedDate: sumaInv.invoices?.[0]?.issuedDate
            ? new Date(...sumaInv.invoices[0].issuedDate.slice(0, 6))
            : new Date(),
          dueDate: sumaInv.invoices?.[0]?.dueDate
            ? new Date(...sumaInv.invoices[0].dueDate.slice(0, 6))
            : new Date(),
          note: `Tổng hợp hóa đơn tháng ${sumaInv.month}`,
          details:
            sumaInv.invoices?.map((inv, invIndex) => ({
              detailId: inv.invoiceId || invIndex,
              feeType: "Tổng hợp",
              sourceType: "Suma Invoice",
              description: `Hóa đơn ${inv.invoiceId || invIndex + 1}`,
              amount: inv.totalAmount || 0,
            })) || [],
        }));
        setInvoices(formatted);
      }
    } catch (error) {
      console.error("❌ [InvoiceDashboard] Bulk invoice creation failed:", error);
      message.error("Tạo hóa đơn hàng loạt thất bại!");
    } finally {
      setCreating(false);
    }
  };

  // === Table columns ===
  const columns = [
    { title: "Mã HĐ", dataIndex: "sumaInvoiceId", render: (id) => `#SUMA-${id}` },
    { title: "Người dùng", dataIndex: "userName" },
    { title: "Xe", dataIndex: "vehicleName" },
    { title: "Tháng", dataIndex: "invoiceMonth" },
    {
      title: "Tổng (₫)",
      dataIndex: "totalAmount",
      render: (val) => val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status, record) => {
        const isOverdue = status === "OPEN" && dayjs(record.dueDate).isBefore(dayjs());
        let color = "orange";
        if (status === "SETTLED" || status === "PAID") color = "green";
        else if (isOverdue) color = "red";
        return <Tag color={color}>{isOverdue ? "OVERDUE" : status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => { setSelectedInvoice(record); setOpen(true); }}>
          Xem
        </Button>
      ),
    },
  ];

  const totalInvoices = invoices.length;
  const openInvoices = invoices.filter((i) => i.status === "OPEN").length;
  const paidInvoices = invoices.filter(
    (i) => i.status === "SETTLED" || i.status === "PAID"
  ).length;
  const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Tổng HĐ" value={totalInvoices} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Đang mở" value={openInvoices} valueStyle={{ color: "#faad14" }} prefix={<ClockCircleOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Đã TT" value={paidInvoices} valueStyle={{ color: "#3f8600" }} prefix={<CheckCircleOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Tổng tiền" value={totalAmount.toLocaleString("vi-VN")} valueStyle={{ color: "#1677ff" }} prefix={<DollarOutlined />} /></Card>
        </Col>
      </Row>

      <Card>
        <Row justify="end" style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={creating}
            onClick={() => setOpenBulkCreate(true)}
          >
            Tạo hóa đơn
          </Button>
        </Row>

        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải danh sách hóa đơn..." />
          </div>
        ) : invoices.length === 0 ? (
          <Empty description="Không có hóa đơn nào" />
        ) : (
          <Table columns={columns} dataSource={invoices} rowKey="sumaInvoiceId" pagination={{ pageSize: 6 }} />
        )}
      </Card>

      {/* === Modal xem chi tiết === */}
      <Modal
        open={open}
        title={`Hóa đơn #SUMA-${selectedInvoice?.sumaInvoiceId || ""}`}
        onCancel={() => setOpen(false)}
        width={850}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>Đóng</Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPDF}>Tải PDF</Button>,
        ]}
      >
        {selectedInvoice && (
          <div ref={pdfRef} style={{ padding: 10, background: "white" }}>
            <Descriptions bordered column={1} size="small" title="Người dùng">
              <Descriptions.Item label="Tên">{selectedInvoice.userName}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedInvoice.email}</Descriptions.Item>
              <Descriptions.Item label="SĐT">{selectedInvoice.phone}</Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={1} size="small" title="Thông tin xe" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Tên xe">{selectedInvoice.vehicleName}</Descriptions.Item>
              <Descriptions.Item label="Biển số">{selectedInvoice.plateNumber}</Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={1} size="small" title="Chi tiết hóa đơn" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Tháng">{selectedInvoice.invoiceMonth}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái"><Tag>{selectedInvoice.status}</Tag></Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      {/* === Modal tạo hóa đơn hàng loạt === */}
      <Modal
        title="Tạo hóa đơn hàng loạt"
        open={openBulkCreate}
        onCancel={() => { setOpenBulkCreate(false); setSelectedUserIds([]); }}
        onOk={handleBulkCreateInvoice}
        okText="Tạo hóa đơn"
        cancelText="Hủy"
        confirmLoading={creating}
        width={800}
      >
        {loadingUsers ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin tip="Đang tải danh sách người dùng..." />
          </div>
        ) : users.length === 0 ? (
          <Empty description="Không có người dùng nào" />
        ) : (
          <>
            <p><strong>Chọn người dùng để tạo hóa đơn:</strong></p>
            <p style={{ color: "#666" }}>Đã chọn {selectedUserIds.length} người dùng</p>
            <div style={{ maxHeight: 400, overflowY: "auto", border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
              {users.map((user) => (
                <div key={user.id} style={{ display: "flex", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <Checkbox
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                    style={{ marginRight: 12 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{user.fullName || user.full_name}</div>
                    <div style={{ color: "#666", fontSize: 12 }}>{user.email} | {user.phone}</div>
                  </div>
                  <Tag color={getRoleColor(user.role)}>
                    {roleOptions.find((r) => r.value === user.role)?.label || user.role}
                  </Tag>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Button onClick={() => setSelectedUserIds(users.map((u) => u.id))} style={{ marginRight: 8 }}>
                Chọn tất cả
              </Button>
              <Button onClick={() => setSelectedUserIds([])}>Bỏ chọn tất cả</Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminInvoiceDashboard;