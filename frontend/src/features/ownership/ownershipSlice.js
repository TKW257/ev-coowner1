import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import ownershipAPI from "../../api/ownershipApi";

// ✅ Action lấy danh sách ownership của user
export const fetchMyOwnerships = createAsyncThunk(
  "ownership/fetchMyOwnerships",
  async (_, { rejectWithValue }) => {
    try {
      const data = await ownershipAPI.getMyOwnerships();
      return data; // axiosClient đã trả sẵn response.data, không cần .data nữa
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const ownershipSlice = createSlice({
  name: "ownership",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOwnerships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOwnerships.fulfilled, (state, action) => {
        state.loading = false;
        state.list = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchMyOwnerships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi không xác định";
      });
  },
});

export default ownershipSlice.reducer;
