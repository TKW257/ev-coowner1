import axiosClient from "./axiosClient";

const bookingApi = {

 getBookings: (params) => {
    const url = '/bookings';
    return axiosClient.get(url, { params });
 }, 

 createBooking (data) {
    const url = '/bookings';
    return axiosClient.post(url, data)
 },

};

export default bookingApi;
