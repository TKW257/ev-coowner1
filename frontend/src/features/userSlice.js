import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import userApi from '../api/userApi';
import StorageKeys from '../constants/storage-key';


// 🧠 Async thunk: REGISTER
export const register = createAsyncThunk('user/register', async (payload) => {
  const data = await userApi.register(payload);

  // ✅ Lưu token & user vào localStorage (chuẩn bị cho backend thật)
  if (data.jwt && data.user) {
    localStorage.setItem(StorageKeys.TOKEN, data.jwt);
    localStorage.setItem(StorageKeys.USER, JSON.stringify(data.user));
    return data.user;
  }

  // fallback cho mockAPI (chưa có jwt)
  localStorage.setItem(StorageKeys.USER, JSON.stringify(data));
  return data;
});


// 🧠 Async thunk: LOGIN
export const login = createAsyncThunk('user/login', async (payload) => {
  const data = await userApi.login(payload);

  // ✅ Lưu token & user vào localStorage (chuẩn bị cho backend thật)
  if (data.jwt && data.user) {
    localStorage.setItem(StorageKeys.TOKEN, data.jwt);
    localStorage.setItem(StorageKeys.USER, JSON.stringify(data.user));
    return data.user;
  }

  // fallback cho mockAPI (chưa có jwt)
  localStorage.setItem(StorageKeys.USER, JSON.stringify(data));
  return data;
});


// 📦 Slice: Quản lý user
const userSlice = createSlice({
  name: 'user',
  initialState: {
    current: JSON.parse(localStorage.getItem(StorageKeys.USER)) || {},
    settings: {},
  },
  reducers: {
    logout(state) {
      localStorage.removeItem(StorageKeys.USER);
      localStorage.removeItem(StorageKeys.TOKEN);

      state.current = {};
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

export const { logout } = userSlice.actions;
export default userSlice.reducer;
