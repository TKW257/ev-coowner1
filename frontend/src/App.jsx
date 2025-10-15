import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { App as AntdApp } from "antd";
import ProtectedRoute from "./routes/ProtectedRoute";

<<<<<<< Updated upstream
import GuestPage from "./pages/guest";
import RegisterPage from "./pages/guest/auth/register";
import LoginPage from "./pages/guest/auth/login";
import MyCar from "./pages/co-owner/MyCar";
import CarBooking from "./pages/co-owner/CarBooking";
import BookingManage from "./pages/admin/BookingManagement";
=======
import HomePage from "./pages/guest/Home/HomePage";
import RegisterPage from "./pages/guest/auth/register";
import LoginPage from "./pages/guest/auth/login";

import MyCar from "./pages/co-owner/MyCar";
import CarBooking from "./pages/co-owner/CarBooking";
import VoteList from "./pages/co-owner/vote/VoteList";
import VoteDetail from "./pages/co-owner/vote/VoteDetail";

import AdminBookingManage from "./pages/admin/BookingManagement";
import VoteCreate from "./pages/admin/vote/VoteCreate";
import VoteListAdmin from "./pages/admin/vote/VoteListAdmin";
import VoteDetailAdmin from "./pages/admin/vote/VoteDetailAdmin";

>>>>>>> Stashed changes
import DashboardLayout from "./components/layouts/Dashboard";
import GuestLayout from "./components/layouts/GuestLayout";
import WhyChooseUs from "./pages/guest/Home/WhyChooseUs";
import OurTerms from "./pages/guest/Home/OurTerms";

const router = createBrowserRouter([
<<<<<<< Updated upstream
=======

  // Guest 
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

  // Owner 
>>>>>>> Stashed changes
  {
    path: "/owner",
    element: (
      //<ProtectedRoute allowedRoles={["USER"]}>
        <DashboardLayout />
      //</ProtectedRoute>
    ),
    children: [
      { path: "mycar", element: <MyCar /> },
      { path: "carbooking", element: <CarBooking /> },
      { path: "carbooking/:id", element: <CarBooking /> },
    ],
  },
<<<<<<< Updated upstream
=======

  // Admin 
>>>>>>> Stashed changes
  {
    path: "/admin",
    element: (
      //<ProtectedRoute allowedRoles={["STAFF"]}>
        <DashboardLayout />
      //</ProtectedRoute>
    ),
    children: [{ path: "bookingmanage", element: <BookingManage /> }],
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
