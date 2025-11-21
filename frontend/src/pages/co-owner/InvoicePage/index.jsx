import React, { useEffect, useState, useRef } from "react";
import { Card, Button, Modal, Spin, Empty, Row, Tag, Radio } from "antd";
import { DownloadOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import invoiceApi from "../../../api/invoiceApi";
import paymentApi from "../../../api/paymentApi";
import MonthInvoice from "../../../components/MonthInvoice";
import './style.scss';

const parseDateArray = (dateArray) => {
  if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) {
    return null;
  }
  
  const [year, month, day, hour = 0, minute = 0, second = 0] = dateArray;
  // Subtract 1 from month because API uses 1-based months but JavaScript uses 0-based
  return dayjs(new Date(year, month - 1, day, hour, minute, second));
};


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
        // res có thể là response.data hoặc trực tiếp data, an toàn lấy res.data ?? res
        const data = res?.data ?? res;

        // Nếu API trả về mảng
        const list = Array.isArray(data) ? data : [data];

        const mapped = list.map((item, index) => {
          console.log(`\n📄 Invoice Item ${index + 1}:`, {
            sumaInvoiceId: item.sumaInvoiceId,
            month: item.month,
            monthType: typeof item.month,
            monthIsArray: Array.isArray(item.month),
            totalAmount: item.totalAmount,
            status: item.status,
            userName: item.userName,
            invoicesCount: item.invoices?.length || 0,
            rawItem: item
          });
          
          return {
            sumaInvoiceId: item.sumaInvoiceId,
            month: item.month,
            totalAmount: item.totalAmount,
            status: item.status,
            userName: item.userName,
            invoices: item.invoices || [],
          };
        });

        setInvoiceList(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const handlePayment = async (sumaInvoiceId, amount) => {
    try {
      const res = await paymentApi.createPayment(sumaInvoiceId, amount, "PAYOS");
      const data = res?.data ?? res;

      console.log("✅ PAYMENT DATA:", data);

      // Lấy checkoutUrl và orderCode đúng chuẩn
      const checkoutUrl = data?.data?.checkoutUrl || data.checkoutUrl;
      const orderCode = data?.data?.orderCode || data.orderCode;

      if (!checkoutUrl) {
        console.warn("⚠️ Không nhận được checkoutUrl:", data);
        return;
      }

      // Lưu orderCode để xác nhận sau redirect
      if (orderCode) {
        localStorage.setItem("pendingOrderCode", String(orderCode));
      } else {
        localStorage.setItem("pendingSumaInvoiceId", String(sumaInvoiceId));
      }

      // Redirect sang PayOS
      window.location.href = checkoutUrl;
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
<Card className="filter-status-card">
  <Row>
    <Radio.Group
      value={filterStatus}
      onChange={(e) => setFilterStatus(e.target.value)}
    >
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
          {filteredInvoices.map((item) => {
            // Get dueDate from first invoice
            const firstInvoice = item.invoices?.[0];
            const dueDate = firstInvoice?.dueDate;
            const parsedDueDate = parseDateArray(dueDate);
            const dueDateFormatted = parsedDueDate ? parsedDueDate.format("DD/MM/YYYY") : "N/A";
            
            return (
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
                    Hạn thanh toán:{" "}
                    <span style={{ fontWeight: 500, color: item.status === "OPEN" && parsedDueDate && parsedDueDate.isBefore(dayjs()) ? "#ff4d4f" : "#333" }}>
                      {dueDateFormatted}
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
            );
          })}
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
          <MonthInvoice selectedMonth={selectedMonth} />
        </div>
      </Modal>
    </div>
  );
};

export default UserInvoiceDashboard;
