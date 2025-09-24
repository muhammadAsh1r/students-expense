import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://students-expense.onrender.com/api/share-expenses/";

// ---------------- Helper ----------------
const authHeader = () => {
  const token = localStorage.getItem("access");
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
    },
  };
};

// ---------------- Thunks ----------------

// Fetch all share expenses
export const fetchShareExpenses = createAsyncThunk(
  "shareExpenses/fetchShareExpenses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(API_URL, authHeader());
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("Unauthorized – please log in again.");
      }
      return rejectWithValue(err.response?.data || "Error fetching share expenses");
    }
  }
);

// Add a share expense
export const addShareExpense = createAsyncThunk(
  "shareExpenses/addShareExpense",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(API_URL, data, authHeader());
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("Unauthorized – please log in again.");
      }
      return rejectWithValue(err.response?.data || "Error adding share expense");
    }
  }
);

// Update a share expense
export const updateShareExpense = createAsyncThunk(
  "shareExpenses/updateShareExpense",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`${API_URL}${id}/`, updatedData, authHeader());
      return res.data;
    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("Unauthorized – please log in again.");
      }
      return rejectWithValue(err.response?.data || "Error updating share expense");
    }
  }
);

// Delete a share expense
export const deleteShareExpense = createAsyncThunk(
  "shareExpenses/deleteShareExpense",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}${id}/`, authHeader());
      return id;
    } catch (err) {
      if (err.response?.status === 401) {
        return rejectWithValue("Unauthorized – please log in again.");
      }
      return rejectWithValue(err.response?.data || "Error deleting share expense");
    }
  }
);

// ---------------- Slice ----------------
const shareExpenseSlice = createSlice({
  name: "shareExpenses",
  initialState: {
    items: [],
    fetchLoading: false,
    addLoading: false,
    updateLoading: false,
    deleteLoading: false,
    error: null,
  },
  reducers: {
    clearShareExpenseError: (state) => {
      state.error = null;
    },
    resetShareExpenses: (state) => {
      state.items = [];
      state.error = null;
      state.fetchLoading = false;
      state.addLoading = false;
      state.updateLoading = false;
      state.deleteLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------------- Fetch ----------------
      .addCase(fetchShareExpenses.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchShareExpenses.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchShareExpenses.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload;
      })

      // ---------------- Add ----------------
      .addCase(addShareExpense.pending, (state) => {
        state.addLoading = true;
        state.error = null;
      })
      .addCase(addShareExpense.fulfilled, (state, action) => {
        state.addLoading = false;
        state.items.push(action.payload);
      })
      .addCase(addShareExpense.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload;
      })

      // ---------------- Update ----------------
      .addCase(updateShareExpense.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateShareExpense.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateShareExpense.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // ---------------- Delete ----------------
      .addCase(deleteShareExpense.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteShareExpense.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter((s) => s.id !== action.payload);
      })
      .addCase(deleteShareExpense.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearShareExpenseError, resetShareExpenses } = shareExpenseSlice.actions;
export default shareExpenseSlice.reducer;
