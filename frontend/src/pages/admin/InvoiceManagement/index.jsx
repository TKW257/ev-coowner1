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
import useCreateInvoice from "../../../hooks/useCreateInvoice";

const AdminInvoiceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openCreate, setOpenCreate] = useState(false);
  const [form] = Form.useForm();
  const { createInvoice, creating } = useCreateInvoice();
  const pdfRef = useRef();

  const handleView = (record) => {
    setSelectedInvoice(record);
    setOpen(true);
  };

  const handleCreateInvoice = async () => {
    try {
      const values = await form.validateFields();
      const res = await createInvoice(values);
      if (res) {
        message.success("Tạo hóa đơn thành công!");
        setOpenCreate(false);
        form.resetFields();
        const updated = await invoiceApi.getAllInvoices();
        setInvoices(updated);
      }
    } catch (err) {
      console.error("❌ Create failed:", err);
    }
  };

  const handleDownloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`Invoice_INV-${selectedInvoice.invoiceId}.pdf`);
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await invoiceApi.getAllInvoices();
        if (!Array.isArray(res)) throw new Error("Invalid data format");
        const formatted = res.map((inv) => ({
          invoiceId: inv.invoiceId,
          userId: inv.userId,
          userName: inv.fullName,
          email: inv.email,
          phone: inv.phone,
          vehicleId: inv.vehicleId,
          vehicleName: inv.model,
          plateNumber: inv.plateNumber,
          invoiceMonth: dayjs(
            new Date(inv.issuedDate[0], inv.issuedDate[1] - 1, inv.issuedDate[2])
          ).format("YYYY-MM"),
          totalAmount: inv.totalAmount,
          status: inv.status,
          issuedDate: new Date(...inv.issuedDate.slice(0, 6)),
          dueDate: new Date(...inv.dueDate.slice(0, 6)),
          note: inv.note || "Tổng hợp chi phí tháng này",
          details:
            inv.details?.map((d) => ({
              detailId: d.detailId,
              feeType: d.feeType,
              sourceType: d.sourceType,
              description: d.description,
              amount: d.amount,
            })) || [],
        }));
        setInvoices(formatted);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách hóa đơn.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const totalInvoices = invoices.length;
  const openInvoices = invoices.filter((i) => i.status === "OPEN").length;
  const paidInvoices = invoices.filter(
    (i) => i.status === "SETTLED" || i.status === "PAID"
  ).length;
  const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "invoiceId",
      render: (id) => `#INV-${id}`,
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
            onClick={() => setOpenCreate(true)}
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
          <Table columns={columns} dataSource={invoices} rowKey="invoiceId" pagination={{ pageSize: 6 }} />
        )}
      </Card>

      {/* === Modal tạo hóa đơn === */}
      <Modal
        title="Tạo hóa đơn mới"
        open={openCreate}
        onCancel={() => setOpenCreate(false)}
        onOk={handleCreateInvoice}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={creating}
      >
        <Form layout="vertical" form={form}>
          <Form.Item label="Mã người dùng" name="userId" rules={[{ required: true, message: "Nhập userId!" }]}>
            <Input placeholder="Nhập ID người dùng" />
          </Form.Item>
          <Form.Item label="Mã xe" name="vehicleId" rules={[{ required: true, message: "Nhập vehicleId!" }]}>
            <Input placeholder="Nhập ID xe" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={3} placeholder="Ghi chú (nếu có)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* === Modal xem chi tiết === */}
      <Modal
        open={open}
        title={`Hóa đơn #INV-${selectedInvoice?.invoiceId || ""}`}
        onCancel={() => setOpen(false)}
        width={850}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>
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
                #INV-{selectedInvoice.invoiceId}
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

            <h3 style={{ marginTop: 20 }}>Chi tiết phí</h3>
            <Table
              columns={detailColumns}
              dataSource={selectedInvoice.details}
              pagination={false}
              rowKey="detailId"
              size="small"
            />

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
