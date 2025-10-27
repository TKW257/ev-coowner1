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
  Input,
  Form,
  Descriptions,
  message,
  Spin,
  Empty,
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

const AdminInvoiceDashboard = () => {
  console.log("🏗️ [InvoiceManagement] Component initialized");
  
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const pdfRef = useRef();

  console.log("🏗️ [InvoiceManagement] State initialized:", {
    invoicesCount: invoices.length,
    selectedInvoice: selectedInvoice?.invoiceId,
    open,
    loading,
    openCreate,
    creating
  });

  const handleView = (record) => {
    console.log("👁️ [InvoiceManagement] handleView called with record:", record);
    setSelectedInvoice(record);
    setOpen(true);
    console.log("👁️ [InvoiceManagement] Modal opened for invoice:", record.invoiceId);
  };

  const handleCreateInvoice = async () => {
    console.log("🚀 [InvoiceManagement] handleCreateInvoice started");
    try {
      setCreating(true);
      console.log("📝 [InvoiceManagement] Getting form values...");
      const values = await form.validateFields();
      console.log("📝 [InvoiceManagement] Form values:", values);
      
      console.log("📤 [InvoiceManagement] Calling createAutoInvoiceByEmail with email:", values.email);
      const res = await invoiceApi.createAutoInvoiceByEmail(values.email);
      console.log("📥 [InvoiceManagement] createAutoInvoiceByEmail response:", res);
      
      if (res) {
        console.log("✅ [InvoiceManagement] Invoice created successfully");
        message.success("Tạo hóa đơn thành công!");
        setOpenCreate(false);
        form.resetFields();
        
        console.log("🔄 [InvoiceManagement] Refreshing suma invoice list...");
        // Refresh danh sách hóa đơn suma
        const updated = await invoiceApi.getAllSumaInvoices();
        console.log("📥 [InvoiceManagement] getAllSumaInvoices response:", updated);
        
        if (!Array.isArray(updated)) {
          console.error("❌ [InvoiceManagement] Invalid data format:", typeof updated, updated);
          throw new Error("Invalid data format");
        }
        
        console.log("🔄 [InvoiceManagement] Formatting suma invoice data...");
        const formatted = updated.map((sumaInv) => {
          console.log("📋 [InvoiceManagement] Processing suma invoice:", sumaInv);
          return {
            sumaInvoiceId: sumaInv.sumaInvoiceId,
            userName: sumaInv.userName,
            month: sumaInv.month,
            totalAmount: sumaInv.totalAmount,
            status: sumaInv.status,
            invoices: sumaInv.invoices || [],
            // Thêm các field để tương thích với UI hiện tại
            invoiceId: sumaInv.sumaInvoiceId, // Sử dụng sumaInvoiceId làm invoiceId
            invoiceMonth: sumaInv.month,
            // Lấy thông tin từ invoice đầu tiên nếu có
            email: sumaInv.invoices?.[0]?.email || '',
            phone: sumaInv.invoices?.[0]?.phone || '',
            vehicleName: sumaInv.invoices?.[0]?.vehicleName || '',
            plateNumber: sumaInv.invoices?.[0]?.plateNumber || '',
            issuedDate: sumaInv.invoices?.[0]?.issuedDate ? new Date(...sumaInv.invoices[0].issuedDate.slice(0, 6)) : new Date(),
            dueDate: sumaInv.invoices?.[0]?.dueDate ? new Date(...sumaInv.invoices[0].dueDate.slice(0, 6)) : new Date(),
            note: `Tổng hợp hóa đơn tháng ${sumaInv.month}`,
            details: sumaInv.invoices?.map((inv, invIndex) => ({
              detailId: inv.invoiceId || invIndex,
              feeType: 'Tổng hợp',
              sourceType: 'Suma Invoice',
              description: `Hóa đơn ${inv.invoiceId || invIndex + 1}`,
              amount: inv.totalAmount || 0,
            })) || [],
          };
        });
        
        console.log("📊 [InvoiceManagement] Formatted suma invoices:", formatted);
        setInvoices(formatted);
        console.log("✅ [InvoiceManagement] Suma invoice list updated successfully");
      }
    } catch (err) {
      console.error("❌ [InvoiceManagement] Create failed:", err);
      console.error("❌ [InvoiceManagement] Error details:", {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
        status: err.response?.status
      });
      message.error("Tạo hóa đơn thất bại!");
    } finally {
      setCreating(false);
      console.log("🏁 [InvoiceManagement] handleCreateInvoice finished");
    }
  };

  const handleDownloadPDF = async () => {
    console.log("📄 [InvoiceManagement] handleDownloadPDF started");
    console.log("📄 [InvoiceManagement] Selected invoice:", selectedInvoice);
    
    const element = pdfRef.current;
    if (!element) {
      console.error("❌ [InvoiceManagement] PDF element not found");
      return;
    }
    
    console.log("📄 [InvoiceManagement] Generating PDF...");
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    
    const fileName = `Invoice_SUMA-${selectedInvoice.sumaInvoiceId}.pdf`;
    console.log("📄 [InvoiceManagement] Saving PDF as:", fileName);
    pdf.save(fileName);
    console.log("✅ [InvoiceManagement] PDF downloaded successfully");
  };

  useEffect(() => {
    console.log("🔄 [InvoiceManagement] useEffect triggered - fetching suma invoices");
    const fetchInvoices = async () => {
      try {
        console.log("📤 [InvoiceManagement] Calling getAllSumaInvoices API...");
        setLoading(true);
        const res = await invoiceApi.getAllSumaInvoices();
        console.log("📥 [InvoiceManagement] getAllSumaInvoices raw response:", res);
        console.log("📥 [InvoiceManagement] Response type:", typeof res);
        console.log("📥 [InvoiceManagement] Is array:", Array.isArray(res));
        
        if (!Array.isArray(res)) {
          console.error("❌ [InvoiceManagement] Invalid data format:", res);
          throw new Error("Invalid data format");
        }
        
        console.log("🔄 [InvoiceManagement] Formatting suma invoice data...");
        const formatted = res.map((sumaInv, index) => {
          console.log(`📋 [InvoiceManagement] Processing suma invoice ${index + 1}:`, sumaInv);
          return {
            sumaInvoiceId: sumaInv.sumaInvoiceId,
            userName: sumaInv.userName,
            month: sumaInv.month,
            totalAmount: sumaInv.totalAmount,
            status: sumaInv.status,
            invoices: sumaInv.invoices || [],
            // Thêm các field để tương thích với UI hiện tại
            invoiceId: sumaInv.sumaInvoiceId, // Sử dụng sumaInvoiceId làm invoiceId
            invoiceMonth: sumaInv.month,
            // Lấy thông tin từ invoice đầu tiên nếu có
            email: sumaInv.invoices?.[0]?.email || '',
            phone: sumaInv.invoices?.[0]?.phone || '',
            vehicleName: sumaInv.invoices?.[0]?.vehicleName || '',
            plateNumber: sumaInv.invoices?.[0]?.plateNumber || '',
            issuedDate: sumaInv.invoices?.[0]?.issuedDate ? new Date(...sumaInv.invoices[0].issuedDate.slice(0, 6)) : new Date(),
            dueDate: sumaInv.invoices?.[0]?.dueDate ? new Date(...sumaInv.invoices[0].dueDate.slice(0, 6)) : new Date(),
            note: `Tổng hợp hóa đơn tháng ${sumaInv.month}`,
            details: sumaInv.invoices?.map((inv, invIndex) => ({
              detailId: inv.invoiceId || invIndex,
              feeType: 'Tổng hợp',
              sourceType: 'Suma Invoice',
              description: `Hóa đơn ${inv.invoiceId || invIndex + 1}`,
              amount: inv.totalAmount || 0,
            })) || [],
          };
        });
        
        console.log("📊 [InvoiceManagement] Formatted suma invoices:", formatted);
        console.log("📊 [InvoiceManagement] Total suma invoices:", formatted.length);
        setInvoices(formatted);
        console.log("✅ [InvoiceManagement] Suma invoices loaded successfully");
      } catch (err) {
        console.error("❌ [InvoiceManagement] Fetch suma invoices failed:", err);
        console.error("❌ [InvoiceManagement] Error details:", {
          message: err.message,
          stack: err.stack,
          response: err.response?.data,
          status: err.response?.status
        });
        message.error("Không thể tải danh sách hóa đơn.");
      } finally {
        setLoading(false);
        console.log("🏁 [InvoiceManagement] fetchSumaInvoices finished");
      }
    };

    fetchInvoices();
  }, []);

  // Component unmount logging
  useEffect(() => {
    return () => {
      console.log("🗑️ [InvoiceManagement] Component unmounting");
    };
  }, []);

  const totalInvoices = invoices.length;
  const openInvoices = invoices.filter((i) => i.status === "OPEN").length;
  const paidInvoices = invoices.filter(
    (i) => i.status === "SETTLED" || i.status === "PAID"
  ).length;
  const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  console.log("📊 [InvoiceManagement] Statistics calculated:", {
    totalInvoices,
    openInvoices,
    paidInvoices,
    totalAmount
  });

  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "sumaInvoiceId",
      render: (id) => `#SUMA-${id}`,
    },
    { title: "Người dùng", dataIndex: "userName" },
    { title: "Xe", dataIndex: "vehicleName" },
    { title: "Tháng", dataIndex: "invoiceMonth" },
    {
      title: "Tổng (₫)",
      dataIndex: "totalAmount",
      render: (val) =>
        val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (status, record) => {
        const isOverdue =
          status === "OPEN" && dayjs(record.dueDate).isBefore(dayjs());
        let color = "orange";
        if (status === "SETTLED" || status === "PAID") color = "green";
        else if (isOverdue) color = "red";
        return <Tag color={color}>{isOverdue ? "OVERDUE" : status}</Tag>;
      },
    },
    {
      title: "Phát hành",
      dataIndex: "issuedDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hạn TT",
      dataIndex: "dueDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleView(record)}>
          Xem
        </Button>
      ),
    },
  ];

  const detailColumns = [
    { title: "Loại phí", dataIndex: "feeType" },
    { title: "Nguồn", dataIndex: "sourceType" },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Số tiền (₫)",
      dataIndex: "amount",
      render: (val) =>
        val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* === Summary Cards === */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng HĐ" value={totalInvoices} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Đang mở" value={openInvoices} valueStyle={{ color: "#faad14" }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Đã TT" value={paidInvoices} valueStyle={{ color: "#3f8600" }} prefix={<CheckCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Tổng tiền" value={totalAmount.toLocaleString("vi-VN")} valueStyle={{ color: "#1677ff" }} prefix={<DollarOutlined />} />
          </Card>
        </Col>
      </Row>

      {/* === Table + Button === */}
      <Card>
        <Row justify="end" style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            loading={creating}
            onClick={() => {
              console.log("➕ [InvoiceManagement] Create invoice button clicked");
              setOpenCreate(true);
            }}
          >
            Tạo hóa đơn
          </Button>
        </Row>

        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải danh sách hóa đơn..." />
          </div>
        ) : invoices.length === 0 ? (
          <Empty description="Không có hóa đơn nào" style={{ padding: 50 }} />
        ) : (
          <Table columns={columns} dataSource={invoices} rowKey="sumaInvoiceId" pagination={{ pageSize: 6 }} />
        )}
      </Card>

      {/* === Modal tạo hóa đơn === */}
      <Modal
        title="Tạo hóa đơn mới"
        open={openCreate}
        onCancel={() => {
          console.log("❌ [InvoiceManagement] Create invoice modal cancelled");
          setOpenCreate(false);
        }}
        onOk={handleCreateInvoice}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={creating}
      >
        <Form layout="vertical" form={form}>
          <Form.Item 
            label="Email người dùng" 
            name="email" 
            rules={[
              { required: true, message: "Nhập email người dùng!" },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email người dùng" />
          </Form.Item>
        </Form>
      </Modal>

      {/* === Modal xem chi tiết === */}
      <Modal
        open={open}
        title={`Hóa đơn #SUMA-${selectedInvoice?.sumaInvoiceId || ""}`}
        onCancel={() => {
          console.log("❌ [InvoiceManagement] View invoice modal closed");
          setOpen(false);
        }}
        width={850}
        footer={[
          <Button key="close" onClick={() => {
            console.log("❌ [InvoiceManagement] Close button clicked");
            setOpen(false);
          }}>
            Đóng
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
          >
            Tải PDF
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <div ref={pdfRef} style={{ padding: 10, background: "white" }}>
            {/* Người dùng */}
            <Descriptions bordered column={1} size="small" title="Người dùng">
              <Descriptions.Item label="Tên">
                {selectedInvoice.userName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedInvoice.email}
              </Descriptions.Item>
              <Descriptions.Item label="SĐT">
                {selectedInvoice.phone}
              </Descriptions.Item>
            </Descriptions>

            {/* Xe */}
            <Descriptions
              bordered
              column={1}
              size="small"
              title="Thông tin xe"
              style={{ marginTop: 16 }}
            >
              <Descriptions.Item label="Tên xe">
                {selectedInvoice.vehicleName}
              </Descriptions.Item>
              <Descriptions.Item label="Biển số">
                {selectedInvoice.plateNumber}
              </Descriptions.Item>
            </Descriptions>

            {/* Hóa đơn */}
            <Descriptions
              bordered
              column={1}
              size="small"
              title="Chi tiết hóa đơn"
              style={{ marginTop: 16 }}
            >
              <Descriptions.Item label="Mã HĐ">
                #SUMA-{selectedInvoice.sumaInvoiceId}
              </Descriptions.Item>
              <Descriptions.Item label="Tháng">
                {selectedInvoice.invoiceMonth}
              </Descriptions.Item>
              <Descriptions.Item label="Phát hành">
                {dayjs(selectedInvoice.issuedDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn TT">
                {dayjs(selectedInvoice.dueDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag
                  color={
                    selectedInvoice.status === "OPEN" ? "orange" : "green"
                  }
                >
                  {selectedInvoice.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selectedInvoice.note}
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: 20 }}>Chi tiết hóa đơn ({selectedInvoice.invoices?.length || 0} hóa đơn)</h3>
            <Table
              columns={detailColumns}
              dataSource={selectedInvoice.details}
              pagination={false}
              rowKey="detailId"
              size="small"
            />
            
            {selectedInvoice.invoices && selectedInvoice.invoices.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h4>Danh sách hóa đơn chi tiết:</h4>
                <Table
                  columns={[
                    { title: "Mã HĐ", dataIndex: "invoiceId", render: (id) => `#INV-${id}` },
                    { title: "Xe", dataIndex: "vehicleName" },
                    { title: "Biển số", dataIndex: "plateNumber" },
                    { 
                      title: "Số tiền", 
                      dataIndex: "totalAmount",
                      render: (val) => val.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
                    },
                    { title: "Trạng thái", dataIndex: "status" },
                  ]}
                  dataSource={selectedInvoice.invoices}
                  pagination={false}
                  rowKey="invoiceId"
                  size="small"
                />
              </div>
            )}

            <h4 style={{ marginTop: 20, textAlign: "right" }}>
              <strong>
                Tổng cộng:{" "}
                {selectedInvoice.totalAmount.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </strong>
            </h4>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminInvoiceDashboard;
