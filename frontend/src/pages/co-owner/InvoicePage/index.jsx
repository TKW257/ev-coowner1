import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Modal, Spin, Empty, Row, Tag, Radio } from "antd";
import { DownloadOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import invoiceApi from "../../../api/invoiceApi";
import paymentApi from "../../../api/paymentApi";
import InvoiceMonthDetail from "./MonthInvoice";

const UserInvoiceDashboard = () => {
  const [invoiceList, setInvoiceList] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const pdfRef = useRef();

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await invoiceApi.getMyInvoices();
        console.log("API RESPONSE:", res);

        const data = res.data ?? res;

        const mapped = [{
          sumaInvoiceId: data.sumaInvoiceId,
          month: data.month,
          totalAmount: data.totalAmount,
          status: data.status,
          userName: data.userName,
          invoices: data.invoices || [],
        }];

        setInvoiceList(mapped);
        console.log("Mapped:", mapped);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handlePayment = async (sumaInvoiceId) => {
    try {
      const res = await paymentApi.createPayment(sumaInvoiceId);
      // Nếu axiosClient đã return response.data => res chính là JSON
      const data = res.checkoutUrl ? res : res.data;

      console.log("✅ PAYMENT DATA:", data);

      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank", "noopener,noreferrer");
      }
      else {
        console.warn("⚠️ Không nhận được checkoutUrl:", data);
      }
    } catch (err) {
      console.error("❌ Lỗi khi tạo payment:", err);
    }
  };



  const handleDownloadPDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
    pdf.save(`Invoice_${selectedMonth.month}.pdf`);
  };

  const openMonthDetail = (record) => {
    setSelectedMonth(record);
    setOpen(true);
  };

  const filteredInvoices =
    filterStatus === "ALL"
      ? invoiceList
      : invoiceList.filter((i) => i.status === filterStatus);

  const stats = {
    OPEN: invoiceList.filter((i) => i.status === "OPEN").length,
    SETTLED: invoiceList.filter((i) => i.status === "SETTLED").length,
  };
  if (loading)
    return (
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin />
      </div>
    );

  return (
    <div style={{ padding: 24 }}>
      <Card style={{ marginBottom: 24 }}>
        <Row>
          <Radio.Group value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <Radio.Button value="ALL">Tất cả</Radio.Button>
            <Radio.Button value="OPEN">Chưa thanh toán ({stats.OPEN})</Radio.Button>
            <Radio.Button value="SETTLED">Đã thanh toán ({stats.SETTLED})</Radio.Button>
          </Radio.Group>

        </Row>
      </Card>

      {filteredInvoices.length === 0 ? (
        <Empty description="Không có hóa đơn" style={{ marginTop: 50 }} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredInvoices.map((item) => (
            <Card key={item.sumaInvoiceId} style={{ padding: "16px 20px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 20,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ fontWeight: 600 }}>
                  Tháng: {dayjs(item.month).format("MM/YYYY")}
                </div>

                <div>
                  Tổng tiền:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {item.totalAmount.toLocaleString("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    })}
                  </span>
                </div>

                <div>
                  {item.status === "OPEN" ? (
                    <Tag color="red" icon={<ClockCircleOutlined />}>
                      Chưa thanh toán
                    </Tag>
                  ) : (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Đã thanh toán
                    </Tag>
                  )}
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <Button icon={<EyeOutlined />} type="primary" onClick={() => openMonthDetail(item)}>
                    Xem chi tiết
                  </Button>

                  {item.status === "OPEN" && (
                    <Button
                      icon={<DownloadOutlined />}
                      type="primary"
                      style={{ backgroundColor: "#52c41a" }}
                      onClick={() => handlePayment(item.sumaInvoiceId)} // 👈 Truyền id vào đây
                    >
                      Thanh toán
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        title={`Chi tiết hóa đơn tháng ${dayjs(selectedMonth?.month).format("MM/YYYY")}`}
        onCancel={() => setOpen(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>
            Đóng
          </Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
            Tải PDF
          </Button>,
        ]}
      >
        <div ref={pdfRef}>
          <InvoiceMonthDetail selectedMonth={selectedMonth} />
        </div>
      </Modal>
    </div>
  );
};

export default UserInvoiceDashboard;
