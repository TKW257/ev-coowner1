import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import userApi from '../api/userApi';
import StorageKeys from '../constants/storage-key';

// Async thunk: REGISTER
export const register = createAsyncThunk('users/register', async (payload) => {
  const data = await userApi.register(payload);

  const token = data.jwt || data.token;
  const user = data.user || data;

  if (token) localStorage.setItem(StorageKeys.TOKEN, token);
  localStorage.setItem(StorageKeys.USER, JSON.stringify(user));

  return user;
});

// Async thunk: LOGIN
export const login = createAsyncThunk('users/login', async (payload) => {
  const data = await userApi.login(payload);

  const token = data.jwt || data.token;
  const user = data.user || data;

  if (token) localStorage.setItem(StorageKeys.TOKEN, token);
  localStorage.setItem(StorageKeys.USER, JSON.stringify(user));

  return user;
});

// Slice: Quản lý user
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
      console.log("logout");
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
