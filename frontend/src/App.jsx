import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { App as AntdApp } from "antd";
import ProtectedRoute from "./routes/ProtectedRoute";

// --- Guest pages ---
import GuestPage from "./pages/guest";
import RegisterPage from "./pages/guest/auth/register";
import LoginPage from "./pages/guest/auth/login";

// --- Co-owner pages ---
import MyCar from "./pages/co-owner/MyCar";
import CarBooking from "./pages/co-owner/CarBooking";
import VoteList from "./pages/co-owner/vote/VoteList";
import VoteDetail from "./pages/co-owner/vote/VoteDetail";

// --- Admin / Staff pages ---
import AdminBookingManage from "./pages/admin/BookingManagement";
import VoteCreate from "./pages/admin/vote/VoteCreate";
import VoteListAdmin from "./pages/admin/vote/VoteListAdmin";
import VoteDetailAdmin from "./pages/admin/vote/VoteDetailAdmin";

// --- Layout ---
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
      <ProtectedRoute allowedRoles={["USER"]}>
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

  // --- Admin / Staff routes ---
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "createvote", element: <VoteCreate /> },
      { path: "bookingmanage", element: <AdminBookingManage /> },
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
