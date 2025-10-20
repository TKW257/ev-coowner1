import axiosClient from "./axiosClient";

const invoiceApi = {

  getMyInvoices() {
    return axiosClient.get("/invoices/my");
  },

  getAllInvoices() {
    return axiosClient.get("/invoices/all");
  },

  createInvoice(data) {
    return axiosClient.post("/invoices/createInvoice", data);
  }
  
};

export default invoiceApi;