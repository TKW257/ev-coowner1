import axiosClient from "./axiosClient";

const bookingApi = {

  createBooking(data) {
    console.log("📤 Gửi request tạo booking:", data);
    return axiosClient.post(`/bookings/createBooking`, data);
  },

  getMyBookings() {
    return axiosClient.get("/bookings/my");
  },

  getBookingsByVehicle(vehicleId) {
    return axiosClient.get(`/bookings/byVehicle/${vehicleId}`);
  },

  cancelBooking(bookingId) {
    return axiosClient.delete(`/bookings/${bookingId}`);
  },

};


export default bookingApi;




// cancelBooking(id) {
//   return axiosClient.delete("/bookings/" + id); //chưa
// },