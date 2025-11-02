import axiosClient from "./axiosClient";

const userApi = {

  register(data) {
    return axiosClient.post("/users/register", data);
  },

  login(data) {
    return axiosClient.post("/users/login", data);
  },

  getProfile() {
    return axiosClient.get("/users/me");
  },

  update(data) {
    return axiosClient.put("/users/update", data);
  },

  getAll() {
    return axiosClient.get("/users/viewAllUser");
  },

  delete(id) {
    return axiosClient.delete(`/users/delete/${id}`);
  },

  uploadDocuments(id, formData) {
    return axiosClient.post(`/users/${id}/upload-documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  verifyUser(userId, approved, note) {
    const params = new URLSearchParams({ approved, note });
    return axiosClient.post(`/users/${userId}/verify?${params.toString()}`);
  },

  levelUpToStaff(email) {
    return axiosClient.post(`/users/${email}/upLevelToStaff`);
  }
};

export default userApi;
