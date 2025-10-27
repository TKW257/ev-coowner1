import axiosClient from "./axiosClient";

const vehiclesApi = {

  getAllVehicles() {
    return axiosClient.get("/vehicles/viewAllVehicle");
  },

  getTop4Vehicles() {
    return axiosClient.get("/vehicles/top4");
  },

  getById(id) {
    return axiosClient.get(`/vehicles/vehicle/${id}`);
  },

  createVehicle(data) {
    return axiosClient.post("/vehicles/createVehicle", data);
  },

  updateVehicle(id, data) {
    return axiosClient.put(`/vehicles/${id}`, data);
  },

  deleteVehicle(id) {
    return axiosClient.delete(`/vehicles/${id}`);
  },
};

export default vehiclesApi;
