import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import StorageKeys from "../constants/storage-key";
import * as jwtDecode from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.user.current);
  const token = localStorage.getItem(StorageKeys.TOKEN) || user?.token;

  if (!token) {
    return <Navigate to="/guest/login" replace />;
  }

  let role = null;
  try {
    const decoded = jwtDecode.default(token); 
    role = decoded.role;
  } catch {
    role = user?.role; 
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;
