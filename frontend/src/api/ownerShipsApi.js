import axiosClient from "./axiosClient";

const ownershipApi = {
  getMyOwnerships: () => axiosClient.get("/ownerships/viewMyOwnership"),
  getAllOwnerships: () => axiosClient.get("/ownerships/viewAllOwnership"),

  getMyVehicles() {
    return axiosClient.get("/ownerships/viewVehicleAndOwnship");
  },

  getMyGroupOwnership(vehicle_Id) {
    return axiosClient.get(`/ownerships/viewMygroupOwnership/${vehicle_Id}`);
  },
};

export default ownershipApi;
