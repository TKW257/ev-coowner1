import axiosClient from "./axiosClient";

const vehiclesApi = {
<<<<<<< HEAD

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

  getAllVehicles: () => axiosClient.get("/vehicles"),
=======
  getAllVehicles() {
    return axiosClient.get("/vehicles/viewAllVehicle");
  },
  getTop4Vehicles() {
    return axiosClient.get("/vehicles/top4");
  },
>>>>>>> f97cf661 (up)
};

export default vehiclesApi;
