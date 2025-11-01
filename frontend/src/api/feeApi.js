import axiosClient from "./axiosClient";

const feeApi = {
  // ADMIN: tạo phí biến động
  createVariableFee(data) {
    console.log("[FEE API] REQUEST - createVariableFee:", data);
    return axiosClient.post("/fees/variable", data).then(res => {
      console.log("[FEE API] RESPONSE - createVariableFee:", res);
      return res;
    }).catch(err => {
      console.error("[FEE API] ERROR - createVariableFee:", err);
      throw err;
    });
  },

  // ADMIN: tạo phí cố định
  createFixedFee(data) {
    return axiosClient.post("/fees/fixed", data);
  },

  // ADMIN: xem tất cả phí
  getAllFees() {
    return axiosClient.get("/fees/all");
  },

  // USER: xem phí theo xe
  getFeesByVehicle(vehicleId) {
    return axiosClient.get(`/fees/vehicle/${vehicleId}`);
  }
};

export default feeApi;
