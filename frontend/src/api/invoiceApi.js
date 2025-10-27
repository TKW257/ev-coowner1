import axiosClient from "./axiosClient";

const invoiceApi = {
  // Lấy hóa đơn của user đang đăng nhập
  getMyInvoices(month) {
    const params = month ? { month } : {};
    return axiosClient.get("/invoices/my", { params });
  },

  // Lấy tất cả hóa đơn (dành cho STAFF)
  getAllInvoices() {
    return axiosClient.get("/invoices");
  },

  // Tạo hóa đơn tự động theo email (dành cho STAFF)
  createAutoInvoiceByEmail(email) {
    return axiosClient.post("/invoices/auto", null, { params: { email } });
  },

  // (tuỳ chọn) Lấy tất cả SumaInvoice (dành cho STAFF)
  getAllSumaInvoices() {
    return axiosClient.get("/invoices/suma");
  }
};

export default invoiceApi;
