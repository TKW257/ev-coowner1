import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Spin,
  Empty,
  Modal,
  Descriptions,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const AdminInvoiceDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [invoices, setInvoices] = useState([]);
  const [summary, setSummary] = useState({
    totalInvoices: 0,
    totalRevenue: 0,
    paidCount: 0,
    unpaidCount: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const revenueData = [
    { month: "May", revenue: 12500000 },
    { month: "Jun", revenue: 15800000 },
    { month: "Jul", revenue: 21200000 },
    { month: "Aug", revenue: 18400000 },
    { month: "Sep", revenue: 22900000 },
    { month: "Oct", revenue: 19300000 },
  ];

  const mockInvoices = [
    {
      invoiceId: "INV-1001",
      userName: "Nguyễn Văn A",
      vehicleName: "VinFast VF8",
      totalAmount: 8500000,
      status: "PAID",
      createdAt: "2025-10-05",
      note: "Hóa đơn tháng 10 cho xe VF8",
      paymentMethod: "Chuyển khoản",
      dueDate: "2025-10-15",
    },
    {
      invoiceId: "INV-1002",
      userName: "Trần Thị B",
      vehicleName: "VinFast VF9",
      totalAmount: 9200000,
      status: "UNPAID",
      createdAt: "2025-10-06",
      note: "Hóa đơn tháng 10 cho xe VF9",
      paymentMethod: "Tiền mặt",
      dueDate: "2025-10-20",
    },
    {
      invoiceId: "INV-1003",
      userName: "Lê Minh C",
      vehicleName: "Tesla Model 3",
      totalAmount: 11200000,
      status: "PAID",
      createdAt: "2025-10-08",
      note: "Hóa đơn tháng 10 Tesla",
      paymentMethod: "Ví điện tử",
      dueDate: "2025-10-10",
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setInvoices(mockInvoices);
      setSummary({
        totalInvoices: mockInvoices.length,
        totalRevenue: mockInvoices.reduce((s, i) => s + i.totalAmount, 0),
        paidCount: mockInvoices.filter((i) => i.status === "PAID").length,
        unpaidCount: mockInvoices.filter((i) => i.status === "UNPAID").length,
      });
      setLoading(false);
    }, 800);
  }, []);

  const columns = [
    {
      title: "Mã hóa đơn",
      dataIndex: "invoiceId",
    },
    {
      title: "Người dùng",
      dataIndex: "userName",
    },
    {
      title: "Phương tiện",
      dataIndex: "vehicleName",
    },
    {
      title: "Tổng tiền (VNĐ)",
      dataIndex: "totalAmount",
      render: (v) => v.toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      render: (s) =>
        s === "PAID" ? (
          <Tag color="green">Đã thanh toán</Tag>
        ) : (
          <Tag color="orange">Chưa thanh toán</Tag>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
    },
    {
      title: "Thao tác",
      render: (_, r) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedInvoice(r);
            setDetailModalVisible(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Summary + Chart */}
      <Row gutter={24} style={{ marginBottom: 32 }}>
        <Col span={12}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card bordered={false} style={cardStyle}>
                <div style={horizontalStyle}>
                  <FileTextOutlined style={iconStyle("#1890ff")} />
                  <div>
                    <h2 style={valueStyle}>{summary.totalInvoices}</h2>
                    <p style={labelStyle}>Tổng hóa đơn</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} style={cardStyle}>
                <div style={horizontalStyle}>
                  <DollarOutlined style={iconStyle("#52c41a")} />
                  <div>
                    <h2 style={valueStyle}>
                      {summary.totalRevenue.toLocaleString("vi-VN")}
                    </h2>
                    <p style={labelStyle}>Tổng doanh thu (VNĐ)</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} style={cardStyle}>
                <div style={horizontalStyle}>
                  <CheckCircleOutlined style={iconStyle("green")} />
                  <div>
                    <h2 style={valueStyle}>{summary.paidCount}</h2>
                    <p style={labelStyle}>Đã thanh toán</p>
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card bordered={false} style={cardStyle}>
                <div style={horizontalStyle}>
                  <ClockCircleOutlined style={iconStyle("orange")} />
                  <div>
                    <h2 style={valueStyle}>{summary.unpaidCount}</h2>
                    <p style={labelStyle}>Chưa thanh toán</p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Col>

        <Col span={12}>
          <Card bordered={false} style={chartCardStyle}>
            <div style={{ marginBottom: 12, fontWeight: 600 }}>
              💰 Doanh thu theo tháng
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(v) => v.toLocaleString("vi-VN") + " VNĐ"}
                />
                <Bar dataKey="revenue" fill="#1890ff" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Danh sách hóa đơn */}
      <Card
        title={
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>📂 Danh sách hóa đơn</span>
            <Button type="primary" icon={<PlusOutlined />}>
              Tạo hóa đơn
            </Button>
          </div>
        }
      >
        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin tip="Đang tải dữ liệu..." />
          </div>
        ) : invoices.length === 0 ? (
          <Empty description="Không có hóa đơn nào" />
        ) : (
          <Table dataSource={invoices} columns={columns} rowKey="invoiceId" />
        )}
      </Card>

      {/* Modal chi tiết */}
      <Modal
        title="📋 Chi tiết hóa đơn"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
      >
        {selectedInvoice && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mã hóa đơn">
              {selectedInvoice.invoiceId}
            </Descriptions.Item>
            <Descriptions.Item label="Người dùng">
              {selectedInvoice.userName}
            </Descriptions.Item>
            <Descriptions.Item label="Phương tiện">
              {selectedInvoice.vehicleName}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền (VNĐ)">
              {selectedInvoice.totalAmount.toLocaleString("vi-VN")}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {selectedInvoice.status === "PAID" ? (
                <Tag color="green">Đã thanh toán</Tag>
              ) : (
                <Tag color="orange">Chưa thanh toán</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {selectedInvoice.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="Hạn thanh toán">
              {selectedInvoice.dueDate}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {selectedInvoice.paymentMethod}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {selectedInvoice.note}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

// === STYLE ===
const horizontalStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const cardStyle = {
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  height: 120,
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  paddingLeft: 20,
};

const valueStyle = {
  margin: 0,
  fontWeight: 600,
  fontSize: 18,
};

const labelStyle = {
  margin: 0,
  color: "#888",
  fontSize: 13,
};

const chartCardStyle = {
  borderRadius: 12,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  height: 280,
};

const iconStyle = (color) => ({
  fontSize: 26,
  color,
});

export default AdminInvoiceDashboard;
