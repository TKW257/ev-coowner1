import React from "react";
import { Menu } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  BookOutlined,
  DashboardOutlined,
  FileAddOutlined,
} from "@ant-design/icons";
import { HomeOutlined, CalendarOutlined, BookOutlined, DashboardOutlined, } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logoFull from "../../assets/logo_main.png";
import "./style.scss";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 🧠 Lấy role từ redux hoặc localStorage
  const currentUser = useSelector((state) => state.user.current) || {};
  // 🧠 Lấy role từ localStorage
  const currentUser = useSelector((state) => state.user.current);
  const role = currentUser.role || "OWNER";

  let menuItems = [];

  // 🧩 Dùng if/else để gán menu theo role
  if (role === "ADMIN" || role === "STAFF") {
  if (role === "ADMIN") {
    menuItems = [
      {
        key: "/admin/bookingmanage",
        icon: <BookOutlined />,
        label: <Link to="/admin/bookingmanage">Booking Management</Link>,
      },
      {
        key: "/admin/createvote",
        icon: <FileAddOutlined />,
        label: <Link to="/admin/createvote">Create Vote</Link>,
      },
      {
        key: "/admin/viewvote",
        icon: <FileAddOutlined />,
        label: <Link to="/admin/viewvote">View Vote</Link>,
        label: <Link to="/admin/bookingmanage"> Bookings</Link>,
      },
    ];
  } else if (role === "OWNER") {
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
      {
        key: "/owner/vote",
        icon: <DashboardOutlined />,
        label: <Link to="/owner/vote">Vote</Link>,
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
