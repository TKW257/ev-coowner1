import axiosClient from "./axiosClient";

const ownershipApi = {

  getMyVehicles() {
    return axiosClient.get("/ownerships/viewVehicleAndOwnship");
  },
  
};

export default ownershipApi;
