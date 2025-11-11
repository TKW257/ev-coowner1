import axiosClient from "./axiosClient";

const contractApi = {
  
  // Tạo contract mới (dành cho ADMIN)
  create(data) {
    return axiosClient.post("/contracts/createContract", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Lấy tất cả contracts (dành cho ADMIN)
  getAll() {
    return axiosClient.get("/contracts/getAllContract");
  },

  // Lấy contracts của user hiện tại (dành cho USER)
  getMyContracts() {
    return axiosClient.get("/contracts/myContracts");
  },

  // Cập nhật status của contract (dành cho ADMIN)
  updateStatus(id, data) {
    return axiosClient.put(`/contracts/${id}`, data);
  },

  // Xóa contract (soft delete, dành cho ADMIN)
  delete(id) {
    return axiosClient.delete(`/contracts/delete/${id}`);
  },
};

export default contractApi;

