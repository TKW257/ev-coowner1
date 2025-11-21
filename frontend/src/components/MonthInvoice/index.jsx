import React, { forwardRef } from "react";
import { Table, Descriptions, Divider } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import logoFull from "../../assets/logo_main.png";

const parseDateArray = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
    return null;
  }
  
  const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
  // Subtract 1 from month because API uses 1-based months but JavaScript uses 0-based
  return dayjs(new Date(year, month - 1, day, hour, minute, second));
};


const InvoiceMonthDetail = forwardRef(({ selectedMonth }, ref) => {
  if (!selectedMonth) return null;

  // ==== Bảng hóa đơn con ====
  const invoiceColumns = [
    { 
      title: "Mã HĐ", 
      dataIndex: "invoiceId", 
      render: (id) => `#${id}` 
    },
    { 
      title: "Xe", 
      dataIndex: "model", 
      render: (v) => v || "N/A"
    },
    { 
      title: "Biển số", 
      dataIndex: "plateNumber", 
      render: (v) => v || "N/A"
    },
    {
      title: "Tổng tiền",
      dataIndex: "totalAmount",
      render: (v) => (v || v === 0 ? v.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "N/A"),
    },
    {
      title: "Ngày lập",
      dataIndex: "issuedDate",
      render: (d) => {
        const parsedDate = parseDateArray(d);
        return parsedDate ? parsedDate.format("DD/MM/YYYY") : "N/A";
      },
    },
    {
      title: "Hạn thanh toán",
      dataIndex: "dueDate",
      render: (d) => {
        const parsedDate = parseDateArray(d);
        return parsedDate ? parsedDate.format("DD/MM/YYYY") : "N/A";
      },
    },
  ];

  // ==== Bảng chi tiết gộp ====
  const detailColumns = [
    { title: "STT", dataIndex: "stt", width: 60 },
    { 
      title: "Xe", 
      dataIndex: "vehicle", 
      render: (v) => v || "N/A"
    },
    { 
      title: "Biển số", 
      dataIndex: "plateNumber", 
      render: (v) => v || "N/A"
    },
    { 
      title: "Loại phí", 
      dataIndex: "feeType", 
      render: (v) => v || "N/A"
    },
    { 
      title: "Mô tả", 
      dataIndex: "description", 
      render: (v) => v || "N/A"
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      render: (v) => (v || v === 0 ? v.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "N/A"),
    },
  ];

  // Tạo dữ liệu chi tiết gộp, bỏ detail rỗng
  const mergedDetails = selectedMonth.invoices.flatMap((inv) =>
    inv.details?.length
      ? inv.details.map((d, i) => ({
          key: `${inv.invoiceId}-${i}`,
          stt: i + 1,
          vehicle: inv.model,
          plateNumber: inv.plateNumber,
          feeType: d.feeType,
          description: d.description,
          amount: d.amount,
        }))
      : []
  );

  return (
    <div ref={ref} style={{ padding: 32, background: "#fff", fontFamily: "Arial, sans-serif", color: "#333" }}>
      
      {/* Header công ty */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        <img src={logoFull} alt="Logo công ty" style={{ height: 60, marginRight: 16 }} />
        <div>
          <h2 style={{ margin: 0, fontWeight: 600 }}>BÁO CÁO HÓA ĐƠN THÁNG {dayjs(selectedMonth.month).format("MM/YYYY")}</h2>
        </div>
      </div>

      {/* Thông tin khách hàng */}
      <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
        {selectedMonth.userName && (
          <Descriptions.Item label={<UserOutlined />}>
            <b>{selectedMonth.userName}</b>
          </Descriptions.Item>
        )}
        {selectedMonth.month && (
          <Descriptions.Item label="Tháng">{dayjs(selectedMonth.month).format("MM/YYYY")}</Descriptions.Item>
        )}
        {selectedMonth.totalAmount !== undefined && (
          <Descriptions.Item label="Tổng cộng tháng">
            {selectedMonth.totalAmount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Hóa đơn con */}
      {selectedMonth.invoices?.length > 0 && (
        <>
          <h3> Danh sách các hóa đơn chi tiết</h3>
          <Table
            columns={invoiceColumns}
            dataSource={selectedMonth.invoices}
            pagination={false}
            size="small"
            rowKey="invoiceId"
            bordered
          />
        </>
      )}

      {/* Chi tiết gộp */}
      {mergedDetails.length > 0 && (
        <>
          <Divider style={{ margin: "32px 0" }} />
          <h3> Chi tiết gộp tất cả hóa đơn</h3>
          <Table
            columns={detailColumns}
            dataSource={mergedDetails}
            pagination={false}
            size="small"
            bordered
          />
        </>
      )}

      {/* Tổng cộng */}
      {selectedMonth.totalAmount !== undefined && (
        <h4 style={{ marginTop: 24, textAlign: "right", fontWeight: 600 }}>
          Tổng cộng tháng {dayjs(selectedMonth.month).format("MM/YYYY")}:{" "}
          {selectedMonth.totalAmount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
        </h4>
      )}
    </div>
  );
});

export default InvoiceMonthDetail;
