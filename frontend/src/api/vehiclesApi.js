import axiosClient from "./axiosClient";

const vehiclesApi = {

<<<<<<< Updated upstream
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

=======
  getTop4Vehicles() {
    return axiosClient.get("/vehicles/top4");
  },

  getAllVehicles() {
    return axiosClient.get("/vehicles/viewAllVehicle");
  },


>>>>>>> Stashed changes
};

export default vehiclesApi;
