import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Result, Button, Spin, message } from "antd";
import paymentApi from "../../../api/paymentApi";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  const orderCode = searchParams.get("orderCode");
  const amount = searchParams.get("amount");

  useEffect(() => {
    const sendWebhook = async () => {
      try {
        if (!orderCode || !amount) {
          message.error("Thiếu dữ liệu thanh toán");
          return;
        }

        const payload = {
          data: { orderCode: Number(orderCode), amount: Number(amount) },
        };

        await paymentApi.sendWebhook(payload);
        message.success("Xác nhận thanh toán thành công!");
        setDone(true);
      } catch (err) {
        console.error("Webhook error:", err);
        message.error("Lỗi xác nhận thanh toán!");
      } finally {
        setLoading(false);
      }
    };

    sendWebhook();
  }, [orderCode, amount]);

  if (loading) return <Spin style={{ marginTop: 50 }} />;

  return (
    <Result
      status={done ? "success" : "error"}
      title={done ? "Thanh toán thành công!" : "Không thể xác nhận thanh toán"}
      subTitle={
        done
          ? `Đơn hàng ${orderCode} đã được xử lý với số tiền ${Number(amount).toLocaleString(
              "vi-VN"
            )}₫`
          : "Vui lòng kiểm tra lại giao dịch."
      }
      extra={[
        <Button type="primary" href="/user/invoices" key="back">
          Quay lại danh sách hóa đơn
        </Button>,
      ]}
    />
  );
};

export default PaymentSuccess;
