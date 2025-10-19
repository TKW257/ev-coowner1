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
} from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// === MOCK DATA ===
const mockInvoices = [
  {
    invoiceId: 101,
    userId: 1,
    userName: "Nguyễn Văn A",
    email: "nguyenvana@gmail.com",
    phone: "0909888777",
    vehicleId: 1,
    vehicleName: "VinFast VF8",
    plateNumber: "51H-999.99",
    invoiceMonth: "2025-10",
    totalAmount: 6100000,
    status: "OPEN",
    issuedDate: "2025-10-19T00:00:00",
    dueDate: "2025-10-26T00:00:00",
    note: "Invoice for October ownership costs",
    details: [
      {
        detailId: 1,
        feeType: "Maintenance",
        sourceType: "Fixed",
        description: "Phí bảo dưỡng định kỳ tháng 10",
        amount: 2500000,
      },
      {
        detailId: 2,
        feeType: "Charging",
        sourceType: "Variable",
        description: "Phí sạc điện (160 kWh)",
        amount: 1600000,
      },
      {
        detailId: 3,
        feeType: "Insurance",
        sourceType: "Fixed",
        description: "Phí bảo hiểm tháng 10",
        amount: 2000000,
      },
    ],
  },
];

const UserInvoiceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [open, setOpen] = useState(false);
  const pdfRef = useRef(); // ✅ Dùng để chụp nội dung modal

  useEffect(() => {
    setInvoices(mockInvoices);
  }, []);

  // === Stats ===
  const totalInvoices = invoices.length;
  const openInvoices = invoices.filter((i) => i.status === "OPEN").length;
  const paidInvoices = invoices.filter(
    (i) => i.status === "SETTLED" || i.status === "PAID"
  ).length;
  const totalSpent = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  // === Table Columns ===
  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "invoiceId",
      key: "invoiceId",
      render: (id) => `#INV-${id}`,
    },
    {
      title: "Month",
      dataIndex: "invoiceMonth",
      key: "invoiceMonth",
    },
    {
      title: "Total (₫)",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (val) =>
        val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
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
      title: "Issued",
      dataIndex: "issuedDate",
      key: "issuedDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Due",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => handleView(record)}>
          View
        </Button>
      ),
    },
  ];

  const detailColumns = [
    { title: "Fee Type", dataIndex: "feeType", key: "feeType" },
    { title: "Source", dataIndex: "sourceType", key: "sourceType" },
    { title: "Description", dataIndex: "description", key: "description" },
    {
      title: "Amount (₫)",
      dataIndex: "amount",
      key: "amount",
      render: (val) =>
        val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
  ];

  const handleView = (record) => {
    setSelectedInvoice(record);
    setOpen(true);
  };

  // === ✅ Hàm tải PDF ===
  const handleDownloadPDF = async () => {
    const element = pdfRef.current;
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let position = 10;
    pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);

    // Lưu tên file có mã hóa đơn
    pdf.save(`Invoice_INV-${selectedInvoice.invoiceId}.pdf`);
  };

  return (
    <div style={{ padding: 24 }}>
      {/* === Summary === */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Invoices"
              value={totalInvoices}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Open"
              value={openInvoices}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Paid"
              value={paidInvoices}
              valueStyle={{ color: "#3f8600" }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Amount"
              value={totalSpent.toLocaleString("vi-VN")}
              valueStyle={{ color: "#1677ff" }}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* === Table === */}
      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          rowKey="invoiceId"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      {/* === Modal chi tiết === */}
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
            <Descriptions bordered column={1} size="small" title="Thông tin người dùng">
              <Descriptions.Item label="Họ tên">
                {selectedInvoice.userName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {selectedInvoice.email}
              </Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">
                {selectedInvoice.phone}
              </Descriptions.Item>
            </Descriptions>

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

            <Descriptions
              bordered
              column={1}
              size="small"
              title="Thông tin hóa đơn"
              style={{ marginTop: 16 }}
            >
              <Descriptions.Item label="Mã hóa đơn">
                #INV-{selectedInvoice.invoiceId}
              </Descriptions.Item>
              <Descriptions.Item label="Tháng">
                {selectedInvoice.invoiceMonth}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày phát hành">
                {dayjs(selectedInvoice.issuedDate).format("DD/MM/YYYY")}
              </Descriptions.Item>
              <Descriptions.Item label="Hạn thanh toán">
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

export default UserInvoiceDashboard;
