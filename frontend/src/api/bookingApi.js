import axiosClient from "./axiosClient";

const bookingApi = {

  createBooking(data) {
    return axiosClient.post(`/bookings/createBooking`, data);
  },

  getBookingsByVehicle(vehicleId) {
    return axiosClient.get(`/bookings/byVehicle/${vehicleId}`);
  },

  getVehicleSchedule(vehicleId) {
    return axiosClient.get(`/bookings/vehicle/${vehicleId}/schedule`);
  },

  cancelBooking(bookingId) {
    return axiosClient.delete(`/bookings/${bookingId}`);
  },

  updateStatus(id, status) {
    const requestData = {
      id: id,
      status: status
    };
    return axiosClient.put("/bookings/updateStatus", requestData);
  },

  // STAFF CHECKING API
  getAllBookings() {
    return axiosClient.get("/bookings/viewAllBooking");
  },

  createStaffChecking(data) {
    return axiosClient.post("/staff-checkings/createStaffChecking", data);
  },

  viewAllStaffCheckings() {
    return axiosClient.get("/staff-checkings/viewAllStaffChecking");
  },

  getAllStaffCheckings() {
    // Alias for viewAllStaffCheckings for backward compatibility
    return this.viewAllStaffCheckings();
  },


};

export default bookingApi;
