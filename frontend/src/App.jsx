import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App as AntdApp } from "antd";
import ProtectedRoute from "./routes/ProtectedRoute";

import GuestPage from "./pages/guest";
import RegisterPage from "./pages/guest/auth/register";
import LoginPage from "./pages/guest/auth/login";

// 👇 Co-owner
import MyCar from "./pages/co-owner/MyCar";
import CarBooking from "./pages/co-owner/CarBooking";
import VoteDetail from "./pages/co-owner/vote/VoteDetail";
import VoteList from "./pages/co-owner/vote/VoteList";
import VoteListAdmin from "./pages/admin/vote/VoteListAdmin";

// 👇 Admin / Staff
import AdminBookingManage from "./pages/admin/BookingManagement";
import VoteCreate from "./pages/admin/vote/VoteCreate";
import VoteDetailAdmin from "./pages/admin/vote/VoteDetailAdmin";

// Layout
import DashboardLayout from "./components/layouts/Dashboard";

const router = createBrowserRouter([
  // --- Guest routes ---
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

  // --- Owner routes ---
  {
    path: "/owner",
    element: (
      <ProtectedRoute allowedRoles={["OWNER"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "mycar", element: <MyCar /> },
      { path: "carbooking", element: <CarBooking /> },
      { path: "carbooking/:id", element: <CarBooking /> },
      { path: "vote", element: <VoteList /> },
      { path: "vote/:id", element: <VoteDetail /> },
    ],
  },

  // --- Admin/Staff routes ---
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "createvote", element: <VoteCreate /> },
      { path: "bookingmanage", element: <AdminBookingManage /> }, // ✅ thêm route này
      { path: "vote/:id", element: <VoteDetailAdmin /> },
      { path: "viewvote", element: <VoteListAdmin /> },
    ],
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
