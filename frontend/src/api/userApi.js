import axiosClient from "./axiosClient";

const userApi = {

  getAll() {
    const url = "/users";
    return axiosClient.get(url);
  },

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
};

export default userApi;
