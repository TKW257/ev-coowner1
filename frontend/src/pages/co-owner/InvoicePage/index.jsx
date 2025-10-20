import React, { useEffect, useState, useRef } from "react";
import { Row, Col, Card, Statistic, Table, Tag, Button, Modal, Descriptions, message, Spin, Empty } from "antd";
import { DollarOutlined, FileTextOutlined, CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import invoiceApi from "../../../api/invoiceApi";

const UserInvoiceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const pdfRef = useRef();


  const handleView = (record) => {
    setSelectedInvoice(record);
    setOpen(true);
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
        const res = await invoiceApi.getMyInvoices();

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
            new Date(
              inv.issuedDate[0],
              inv.issuedDate[1] - 1, // tháng trong JS bắt đầu từ 0
              inv.issuedDate[2]
            )
          ).format("YYYY-MM"),
          totalAmount: inv.totalAmount,
          status: inv.status,
          issuedDate: new Date(...inv.issuedDate.slice(0, 6)),
          dueDate: new Date(...inv.dueDate.slice(0, 6)),
          note: "Tổng hợp chi phí tháng này",
          details: inv.details.map((d) => ({
            detailId: d.detailId,
            feeType: d.feeType,
            sourceType: d.sourceType,
            description: d.description,
            amount: d.amount,
          })),
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

  // === Stats ===
  const totalInvoices = invoices.length;
  const openInvoices = invoices.filter((i) => i.status === "OPEN").length;
  const paidInvoices = invoices.filter(
    (i) => i.status === "SETTLED" || i.status === "PAID"
  ).length;
  const totalSpent = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  // === Columns ===
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

  return (
    <div style={{ padding: 24 }}>
      {/* === Summary === */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Invoices" value={totalInvoices} prefix={<FileTextOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Open" value={openInvoices} valueStyle={{ color: "#faad14" }} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Paid" value={paidInvoices} valueStyle={{ color: "#3f8600" }} prefix={<CheckCircleOutlined />} />
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
        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải hóa đơn..." />
          </div>
        ) : invoices.length === 0 ? (
          <Empty description="Không có hóa đơn nào" style={{ padding: 50 }} />
        ) : (
          <Table
            columns={columns}
            dataSource={invoices}
            rowKey="invoiceId"
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>

      {/* === Modal === */}
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
              <Descriptions.Item label="Họ tên">{selectedInvoice.userName}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedInvoice.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedInvoice.phone}</Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={1} size="small" title="Thông tin xe" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Tên xe">{selectedInvoice.vehicleName}</Descriptions.Item>
              <Descriptions.Item label="Biển số">{selectedInvoice.plateNumber}</Descriptions.Item>
            </Descriptions>

            <Descriptions bordered column={1} size="small" title="Thông tin hóa đơn" style={{ marginTop: 16 }}>
              <Descriptions.Item label="Mã hóa đơn">#INV-{selectedInvoice.invoiceId}</Descriptions.Item>
              <Descriptions.Item label="Tháng">{selectedInvoice.invoiceMonth}</Descriptions.Item>
              <Descriptions.Item label="Ngày phát hành">{dayjs(selectedInvoice.issuedDate).format("DD/MM/YYYY")}</Descriptions.Item>
              <Descriptions.Item label="Hạn thanh toán">{dayjs(selectedInvoice.dueDate).format("DD/MM/YYYY")}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedInvoice.status === "OPEN" ? "orange" : "green"}>{selectedInvoice.status}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">{selectedInvoice.note}</Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: 20 }}>Chi tiết phí</h3>
            <Table columns={detailColumns} dataSource={selectedInvoice.details} pagination={false} rowKey="detailId" size="small" />

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
