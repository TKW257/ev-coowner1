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

};


export default bookingApi;
