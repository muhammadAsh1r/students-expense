import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Menu, X, Users, Receipt, CreditCard } from "lucide-react";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((state) => state.auth);

  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <>
      {/* Desktop Header */}
      <nav className="hidden md:flex bg-white shadow-md px-6 py-4 justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-green-600 hover:text-green-700 transition"
        >
          My App
        </Link>

        <div className="flex items-center space-x-6 text-gray-700">
          <Link to="/expenses" className="hover:text-green-600 transition">
            Expenses
          </Link>
          <Link to="/friends" className="hover:text-green-600 transition">
            Friends
          </Link>
          <Link to="/shared-expense" className="hover:text-green-600 transition">
            Shared
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="flex items-center space-x-1 text-gray-700 hover:text-green-600 transition"
              >
                <User size={20} />
                <span>Profile</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 text-gray-700 hover:text-amber-500 transition"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              Login
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      {isLoggedIn && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t flex justify-around py-2 z-50">
          <Link
            to="/expenses"
            className="flex flex-col items-center text-gray-700 hover:text-green-600 transition"
          >
            <Receipt size={22} />
            <span className="text-xs">Expenses</span>
          </Link>

          <Link
            to="/shared-expense"
            className="flex flex-col items-center text-gray-700 hover:text-green-600 transition"
          >
            <CreditCard size={22} />
            <span className="text-xs">Shared</span>
          </Link>

          {/* More Menu */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="flex flex-col items-center text-gray-700 hover:text-amber-500 transition"
          >
            {moreOpen ? <X size={22} /> : <Menu size={22} />}
            <span className="text-xs">More</span>
          </button>
        </div>
      )}

      {/* Expandable "More" Panel */}
      {moreOpen && (
        <div className="md:hidden fixed bottom-14 left-0 right-0 bg-gray-100 shadow-lg rounded-t-xl p-4 space-y-3 z-40">
          <Link
            to="/friends"
            className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition"
            onClick={() => setMoreOpen(false)}
          >
            <Users size={20} />
            <span>Friends</span>
          </Link>
          <Link
            to="/profile"
            className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition"
            onClick={() => setMoreOpen(false)}
          >
            <User size={20} />
            <span>Profile</span>
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setMoreOpen(false);
            }}
            className="flex items-center space-x-2 text-gray-700 hover:text-amber-500 transition"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </>
  );
};

export default Header;
