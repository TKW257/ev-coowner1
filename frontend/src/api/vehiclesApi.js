import axiosClient from "./axiosClient";

const vehiclesApi = {

  getAllVehicles() { 
    return axiosClient.get("/vehicles/viewAllVehicle");
  },

  getTop4Vehicles() {
    return axiosClient.get("/vehicles/top4");
  },
  createVehicle(data) {
    return axiosClient.post("/vehicles/createVehicle", data);
  },
  updateVehicle(id, data) {
    return axiosClient.put(`/vehicles/update/${id}`, data);
  },
  deleteVehicle(id) {
    return axiosClient.delete(`/vehicles/delete/${id}`);
  },
};

export default vehiclesApi;
