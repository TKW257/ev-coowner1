import axios from "axios";
import StorageKeys from "../constants/storage-key";

const axiosClient = axios.create({
  baseURL: "https://vallate-enzootically-sterling.ngrok-free.dev/api",
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
  (response) => {
    return response.data;
  },
  (error) => {
    console.error("API Error:", error.response?.status, error.config?.url);
    throw error;
  }
);

export default axiosClient;
