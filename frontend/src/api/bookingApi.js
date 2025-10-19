import axiosClient from "./axiosClient";

const bookingApi = {
  // ✅ Tạo booking mới
  createBooking(data) {
    console.log("📤 Gửi request tạo booking:", data);
    return axiosClient.post(`/bookings`, data);
  },

  getBookingsByVehicle(vehicleId) {
    return axiosClient.get(`/bookings/byVehicle/${vehicleId}`);
  },

  getBookingsByVehicle(vehicleId) {
    return axiosClient.get(`/bookings/byVehicle/${vehicleId}`);
  },
};

export default bookingApi;

// cancelBooking(id) {
//   return axiosClient.delete("/bookings/" + id); //chưa
// },
