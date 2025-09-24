import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Notification from "../components/Notification";

const Expenses = () => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    payees: [],
  });

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePayeeChange = (e) => {
    const userId = parseInt(e.target.value);
    if (e.target.checked) {
      setFormData({
        ...formData,
        payees: [...formData.payees, userId],
      });
    } else {
      setFormData({
        ...formData,
        payees: formData.payees.filter((id) => id !== userId),
      });
    }
  };

  const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    setLoading(true);
    try {
      const expenseRes = await api.post("/expenses/", {
        title: formData.title,
        amount: formData.amount,
      });

      const expenseId = expenseRes.data.id;
      const totalParticipants = formData.payees.length + 1;
      const shareAmount = parseFloat(formData.amount) / totalParticipants;

      for (const payeeId of formData.payees) {
        await api.post(`/expenses/${expenseId}/shares/`, {
          payee: payeeId,
          amount: shareAmount.toFixed(2),
        });
      }

      // Reset form
      setFormData({ title: "", amount: "", payees: [] });

      // Show success notification
      setNotification({ type: "success", message: "Expense added successfully!" });
    } catch (err) {
      console.error("Failed to create expense/share:", err.response?.data || err);
      setNotification({ type: "error", message: "Failed to add expense. Try again!" });
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const res = await api.get("/friends/");
      const data = res.data.map((f) => ({
        ...f,
        _uniqueKey: f.id ?? uuidv4(),
      }));
      setFriends(data);
    } catch (err) {
      console.error("Failed to fetch friends:", err);
      setNotification({ type: "warning", message: "Failed to load friends" });
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const isFormValid =
    formData.title.trim() !== "" &&
    formData.amount.trim() !== "" &&
    parseFloat(formData.amount) > 0 &&
    formData.payees.length > 0;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-gray-100 rounded-2xl shadow-lg sm:mx-4">
      <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">
        Add Expense & Share
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Expense Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter expense title"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">Expense Amount</label>
          <input
            type="number"
            step="0.01"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter expense amount"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">Select Payees</label>
          <div className="space-y-2 max-h-40 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200">
            {friends.map((friend) => (
              <label key={friend._uniqueKey} className="flex items-center space-x-2 text-gray-700">
                <input
                  type="checkbox"
                  value={friend.user.id}
                  checked={formData.payees.includes(friend.user.id)}
                  onChange={handlePayeeChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500"
                />
                <span>{friend.user.username}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full py-2 rounded-lg font-medium transition ${
            isFormValid
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Saving..." : "Submit"}
        </button>
      </form>

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
          duration={4000}
        />
      )}
    </div>
  );
};

export default Expenses;
