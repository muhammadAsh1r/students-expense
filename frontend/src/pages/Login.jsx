import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";

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
      navigate("/"); // redirect after login
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-600 via-green-500 to-amber-400">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-200"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-700">
          Login
        </h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">
            {JSON.stringify(error)}
          </p>
        )}

        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
        />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Password"
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-green-600 outline-none"
        />

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-gray-600 text-center mt-5">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-amber-500 font-medium hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
