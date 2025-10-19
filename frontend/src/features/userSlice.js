import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import userApi from "../api/userApi";
import StorageKeys from "../constants/storage-key";

/* 🟢 Hàm tiện ích lưu token + user */
const saveAuthData = (token, user) => {
  if (token) localStorage.setItem(StorageKeys.TOKEN, token);
  localStorage.setItem(StorageKeys.USER, JSON.stringify(user));
  console.log("✅ Lưu token:", token?.substring(0, 40) + "...");
  console.log("✅ Lưu user:", user);
};

/* 🧠 REGISTER */
export const register = createAsyncThunk("users/register", async (payload) => {
  const data = await userApi.register(payload);
  const token = data.jwt || data.token;
  const user = data.user || data;

  saveAuthData(token, user);
  return user;
});

/* 🧠 LOGIN */
export const login = createAsyncThunk("users/login", async (payload) => {
  const data = await userApi.login(payload);
  const token = data.jwt || data.token;
  const user = data.user || data;

  // Xóa token cũ trước khi lưu token mới
  localStorage.removeItem(StorageKeys.TOKEN);
  localStorage.removeItem(StorageKeys.USER);
  saveAuthData(token, user);

  return user;
});

/* 📦 SLICE */
const userSlice = createSlice({
  name: "user",
  initialState: {
    current: JSON.parse(localStorage.getItem(StorageKeys.USER)) || {},
    settings: {},
  },
  reducers: {
    logout(state) {
      console.log("🔴 Logout");
      localStorage.removeItem(StorageKeys.USER);
      localStorage.removeItem(StorageKeys.TOKEN);
      state.current = {};
    },
    reloadUser(state) {
      const storedUser = JSON.parse(localStorage.getItem(StorageKeys.USER));
      state.current = storedUser || {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.current = action.payload;
      });
  },
});

export const { logout, reloadUser } = userSlice.actions;
export default userSlice.reducer;
