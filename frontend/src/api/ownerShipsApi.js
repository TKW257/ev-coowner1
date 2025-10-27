import axiosClient from "./axiosClient";

const ownershipApi = {
  getMyOwnerships: () => axiosClient.get("/ownerships/viewMyOwnership"),
  getAllOwnerships: () => axiosClient.get("/ownerships/viewAllOwnership"),

  getMyVehicles() {
    return axiosClient.get("/ownerships/viewVehicleAndOwnship");
  },
};

export default ownershipApi;
