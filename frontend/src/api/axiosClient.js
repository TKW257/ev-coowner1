import axios from "axios";
import StorageKeys from "../constants/storage-key";

const axiosClient = axios.create({
<<<<<<< HEAD
  baseURL: "http://localhost:3000",
=======
  baseURL: "https://vallate-enzootically-sterling.ngrok-free.dev/api",
>>>>>>> f97cf661 (up)
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true"
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

axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    throw error;
  }
);

export default axiosClient;
