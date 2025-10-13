import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App as AntdApp } from "antd";
import ProtectedRoute from "./routes/ProtectedRoute";

import GuestPage from "./pages/guest";
import RegisterPage from "./pages/guest/auth/register";
import LoginPage from "./pages/guest/auth/login";
import MyCar from "./pages/co-owner/MyCar";
import CarBooking from "./pages/co-owner/CarBooking";
import BookingManage from "./pages/admin/BookingManagement";
import DashboardLayout from "./components/layouts/Dashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GuestPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/owner",
    element: (
      <ProtectedRoute allowedRoles={["USER"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "mycar", element: <MyCar /> },
      { path: "carbooking", element: <CarBooking /> },
      { path: "carbooking/:id", element: <CarBooking /> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["STAFF"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [{ path: "bookingmanage", element: <BookingManage /> }],
  },
]);

function App() {
  return (
    <AntdApp>
      <RouterProvider router={router} />
    </AntdApp>
  );
}

export default App;
