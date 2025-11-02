import axiosClient from "./axiosClient";

const ownerContractsApi = {
  // Lấy tất cả owner contracts (dành cho ADMIN)
  getAll() {
    return axiosClient.get("/owner-contracts/viewAllOwnerContract");
  },

  // Tạo owner contract mới (dành cho ADMIN)
  create(data) {
    return axiosClient.post("/owner-contracts/createOwnerContract", data);
  },

  // Lấy owner contracts của user hiện tại (dành cho ADMIN)
  getMyContracts() {
    return axiosClient.get("/owner-contracts/viewMyOwnerContract");
  },
};

export default ownerContractsApi;