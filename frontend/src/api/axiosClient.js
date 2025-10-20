import axios from "axios";
import StorageKeys from "../constants/storage-key";

const axiosClient = axios.create({
  baseURL: "https://vallate-enzootically-sterling.ngrok-free.dev/api",
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
  },
});

// ✅ Thêm token vào mọi request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(StorageKeys.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Token attached:", config.headers.Authorization);
    } else {
      console.warn("⚠️ No token found in localStorage");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Log lỗi 403
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 403) {
      console.error(
        "🚫 Forbidden (403) — likely role or token issue",
        error.response
      );
    }
    throw error;
  }
);

export default axiosClient;
