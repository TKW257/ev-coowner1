// src/api/ownershipApi.js
import axiosClient from "./axiosClient";

const ownershipAPI = {
  getMyOwnerships: () => axiosClient.get("/ownerships/viewMyOwnership"),
  getAllOwnerships: () => axiosClient.get("/ownerships/viewAllOwnership"),
  getMyVehicles: () => axiosClient.get("/ownerships/myVehicles"),
};

export default ownershipAPI;
