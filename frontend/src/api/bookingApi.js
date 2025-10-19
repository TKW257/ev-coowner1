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
    console.log("🔧 API: Updating booking status", { id, status });
    
    // Send status in request body (more standard REST API approach)
    const requestData = { status: status };
    console.log("🔧 API: Request data:", requestData);
    console.log("🔧 API: Full URL will be:", `/bookings/${id}/status`);
    
    return axiosClient.put(`/bookings/${id}/status`, requestData).catch(error => {
      console.log("🔧 API: Body method failed, trying query parameter method...");
      console.log("🔧 API: Error:", error.response?.status, error.response?.data);
      
      // Fallback: try with query parameter
      return axiosClient.put(`/bookings/${id}/status?status=${encodeURIComponent(status)}`);
    });
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