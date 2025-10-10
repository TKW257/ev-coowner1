import axios from "axios";
import StorageKeys from "../constants/storage-key";

const axiosClient = axios.create({
  baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json"
  },
});

// Request Interceptor: tự động thêm token
axiosClient.interceptors.request.use(async (config) => {
  const token = localStorage.getItem(StorageKeys.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: trả luôn data hoặc reject lỗi
axiosClient.interceptors.response.use((response) => {
  if (response && response.data) {
    return response.data;
  }

  return response;
}, (error) => {
  throw error;
});

export default axiosClient;
