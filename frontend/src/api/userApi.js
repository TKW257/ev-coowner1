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

  update(id, data) {
    return axiosClient.put(`/users/${id}`, data);
  },

  getAll() {
    return axiosClient.get("/users/viewAllUser");
  },

  delete(id) {
    return axiosClient.delete(`/users/${id}`);
  },
};

export default userApi;
