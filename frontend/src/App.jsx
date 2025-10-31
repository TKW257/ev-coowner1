import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { App as AntdApp } from "antd";

// ===== Layouts =====
import DashboardLayout from "./components/layouts/Dashboard";
import GuestLayout from "./components/layouts/GuestLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

// ===== Guest Pages =====
import RegisterPage from "./pages/guest/auth/register";
import LoginPage from "./pages/guest/auth/login";
import HomePage from "./pages/guest/Home/HomePage";
import WhyChooseUs from "./pages/guest/Home/WhyChooseUs";
import OurTerms from "./pages/guest/Home/OurTerms";
import StockCarsPage from "./pages/guest/StockCarsPage";

// ===== Owner Pages =====
import MyCarPage from "./pages/co-owner/MyCarPage";
import BookingPage from "./pages/co-owner/BookingPage";
import BookingTrackingPage from "./pages/co-owner/BookingTrackingPage"
import InvoicePage from "./pages/co-owner/InvoicePage";
import SuccessPage from "./pages/co-owner/SucessPage";
import VotingtPage from "./pages/co-owner/VotingPage";
import ProfilePage from "./pages/co-owner/ProfilePage";

// ===== Admin Pages =====
import AdminDashboard from "./pages/admin/AdminDashboard";
import BookingManage from "./pages/admin/BookingManagement";
import StaffCheckingManage from "./pages/admin/StaffCheckingManagement";
import VehicleManagement from "./pages/admin/VehicleManagement";
import UserManagement from "./pages/admin/UserManagement";
import InvoiceManagement from "./pages/admin/InvoiceManagement";

import AdminVoteListPage from "./pages/admin/VotesManagement/AdminVoteListPage";
import AdminCreateTopicPage from "./pages/admin/VotesManagement/AdminCreateTopicPage";
import TopicDetailPage from "./pages/admin/VotesManagement/TopicDetailPage";

// ===== Router Configuration =====
const router = createBrowserRouter([
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
      { path: "guest/stockcars", element: <StockCarsPage /> },
    ],
  },

  // ===== OWNER =====
  {
    path: "/owner",
    element: (
      // <ProtectedRoute allowedRoles={["USER"]}>
      <DashboardLayout />
      // </ProtectedRoute>
    ),
    children: [
      { path: "profile", element: <ProfilePage /> },
      { path: "mycar", element: <MyCarPage /> },
      { path: "bookingtracking", element: <BookingTrackingPage /> },
      { path: "carbooking/:vehicleId", element: <BookingPage /> },
      { path: "carbooking", element: <BookingPage /> },
      { path: "invoice", element: <InvoicePage /> },
      { path: "success", element: <SuccessPage /> },
      { path: "vote", element: <VotingtPage /> },
    ],
  },

  // ===== ADMIN =====
  {
    path: "/admin",
    element: (
      // <ProtectedRoute allowedRoles={["ADMIN", "STAFF"]}>
      <DashboardLayout />
      // </ProtectedRoute>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "bookingmanage", element: <BookingManage /> },
      { path: "staffchecking", element: <StaffCheckingManage /> },
      { path: "vehicles", element: <VehicleManagement /> },
      { path: "users", element: <UserManagement /> },
      { path: "invoice", element: <InvoiceManagement /> },

      // Votes Management
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
