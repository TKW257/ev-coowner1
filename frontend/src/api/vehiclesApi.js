import axiosClient from "./axiosClient";

const vehiclesApi = {
  /*
  getAll() {
      return axiosClient.get("/vehicles");
    },
  
    getById(id) {
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
  */

  getCarsByUser(userId) {
    return axiosClient.get(`/vehicles?userId=${userId}`);
  },

  getCars() {
    return axiosClient.get("/vehicles");
  },

  // ✅ Thêm hàm này để lấy xe theo id
  getCarById(id) {
    return axiosClient.get(`/vehicles/${id}`);
  },

  // ✅ Thêm hàm này để lấy xe theo id
  getCarById(id) {
    return axiosClient.get(`/vehicles/${id}`);
  },

  getAllVehicles: () => axiosClient.get("/vehicles"),
};

export default vehiclesApi;
