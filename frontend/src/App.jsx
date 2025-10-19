import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { App as AntdApp } from "antd";
import ProtectedRoute from "./routes/ProtectedRoute";

import RegisterPage from "./pages/guest/auth/register";
import LoginPage from "./pages/guest/auth/login";
import HomePage from "./pages/guest/Home/HomePage"
import WhyChooseUs from "./pages/guest/Home/WhyChooseUs";
import OurTerms from "./pages/guest/Home/OurTerms";

import MyCarPage from "./pages/co-owner/MyCarPage";
import InvoicePage from "./pages/co-owner/InvoicePage";
import CarBooking from "./pages/co-owner/CarBooking";


import BookingManage from "./pages/admin/BookingManagement";
import InvoiceManagement from "./pages/admin/InvoiceManagement"

import DashboardLayout from "./components/layouts/Dashboard";
import GuestLayout from "./components/layouts/GuestLayout";


import TestVehicles from "./test";

const router = createBrowserRouter([
  { path: "/test", element: <TestVehicles /> },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "guest/login", element: <LoginPage /> },
      { path: "guest/register", element: <RegisterPage /> },
      { path: "guest/aboutus", element: <WhyChooseUs /> },
      { path: "guest/terms", element: <OurTerms /> },
    ],
  },
  {
    path: "/owner",
    element: (
      //<ProtectedRoute allowedRoles={["USER"]}>
      <DashboardLayout />
      //</ProtectedRoute>
    ),
    children: [
      { path: "mycar", element: <MyCarPage /> },
      { path: "carbooking", element: <CarBooking /> },
      { path: "carbooking/:vehicleId", element: <CarBooking /> },
      { path: "invoice", element: <InvoicePage /> },
    ],
  },
  {
    path: "/admin",
    element: (
      //<ProtectedRoute allowedRoles={["STAFF"]}>
      <DashboardLayout />
      //</ProtectedRoute>
    ),
    children: [
      { path: "bookingmanage", element: <BookingManage /> },
      { path: "invoice", element: <InvoiceManagement /> },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
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
