import { configureStore } from "@reduxjs/toolkit";
import counterReducer from "../features/counter/counterSlice";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/user/userSlice";
import friendsReducer from "../features/friends/friendsSlice";
import expensesReducer from "../features/expense/expenseSlice";
import shareExpenseReducer from "../features/share-expense/shareExpenseSlice"; // rename import

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    auth: authReducer,
    user: userReducer,
    friends: friendsReducer,
    expenses: expensesReducer,       // your normal expenses
    shareExpense: shareExpenseReducer, // correct reducer for shared expenses
  },
});
