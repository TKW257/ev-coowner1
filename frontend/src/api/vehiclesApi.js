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

  createVehicle(formData) {
    return axiosClient.post("/vehicles/createVehicle", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateVehicle(id, formData) {
    return axiosClient.put(`/vehicles/update/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteVehicle(id) {
    return axiosClient.delete(`/vehicles/delete/${id}`);
  }

};

export default vehiclesApi;
