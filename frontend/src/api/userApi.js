import axiosClient from "./axiosClient";

const userApi = {

  register(data) {
    return axiosClient.post("/users/register", data);
  },

  login(data) {
    return axiosClient.post("/users/login", data);
  },

  getProfile() {
    const url = '/api/users/me';
    return axiosClient.get(url);
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