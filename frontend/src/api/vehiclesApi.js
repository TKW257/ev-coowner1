import axiosClient from "./axiosClient";

const vehiclesApi = {

  getCars() {
    return axiosClient.get("/vehicles");
  },

  getCarById(id) {
    return axiosClient.get(`/vehicles/${id}`);
  },

  create(data) {
    return axiosClient.post("/vehicles", data);
  },

  update(id, data) {
    return axiosClient.put(`/vehicles/${id}`, data);
  },

  delete(id) {
    return axiosClient.delete(`/vehicles/${id}`);
  },

};

export default vehiclesApi;
