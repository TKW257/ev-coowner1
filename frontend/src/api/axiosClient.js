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
  console.log("🌐 Making API request to:", config.url);
  console.log("🔑 Token exists:", !!token);
  console.log("🔑 Token preview:", token ? token.substring(0, 20) + "..." : "No token");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("✅ Bearer token added to headers");
  } else {
    console.log("⚠️ No token found in localStorage");
    console.log("⚠️ Available localStorage keys:", Object.keys(localStorage));
  }
  
  console.log("📤 Request config:", {
    url: config.url,
    method: config.method,
    headers: {
      ...config.headers,
      Authorization: config.headers.Authorization ? "Bearer [HIDDEN]" : undefined
    }
  });
  
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    console.log("📥 API Response received:", {
      url: response.config.url,
      status: response.status,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      dataLength: Array.isArray(response.data) ? response.data.length : 'N/A'
    });
    console.log("📋 Response data preview:", response.data);
    return response.data;
  },
  (error) => {
    console.error("❌ API Error occurred:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    throw error;
  }
);

export default axiosClient;
