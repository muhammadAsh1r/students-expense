import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// const API_URL = "http://127.0.0.1:8000/api/";
const API_URL = "https://students-expense.onrender.com/api/";

// Fetch profile
export const fetchStudentProfile = createAsyncThunk(
  "user/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access");
      const response = await axios.get(`${API_URL}profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to fetch profile");
    }
  }
);

// Update profile
export const updateStudentProfile = createAsyncThunk(
  "user/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access");
      const response = await axios.patch(
        `${API_URL}profile/update/`,
        profileData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Failed to update profile");
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentStudent: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStudent = action.payload; // automatically update Redux
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default userSlice.reducer;
