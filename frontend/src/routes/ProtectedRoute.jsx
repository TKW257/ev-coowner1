import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import StorageKeys from "../constants/storage-key";


const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.user.current);

  // 🧩 MOCK MODE: Chỉ kiểm tra user trong Redux hoặc localStorage
  if (!user || !user.email) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;

  // Kiểm tra quyền truy cập
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;

  /* 
  🧱 BACKEND MODE (dùng khi đã có API thật + JWT)
  -------------------------------------------------
  const token = localStorage.getItem(StorageKeys.TOKEN);

  if (!token || !user?.email) {
    return <Navigate to="/login" replace />;
  }

  const role = user.role;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
  */
};

export default ProtectedRoute;
