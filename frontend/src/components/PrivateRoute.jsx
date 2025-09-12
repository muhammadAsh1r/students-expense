import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const accessToken = localStorage.getItem("access"); // check if user is logged in

  if (!accessToken) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  // Logged in → show the requested page
  return children;
};

export default PrivateRoute;
