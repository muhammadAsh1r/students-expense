import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { User, Lock } from "lucide-react"; // ✅ Input icons

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const resultAction = await dispatch(loginUser(formData));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate("/"); // ✅ Redirect after login
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-amber-400">
      <form
        onSubmit={handleSubmit}
        className="bg-white/80 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-96 border border-gray-200"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Welcome Back
        </h2>

        {error && (
          <p className="text-red-600 text-sm mb-3 text-center font-medium">
            {typeof error === "string" ? error : "Invalid username or password"}
          </p>
        )}

        {/* Username Input */}
        <div className="flex items-center border border-gray-300 rounded-lg mb-4 px-3 focus-within:ring-2 focus-within:ring-green-600">
          <User size={18} className="text-gray-500 mr-2" />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full p-3 outline-none bg-transparent"
          />
        </div>

        {/* Password Input */}
        <div className="flex items-center border border-gray-300 rounded-lg mb-4 px-3 focus-within:ring-2 focus-within:ring-green-600">
          <Lock size={18} className="text-gray-500 mr-2" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 outline-none bg-transparent"
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 active:scale-95 transition-transform"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Signup Redirect */}
        <p className="text-sm text-gray-600 text-center mt-5">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-amber-500 font-semibold hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
