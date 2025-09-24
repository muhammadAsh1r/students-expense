import React, { useEffect, useState } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const Expenses = () => {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    payees: [],
  });

  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

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
    baseURL: "https://students-expense.onrender.com/api",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (err) {
      console.error("Failed to create expense/share:", err.response?.data || err);
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
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  // Validate form: title, amount, and at least one payee must be filled
  const isFormValid =
    formData.title.trim() !== "" &&
    formData.amount.trim() !== "" &&
    formData.payees.length > 0;

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-green-600 mb-6 text-center">
        Add Expense & Share
      </h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Expense Title */}
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

        {/* Expense Amount */}
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

        {/* Payees */}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || loading} // disable if form invalid or loading
          className={`w-full py-2 rounded-lg font-medium transition ${
            isFormValid
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? "Saving..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default Expenses;
