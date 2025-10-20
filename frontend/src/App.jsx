import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { App as AntdApp } from "antd";
import ProtectedRoute from "./routes/ProtectedRoute";

// ===== Guest Pages =====
import RegisterPage from "./pages/guest/auth/register";
import LoginPage from "./pages/guest/auth/login";
import HomePage from "./pages/guest/Home/HomePage";
import WhyChooseUs from "./pages/guest/Home/WhyChooseUs";
import OurTerms from "./pages/guest/Home/OurTerms";
import GuestLayout from "./components/layouts/GuestLayout";

// ===== Owner Pages =====
import MyCar from "./pages/co-owner/MyCar";
import CarBooking from "./pages/co-owner/CarBooking";
import OwnerVoteListPage from "./pages/co-owner/votes/OwnerVoteListPage";

// ===== Admin Pages =====
import BookingManage from "./pages/admin/BookingManagement";
import StaffCheckingManage from "./pages/admin/StaffCheckingManagement";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVoteListPage from "./pages/admin/BookingManagement/votes/AdminVoteListPage";
import AdminCreateTopicPage from "./pages/admin/BookingManagement/votes/AdminCreateTopicPage";
import TopicDetailPage from "./pages/admin/BookingManagement/votes/TopicDetailPage";
import DashboardLayout from "./components/layouts/Dashboard";

// ===== Test =====
import TestVehicles from "./test";

// ===== Router =====
const router = createBrowserRouter([
  { path: "/test", element: <TestVehicles /> },

  // ===== GUEST =====
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

  // ===== OWNER =====
  {
    path: "/owner",
    element: <DashboardLayout />,
    children: [
      { path: "mycar", element: <MyCar /> },
      { path: "carbooking", element: <CarBooking /> },
      { path: "carbooking/:vehicleId", element: <CarBooking /> },
      { path: "vote", element: <OwnerVoteListPage /> },
    ],
  },

  // ===== ADMIN =====
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "bookingmanage", element: <BookingManage /> },
      { path: "staffchecking", element: <StaffCheckingManage /> },

      // Vote pages for Admin
      { path: "vote", element: <AdminVoteListPage /> },
      { path: "vote/create", element: <AdminCreateTopicPage /> },
      { path: "vote/:id", element: <TopicDetailPage /> },
    ],
  },

  // ===== 404 Redirect =====
  { path: "*", element: <Navigate to="/" replace /> },
]);

// ===== App =====
function App() {
  return (
    <AntdApp>
      <RouterProvider router={router} />
    </AntdApp>
  );
}

export default App;
