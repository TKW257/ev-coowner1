import axiosClient from "./axiosClient";

const vehiclesApi = {
  // Lấy tất cả xe
  getCars() {
    return axiosClient.get("/vehicles");
  },

  // Lấy xe theo userId
  getCarsByUser(userId) {
    return axiosClient.get(`/vehicles?userId=${userId}`);
  },

  // Lấy xe theo id
  getCarById(id) {
    return axiosClient.get(`/vehicles/${id}`);
  },

  // Tạo xe mới
  create(data) {
    return axiosClient.post("/vehicles", data);
  },

  // Cập nhật xe
  update(id, data) {
    return axiosClient.put(`/vehicles/${id}`, data);
  },

  // Xóa xe
  delete(id) {
    return axiosClient.delete(`/vehicles/${id}`);
  },
};

export default vehiclesApi;
