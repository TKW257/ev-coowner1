import axiosClient from "./axiosClient";

const userApi = {
  /*
  register(data) {
    const url = '/api/users/register';
    return axiosClient.post(url, data);
  },

  login(data) {
    const url = '/api/users/auth';
    return axiosClient.post(url, data);
  },

  getProfile() {
    const url = '/api/users/me';
    return axiosClient.get(url);
  },
  */
  register(data) {
    const url = "/users";
    return axiosClient.post(url, data);
  },

  // Giả lập login (check email + password)
  async login({ email, password }) {
    const users = await axiosClient.get(`/users?email=${email}`);
    const user = users[0];

    if (user && user.password === password) {
      return user; // ✅ trả về user object thật
    } else {
      throw new Error("Invalid email or password");
    }
  },

  getAllUsers: () => axiosClient.get("/users"),

};

export default userApi;
