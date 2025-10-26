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
};

export default vehiclesApi;
