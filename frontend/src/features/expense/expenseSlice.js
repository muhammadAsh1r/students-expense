// src/features/expense/expenseSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Base API URL
const API_URL = "http://127.0.0.1:8000/api/expenses/";

// ---------------- Helper for Auth Header ----------------
const authHeader = () => {
  const token = localStorage.getItem("access");
  return {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  };
};

// ---------------- Thunks ----------------

// Fetch all expenses
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get(API_URL, authHeader());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching expenses");
    }
  }
);

// Add a new expense
export const addExpense = createAsyncThunk(
  "expenses/addExpense",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axios.post(API_URL, data, authHeader());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error adding expense");
    }
  }
);

// Update an expense
export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(`${API_URL}${id}/`, updatedData, authHeader());
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error updating expense");
    }
  }
);

// Delete an expense
export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}${id}/`, authHeader());
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error deleting expense");
    }
  }
);

// ---------------- Slice ----------------
const expenseSlice = createSlice({
  name: "expenses",
  initialState: {
    items: [],
    fetchLoading: false,
    addLoading: false,
    updateLoading: false,
    deleteLoading: false,
    error: null,
  },
  reducers: {
    clearExpenseError: (state) => {
      state.error = null;
    },
    resetExpenses: (state) => {
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
      // -------- Fetch Expenses --------
      .addCase(fetchExpenses.pending, (state) => {
        state.fetchLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.fetchLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.fetchLoading = false;
        state.error = action.payload;
      })

      // -------- Add Expense --------
      .addCase(addExpense.pending, (state) => {
        state.addLoading = true;
        state.error = null;
      })
      .addCase(addExpense.fulfilled, (state, action) => {
        state.addLoading = false;
        state.items.push(action.payload);
      })
      .addCase(addExpense.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload;
      })

      // -------- Update Expense --------
      .addCase(updateExpense.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // -------- Delete Expense --------
      .addCase(deleteExpense.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter((e) => e.id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearExpenseError, resetExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;
