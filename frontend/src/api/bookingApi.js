import axiosClient from "./axiosClient";

const bookingApi = {

  // USER API
  createBooking(data) {
    return axiosClient.post("/bookings/createBooking", data);
  },

  getMyBookings() {
    return axiosClient.get("/bookings/my");
  },

  cancelBooking(id) {
    return axiosClient.delete("/bookings/" + id); //chưa
  },

  // STAFF API
  getAllBookings() {
    return axiosClient.get("/bookings/viewAllBooking");
  },

  updateStatus(id, status) {
    return axiosClient.put("/bookings/" + id + "/status?status=" + status);
  },

  // STAFF CHECKING API
  createStaffChecking(data) {
    return axiosClient.post("/staff-checkings/createStaffChecking", data);
  },

  getAllStaffCheckings() {
    return axiosClient.get("/staff-checkings/viewAllStaffChecking");
  },

  /*
    getBookingById: function(id) {
      return axiosClient.get("/api/bookings/" + id);
    }
  */

};

export default bookingApi;