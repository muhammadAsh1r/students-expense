import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchExpenses,
  addExpense,
  deleteExpense,
  clearExpenseError,
} from "../features/expense/expenseSlice";
import axios from "axios";

const Expenses = () => {
  const dispatch = useDispatch();
  const {
    items: expenses,
    loading,
    error,
  } = useSelector((state) => state.expenses);
  const { user: currentUser } = useSelector((state) => state.auth); // optional: for highlighting shared
  const [friends, setFriends] = useState([]);
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    people_ids: [], // match backend
  });

  // ---------------- Fetch expenses ----------------
  useEffect(() => {
    dispatch(fetchExpenses());
  }, [dispatch]);

  // ---------------- Fetch friends ----------------
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await axios.get("https://students-expense.onrender.com/api/friends/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };
    fetchFriends();
  }, []);

  // ---------------- Clear error ----------------
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => dispatch(clearExpenseError()), 3000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // ---------------- Add expense ----------------
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!newExpense.title.trim() || Number(newExpense.amount) <= 0) return;

    dispatch(addExpense(newExpense));
    setNewExpense({ title: "", amount: "", people_ids: [] });
  };

  // ---------------- Delete expense ----------------
  const handleDeleteExpense = (id) => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      dispatch(deleteExpense(id));
    }
  };

  // ---------------- Handle people selection ----------------
  const handlePeopleChange = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setNewExpense({ ...newExpense, people_ids: selected });
  };

  // ---------------- JSX ----------------
  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Expenses</h1>

      {/* Add Expense Form */}
      <form
        onSubmit={handleAddExpense}
        className="flex flex-col gap-3 border-b border-gray-300 pb-4 mb-6"
      >
        <input
          type="text"
          placeholder="Enter expense (e.g., Dinner - Pizza)"
          value={newExpense.title}
          onChange={(e) =>
            setNewExpense({ ...newExpense, title: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <input
          type="number"
          placeholder="Amount"
          value={newExpense.amount}
          onChange={(e) =>
            setNewExpense({ ...newExpense, amount: e.target.value })
          }
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        />
        <select
          multiple
          value={newExpense.people_ids}
          onChange={handlePeopleChange}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
        >
          {friends.map((f) => (
            <option key={f.id} value={f.id}>
              {f.user.username}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition"
          disabled={loading}
        >
          Add
        </button>
      </form>

      {/* Loading & Error */}
      {loading && <p className="text-gray-500">Loading expenses...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Expense List */}
      <div className="space-y-4">
        {expenses
          .slice()
          .sort((a, b) => new Date(b.date) - new Date(a.date)) // newest first
          .map((expense) => {
            const isShared =
              expense.student.id !== currentUser?.student_profile?.id;
            return (
              <div
                key={expense.id}
                className={`flex justify-between items-center border-b border-gray-200 pb-2 ${
                  isShared ? "bg-yellow-50" : ""
                }`}
              >
                <div>
                  <span className="text-gray-800 font-semibold">
                    {expense.title}
                  </span>
                  {/* <p className="text-gray-500 text-sm">
                    Created by: {expense.student.user.username}{" "}
                    {isShared && "(shared)"}
                  </p> */}
                  <p className="text-gray-600 text-sm">
                    People:{" "}
                    {expense.people && expense.people.length > 0
                      ? expense.people
                          .map((p) => p.user?.username)
                          .filter(Boolean)
                          .join(", ")
                      : "None"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-green-600">
                    Rs {expense.amount}
                  </span>
                  {!isShared && (
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Expenses;
