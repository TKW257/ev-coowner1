import axiosClient from "./axiosClient";

const paymentApi = {
  createPayment(sumaInvoiceId) {
    return axiosClient.post(`/payments/create/pay`, null, {
      params: { SumaInvoiceId: sumaInvoiceId }, 
    });
  },
};

export default paymentApi;
