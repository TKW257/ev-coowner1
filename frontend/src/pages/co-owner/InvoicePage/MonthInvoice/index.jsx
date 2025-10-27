import React, { forwardRef } from "react";
import { Table, Descriptions } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import logoFull from "../../../../assets/logo_main.png";

const InvoiceMonthDetail = forwardRef(({ selectedMonth }, ref) => {
  if (!selectedMonth) return null;

  // ==== Cột bảng hóa đơn con ====
  const invoiceColumns = [
    { title: "Mã HĐ", dataIndex: "invoiceId", render: (id) => `#${id}` },
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
      render: (d) => dayjs(new Date(...d.slice(0, 6))).format("DD/MM/YYYY"),
    },
    {
      title: "Hạn TT",
      dataIndex: "dueDate",
      render: (d) => dayjs(new Date(...d.slice(0, 6))).format("DD/MM/YYYY"),
    },
  ];

  // ==== Cột bảng chi tiết gộp ====
  const detailColumns = [
    { title: "STT", dataIndex: "stt", width: 60 },
    { title: "Xe", dataIndex: "vehicle" },
    { title: "Biển số", dataIndex: "plateNumber" },
    { title: "Loại phí", dataIndex: "feeType" },
    { title: "Mô tả", dataIndex: "description" },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (v) =>
        v.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
  ];

  return (
    <div ref={ref} style={{ padding: 20, background: "#fff" }}>
      {/* Header + logo */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
        <img
          src={logoFull}
          alt="Company Logo"
          style={{ height: 50, marginRight: 12 }}
        />
        <div>
          <h2 style={{ margin: 0 }}>Báo cáo hóa đơn tháng {selectedMonth.month}</h2>
          <p style={{ margin: 0, color: "#888" }}>Công ty TNHH Green Mobility</p>
        </div>
      </div>

      {/* Thông tin chung */}
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
  );
});

export default InvoiceMonthDetail;
