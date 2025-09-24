import React, { useEffect, useState } from "react";
import axios from "axios";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: "https://students-expense.onrender.com/api",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("access")}`,
    },
  });

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: expensesData } = await api.get("/expenses/");

      const withShares = await Promise.all(
        expensesData.map(async (exp) => {
          try {
            const { data: shares } = await api.get(`/expenses/${exp.id}/shares/`);
            return { ...exp, shares };
          } catch {
            return { ...exp, shares: [] };
          }
        })
      );

      setExpenses(withShares);
    } catch (err) {
      setError(err.response?.data || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 border-b pb-3">
        All Expenses
      </h2>

      {loading && (
        <p className="text-gray-500 text-center">Loading expenses...</p>
      )}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {!loading && !error && expenses.length === 0 && (
        <p className="text-gray-500 text-center">No expenses yet.</p>
      )}

      <div className="space-y-6">
        {!loading &&
          !error &&
          expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white shadow-md rounded-xl p-6 border border-gray-100"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {exp.title}
                </h3>
                <span className="text-green-600 font-bold text-lg">
                  ${exp.amount}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-2">
                Created: {new Date(exp.created_at).toLocaleString()}
              </p>
              <p className="text-gray-700 italic mb-4">
                Paid by <strong>{exp.payer_username}</strong>
              </p>

              <div>
                <h4 className="text-sm font-semibold text-gray-600 mb-2">
                  Shares
                </h4>
                <ul className="space-y-2">
                  {exp.shares.length === 0 ? (
                    <li className="text-gray-500">No payees</li>
                  ) : (
                    exp.shares.map((share) => (
                      <li
                        key={share.id}
                        className="flex justify-between items-center border-b border-gray-100 pb-2"
                      >
                        <span className="font-medium text-gray-800">
                          {share.payee_username}
                        </span>
                        <span className="text-green-600 font-semibold">
                          ${share.amount}
                        </span>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Expenses;
