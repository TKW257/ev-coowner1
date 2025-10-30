import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Result, Button, Spin, message } from "antd";
import paymentApi from "../../../api/paymentApi";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [statusText, setStatusText] = useState("Đang xác nhận...");

  // PayOS có thể trả về params khác — ưu tiên orderCode
  const orderCodeFromUrl = searchParams.get("orderCode");
  const amountFromUrl = searchParams.get("amount");

  useEffect(() => {
    let orderCode = orderCodeFromUrl || localStorage.getItem("pendingOrderCode");
    const fallbackInvoiceId = localStorage.getItem("pendingSumaInvoiceId");

    if (!orderCode && !fallbackInvoiceId) {
      message.error("Không tìm thấy orderCode hoặc invoiceId để xác nhận.");
      setLoading(false);
      return;
    }

    let attempts = 0;
    const maxAttempts = 10; // thử 10 lần
    const intervalMs = 2000; // mỗi 2s

    const check = async () => {
      try {
        attempts++;
        setStatusText(`Đang xác nhận (lần ${attempts})...`);

        // Nếu bạn có endpoint check theo orderCode:
        if (orderCode) {
          const res = await paymentApi.getStatus(orderCode);
          const data = res?.data ?? res;
          const status = data.status || data.paymentStatus || data.state;

          if (status === "SUCCESS" || status === "SETTLED" || status === "PAID") {
            setDone(true);
            setStatusText("Thanh toán đã được xác nhận.");
            // cleanup
            localStorage.removeItem("pendingOrderCode");
            localStorage.removeItem("pendingSumaInvoiceId");
            setLoading(false);
            return;
          }
        } else if (fallbackInvoiceId) {
          // nếu BE có API check theo sumaInvoiceId, gọi nó ở đây (ví dụ invoiceApi.getById)
          // const res = await invoiceApi.getById(fallbackInvoiceId);
          // if (res.data.status === 'SETTLED') { ... }
        }

        if (attempts >= maxAttempts) {
          setStatusText("Chưa có xác nhận từ hệ thống. Vui lòng thử lại sau.");
          setLoading(false);
          return;
        }

        // nếu chưa xong, tiếp tục sau interval
        setTimeout(check, intervalMs);
      } catch (err) {
        console.error("Error checking payment status:", err);
        if (attempts >= maxAttempts) {
          setStatusText("Lỗi khi xác nhận thanh toán");
          setLoading(false);
        } else {
          setTimeout(check, intervalMs);
        }
      }
    };

    check();
  }, [orderCodeFromUrl, amountFromUrl]);

  if (loading) return <Spin style={{ marginTop: 50 }} />;

  return (
    <Result
      status={done ? "success" : "warning"}
      title={done ? "Thanh toán thành công!" : "Chưa xác nhận thanh toán"}
      subTitle={statusText}
      extra={[
        <Button type="primary" href="/user/invoices" key="back">
          Quay lại danh sách hóa đơn
        </Button>,
      ]}
    />
  );
};

export default PaymentSuccess;
