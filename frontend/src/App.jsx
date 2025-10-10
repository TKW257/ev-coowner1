// src/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// guest pages
import GuestPage from "./pages/guest";
import RegisterPage from "./pages/guest/auth/register";
import LoginPage from "./pages/guest/auth/login";

// owner pages
import MyCar from "./pages/co-owner/MyCar";
import CarBooking from "./pages/co-owner/CarBooking";

// layout
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
    element: <DashboardLayout />, // layout duy nhất
    children: [
      {
        path: "mycar",
        element: <MyCar />
      },
      {
        path: "carbooking",
        element: <CarBooking />,
      },
      {
        path: "carbooking/:id",
        element: <CarBooking />,
      },

    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
