import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-500 to-amber-400 flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 text-white">
        <h1 className="text-5xl font-extrabold drop-shadow-lg mb-4">
          Expense Tracker
        </h1>
        <p className="text-lg max-w-2xl mb-10 opacity-90">
          Track your expenses, split bills with friends, and stay in control of
          your budget — all in one place.
        </p>

        <Link
          to="/expenses"
          className="flex items-center gap-2 bg-white text-green-600 font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 hover:bg-gray-100 transition"
        >
          Go to Expenses <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Features Section */}
      <section className="bg-white rounded-t-3xl shadow-lg px-6 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          What You Can Do
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          {/* Feature 1 */}
          <div className="p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              ➕ Add Expenses
            </h3>
            <p className="text-gray-600">
              Log daily expenses with details like category, amount, and notes.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-amber-500 mb-2">
              📊 Reports & Insights
            </h3>
            <p className="text-gray-600">
              Visualize your spending patterns with clear breakdowns and charts.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-green-600 mb-2">
              👥 Share with Friends
            </h3>
            <p className="text-gray-600">
              Split expenses fairly, track shared bills, and avoid confusion.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-6 bg-gray-50 rounded-2xl shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-amber-500 mb-2">
              🔒 Secure & Private
            </h3>
            <p className="text-gray-600">
              Your data stays safe with authentication and encryption.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
