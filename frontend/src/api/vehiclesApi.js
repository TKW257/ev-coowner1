import axiosClient from "./axiosClient";

const vehiclesApi = {
  
  getTop4Vehicles() {
    return axiosClient.get("/vehicles/top4");
  },

  getAllVehicles() {
    return axiosClient.get("/vehicles/viewAllVehicle");
  },

};

export default vehiclesApi;
