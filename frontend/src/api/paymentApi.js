// src/api/paymentApi.js
import axiosClient from "./axiosClient";

const paymentApi = {
  createPayment(invoiceId, amount, method = "PAYOS") {
    return axiosClient.post(`/payments/create/pay?SumaInvoiceId=${invoiceId}`, {
      invoiceId,       // phải trùng với PaymentRequest của BE
      paidAmount: amount,
      method,
    });
  },

  getStatus(orderCode) {
    return axiosClient.get(`/payments/status`, { params: { orderCode } });
  },
};


export default paymentApi;
