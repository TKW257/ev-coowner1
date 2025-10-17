import axiosClient from "./axiosClient";

const bookingApi = {

  createBooking(data) {
    return axiosClient.post("/bookings/createBooking", data);
  },

  getMyBookings() {
    return axiosClient.get("/bookings/my");
  },

};

export default bookingApi;




 // cancelBooking(id) {
  //   return axiosClient.delete("/bookings/" + id); //chưa
  // },