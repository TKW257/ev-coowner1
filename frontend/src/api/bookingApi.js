import axiosClient from "./axiosClient";

const bookingApi = {

  createBooking(data) {
    return axiosClient.post(`/bookings/createBooking`, data);
  },

  getAllBookings() {
    return axiosClient.get("/bookings/viewAllBooking");
  },

  getMyBooking() {
    return axiosClient.get('/bookings/my');
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
      status: status,
    };
    return axiosClient.put("/bookings/updateStatus", requestData);
  },

  // STAFF CHECKING API
  confirmStaffChecking(id, data) {
    return axiosClient.post(`/staff-checkings/${id}/confirm`, data);
  },

  createStaffChecking(data) {
    return axiosClient.post("/staff-checkings/createStaffChecking", data);
  },

  getAllStaffCheckings() {
    return axiosClient.get("/staff-checkings/viewAllStaffChecking");
  },

  getStaffCheckingsByBookingId(id) {
    return axiosClient.get(`/staff-checkings/booking/${id}`)
  },
};

export default bookingApi;
