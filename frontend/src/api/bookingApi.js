import axiosClient from "./axiosClient";

const bookingApi = {

  /*
    createBooking(data) {
      return axiosClient.post("/bookings", data);
    },
  
    getMyBookings() {
      return axiosClient.get("/bookings/my");
    },
  
    cancelBooking(id) {
      return axiosClient.delete(`/bookings/${id}`);
    },
  
    // ✅ STAFF
    getAllBookings() {
      return axiosClient.get("/bookings");
    },
  
    updateStatus(id, status) {
      return axiosClient.put(`/bookings/${id}/status?status=${status}`);
    },
  
    getBookingById(id) {
      return axiosClient.get(`/bookings/${id}`);
    },
  */

  getAllBookings: () => axiosClient.get("/bookings"),

  getBookingById: (id) => axiosClient.get(`/bookings/${id}`),

  createBooking: (data) => axiosClient.post("/bookings", data),

  updateBooking: (id, data) => axiosClient.patch(`/bookings/${id}`, data),

  deleteBooking: (id) => axiosClient.delete(`/bookings/${id}`),
};

export default bookingApi;
