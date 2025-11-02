import axiosClient from "./axiosClient";

const userApi = {

  // Đăng ký tài khoản
  register(data) {
    return axiosClient.post("/users/register", data);
  },

  // Đăng nhập (nhận token)
  login(data) {
    return axiosClient.post("/users/login", data);
  },

  // Lấy thông tin người dùng hiện tại (theo token)
  getProfile() {
    return axiosClient.get("/users/me");
  },

  // Cập nhật thông tin user (dành cho USER hoặc ADMIN)
  update(data) {
    return axiosClient.put("/users/update", data);
  },

  // Lấy toàn bộ danh sách người dùng (STAFF hoặc ADMIN)
  getAll() {
    return axiosClient.get("/users/viewAllUser");
  },

  // Xoá mềm tài khoản (ADMIN)
  delete(id) {
    return axiosClient.delete(`/users/delete/${id}`);
  },

  // Upload tài liệu xác minh (CMND, bằng lái, v.v.)
  uploadDocuments(id, formData) {
    return axiosClient.post(`/users/${id}/upload-documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Admin xác minh tài liệu của user (approve hoặc từ chối)
  verifyUser(userId, approved, note) {
    const params = new URLSearchParams({ approved, note });
    return axiosClient.post(`/users/${userId}/verify?${params.toString()}`);
  },

  // Lấy danh sách user đang chờ xác minh
  getPendingVerification() {
    return axiosClient.get("/users/pending-verification");
  },
};

export default userApi;
