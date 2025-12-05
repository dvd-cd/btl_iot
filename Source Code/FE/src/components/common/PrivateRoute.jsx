// src/components/common/PrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, roles }) => {
  // const token = localStorage.getItem("accessToken");
  // const role = localStorage.getItem("role"); // "admin" | "user"

  // if (!token) return <Navigate to="/login" replace />;

  // if (roles && !roles.includes(role)) return <Navigate to="/login" replace />;

  return children;
};

export default PrivateRoute;
