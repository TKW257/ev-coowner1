import React from "react";
import { Menu } from "antd";
import { HomeOutlined, CalendarOutlined, BookOutlined, DashboardOutlined, } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logoFull from "../../assets/logo_main.png";
import "./style.scss";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🧠 Lấy role từ localStorage
  const currentUser = useSelector((state) => state.user.current);
  const role = currentUser.role || "USER";

  let menuItems = [];

  // 🧩 Dùng if/else để gán menu theo role
  if (role === "STAFF") {
    menuItems = [
      {
        key: "/admin/bookingmanage",
        icon: <BookOutlined />,
        label: <Link to="/admin/bookingmanage"> Bookings</Link>,
      },
    ];
  } else if (role === "USER") {
    menuItems = [
      {
        key: "/owner/mycar",
        icon: <HomeOutlined />,
        label: <Link to="/owner/mycar">My Car</Link>,
      },
      {
        key: "/owner/carbooking",
        icon: <CalendarOutlined />,
        label: <Link to="/owner/carbooking">Book Cars</Link>,
      },
    ];
  }

  return (
    <div className="owner-sidebar">
      {/* Logo */}
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <img src={logoFull} alt="CoEV Logo" className="logo-img" />
      </div>

      {/* Menu */}
      <div className="menu-wrapper">
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[location.pathname]}
          className="menu"
          items={menuItems}
        />
      </div>
    </div>
  );
};

export default Sidebar;
