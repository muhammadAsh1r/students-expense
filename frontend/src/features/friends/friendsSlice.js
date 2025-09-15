import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://students-expense.onrender.com/api"; // backend URL

// --------------------------
// Async Thunks
// --------------------------

// Fetch all friends
export const fetchFriends = createAsyncThunk(
  "friends/fetchFriends",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access");
      const response = await axios.get(`${API_URL}/friends/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching friends");
    }
  }
);

// Add friend by username
export const addFriend = createAsyncThunk(
  "friends/addFriend",
  async (username, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access");
      const response = await axios.post(
        `${API_URL}/friends/add/`, // ✅ endpoint matches backend
        { username },              // ✅ send username in body
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // should return friend object
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error adding friend");
    }
  }
);

// Remove friend by id
export const removeFriend = createAsyncThunk(
  "friends/removeFriend",
  async (id, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("access");
      await axios.delete(`${API_URL}/friends/remove/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error removing friend");
    }
  }
);

// --------------------------
// Slice
// --------------------------

const friendsSlice = createSlice({
  name: "friends",
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearFriendsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch friends
      .addCase(fetchFriends.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFriends.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.map(
          (f) => (f.user ? f : { user: f }) // normalize if backend returns username directly
        );
      })
      .addCase(fetchFriends.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add friend
      .addCase(addFriend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addFriend.fulfilled, (state, action) => {
        state.loading = false;
        const friend = action.payload;
        state.list.push(friend.user ? friend : { user: friend });
      })
      .addCase(addFriend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove friend
      .addCase(removeFriend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFriend.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter((f) => f.id !== action.payload);
      })
      .addCase(removeFriend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFriendsError } = friendsSlice.actions;
export default friendsSlice.reducer;
