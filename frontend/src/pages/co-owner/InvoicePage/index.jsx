import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Descriptions,
  message,
  Spin,
  Empty,
  Row,
  Col,
} from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ClockCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import invoiceApi from "../../../api/invoiceApi";

const UserInvoiceDashboard = () => {
  const [monthlyData, setMonthlyData] = useState([]); 
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const pdfRef = useRef();

  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`Invoice_Report_${selectedMonth.month}.pdf`);
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await invoiceApi.getMyInvoices();

        if (!res || !Array.isArray(res.invoices)) {
          throw new Error("Invalid data format");
        }

        // ✅ Gom nhóm theo tháng
        const grouped = {};
        const monthKey = res.month || dayjs().format("YYYY-MM");
        if (!grouped[monthKey]) {
          grouped[monthKey] = {
            month: monthKey,
            totalAmount: 0,
            count: 0,
            userName: res.userName,
            invoices: [],
          };
        }
        grouped[monthKey].invoices = res.invoices;
        grouped[monthKey].totalAmount = res.totalAmount;
        grouped[monthKey].count = res.invoices.length;

        setMonthlyData(Object.values(grouped));
      } catch (err) {
        console.error(err);
        message.error("Không thể tải dữ liệu hóa đơn.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" tip="Đang tải dữ liệu..." />
      </div>
    );

  if (!monthlyData.length)
    return <Empty description="Không có dữ liệu hóa đơn" style={{ padding: 50 }} />;

  // ==== Bảng tổng hợp theo tháng ====
  const monthColumns = [
    { title: "Tháng", dataIndex: "month", key: "month" },
    {
      title: "Số hóa đơn",
      dataIndex: "count",
      key: "count",
      render: (v) => `${v} hóa đơn`,
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (v) =>
        v.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => openMonthDetail(record)}>
          Xem chi tiết
        </Button>
      ),
    },
  ];

  const openMonthDetail = (record) => {
    setSelectedMonth(record);
    setOpen(true);
  };

  // ==== Cột bảng hóa đơn con ====
  const invoiceColumns = [
    {
      title: "Mã HĐ",
      dataIndex: "invoiceId",
      render: (id) => `#${id}`,
    },
    { title: "Xe", dataIndex: "model" },
    { title: "Biển số", dataIndex: "plateNumber" },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (v) => v.toLocaleString("vi-VN"),
    },
    {
      title: "Ngày lập",
      dataIndex: "issuedDate",
      render: (d) =>
        dayjs(new Date(...d.slice(0, 6))).format("DD/MM/YYYY"),
    },
    {
      title: "Hạn TT",
      dataIndex: "dueDate",
      render: (d) =>
        dayjs(new Date(...d.slice(0, 6))).format("DD/MM/YYYY"),
    },
  ];

  // ==== Cột bảng chi tiết gộp ====
  const detailColumns = [
    { title: "STT", dataIndex: "stt", key: "stt", width: 60 },
    { title: "Xe", dataIndex: "vehicle", key: "vehicle" },
    { title: "Biển số", dataIndex: "plateNumber", key: "plateNumber" },
    { title: "Loại phí", dataIndex: "feeType", key: "feeType" },
    { title: "Mô tả", dataIndex: "description", key: "description" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      render: (v) =>
        v.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        }),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="📅 Báo cáo hóa đơn theo tháng">
            <Table
              columns={monthColumns}
              dataSource={monthlyData}
              rowKey="month"
              pagination={false}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal chi tiết */}
      <Modal
        open={open}
        title={`Chi tiết hóa đơn tháng ${selectedMonth?.month}`}
        onCancel={() => setOpen(false)}
        width={900}
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
        {selectedMonth && (
          <div ref={pdfRef} style={{ padding: 10, background: "#fff" }}>
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label={<UserOutlined />}>
                <b>{selectedMonth.userName}</b>
              </Descriptions.Item>
              <Descriptions.Item label="Tháng">
                {selectedMonth.month}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tháng">
                {selectedMonth.totalAmount.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </Descriptions.Item>
            </Descriptions>

            <h3 style={{ marginTop: 20 }}>📄 Các hóa đơn con</h3>
            <Table
              columns={invoiceColumns}
              dataSource={selectedMonth.invoices}
              pagination={false}
              size="small"
              rowKey="invoiceId"
            />

            <h3 style={{ marginTop: 30 }}>💡 Chi tiết gộp tất cả hóa đơn</h3>
            <Table
              columns={detailColumns}
              dataSource={selectedMonth.invoices.flatMap((inv) =>
                inv.details.map((d, i) => ({
                  key: `${inv.invoiceId}-${i}`,
                  stt: i + 1,
                  vehicle: inv.model,
                  plateNumber: inv.plateNumber,
                  feeType: d.feeType,
                  description: d.description,
                  amount: d.amount,
                }))
              )}
              pagination={false}
              size="small"
              bordered
            />

            <h4 style={{ marginTop: 20, textAlign: "right" }}>
              <strong>
                Tổng cộng tháng {selectedMonth.month}:{" "}
                {selectedMonth.totalAmount.toLocaleString("vi-VN", {
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
