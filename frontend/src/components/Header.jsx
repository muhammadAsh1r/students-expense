import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react"; // ✅ Profile + Logout icons

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get login state from Redux
  const { isLoggedIn } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login"); // redirect after logout
  };

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* Left side: App logo + Expenses link */}
      <div className="flex items-center space-x-6">
        <Link to="/" className="text-xl font-bold hover:text-gray-300">
          My App
        </Link>
        <Link to="/expenses" className="hover:text-gray-300">
          Expenses
        </Link>
        <Link to="/friends" className="hover:text-gray-300">
          Friends
        </Link>
      </div>

      {/* Right side: Auth links */}
      {isLoggedIn ? (
        <div className="flex items-center space-x-6">
          <Link
            to="/profile"
            className="flex items-center space-x-2 hover:text-gray-300"
          >
            <User size={20} /> {/* ✅ Profile icon */}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 hover:text-gray-300"
          >
            <LogOut size={20} /> {/* ✅ Logout icon */}
          </button>
        </div>
      ) : (
        <Link to="/login" className="hover:text-gray-300">
          Login
        </Link>
      )}
    </nav>
  );
};

export default Header;
