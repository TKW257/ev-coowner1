import axiosClient from "./axiosClient";

const vehiclesApi = {
  getAllVehicles() {
    return axiosClient.get("/vehicles/viewAllVehicle");
  },
  getTop4Vehicles() {
    return axiosClient.get("/vehicles/top4");
  },
};

export default vehiclesApi;
