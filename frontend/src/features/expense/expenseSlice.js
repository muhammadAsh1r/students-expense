import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://students-expense.onrender.com/api/expenses/";

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

// Fetch all expenses
export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL, authHeader());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error fetching expenses");
    }
  }
);

// Add expense
export const addExpense = createAsyncThunk(
  "expenses/addExpense",
  async (expenseData, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, expenseData, authHeader());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error adding expense");
    }
  }
);

// Update expense
export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async ({ id, updatedData }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}${id}/`, updatedData, authHeader());
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || "Error updating expense");
    }
  }
);

// Delete expense
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
const expensesSlice = createSlice({
  name: "expenses",
  initialState: {
    items: [],
    loading: false, // general loading
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
  },
  extraReducers: (builder) => {
    builder
      // ---------------- Fetch ----------------
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

      // ---------------- Add ----------------
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

      // ---------------- Update ----------------
      .addCase(updateExpense.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.items.findIndex((exp) => exp.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // ---------------- Delete ----------------
      .addCase(deleteExpense.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.items = state.items.filter((exp) => exp.id !== action.payload);
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearExpenseError } = expensesSlice.actions;
export default expensesSlice.reducer;
