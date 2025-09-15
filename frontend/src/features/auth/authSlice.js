import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
const API_URL = "https://students-expense.onrender.com/api/";

// --------------------
// Async Thunks
// --------------------

// Signup
export const signupUser = createAsyncThunk(
  "auth/signupUser",
  async ({ username, email, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}register/`, {
        username,
        email,
        password,
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Signup failed");
    }
  }
);

// Login
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ username, password }, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}login/`, {
        username,
        password,
      });
      // Save tokens locally
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Login failed");
    }
  }
);

// Logout
// Logout
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    const refreshToken = localStorage.getItem("refresh");
    const accessToken = localStorage.getItem("access");

    try {
      if (refreshToken) {
        await axios.post(
          `${API_URL}logout/`,
          { refresh: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`, // include access token
            },
          }
        );
      }

      // Clear tokens locally no matter what
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return true;
    } catch (err) {
      // Still clear tokens even if logout API fails
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      console.warn(
        "Logout API failed, but tokens cleared:",
        err.response?.data
      );
      return rejectWithValue(err.response?.data || "Logout failed");
    }
  }
);

// --------------------
// Slice
// --------------------
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isLoggedIn: !!localStorage.getItem("access"),
  },
  reducers: {},
  extraReducers: (builder) => {
    // Signup
    builder
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoggedIn = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoggedIn = false;
        state.user = null;
        state.error = action.payload;
      });
  },
});

export default authSlice.reducer;
