import React from "react";
import { Menu } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  BookOutlined,
  DashboardOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  LikeOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import logoFull from "../../assets/logo_main.png";
import "./style.scss";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.current);
  const role = currentUser?.role || "USER";

  let menuItems = [];

  if (role === "STAFF") {
    menuItems = [
      {
        key: "/admin/bookingmanage",
        icon: <BookOutlined />,
        label: <Link to="/admin/bookingmanage">Bookings</Link>,
      },
      {
        key: "/admin/staffchecking",
        icon: <CheckCircleOutlined />,
        label: <Link to="/admin/staffchecking">Staff Checking</Link>,
      },
      {
        key: "/admin/vote",
        icon: <LikeOutlined />,
        label: <Link to="/admin/vote">Vote Management</Link>,
      },
      {
        key: "/admin/invoice",
        icon: <BookOutlined />,
        label: <Link to="/admin/invoice">Hóa đơn</Link>,
      },
    ];
  } else if (role === "USER") {
    menuItems = [
      {
        key: "/owner/mycar",
        icon: <HomeOutlined />,
        label: <Link to="/owner/mycar">Xe của tôi</Link>,
      },
      {
        key: "/owner/carbooking",
        icon: <CalendarOutlined />,
        label: <Link to="/owner/carbooking">Đặt xe</Link>,
      },
      {
        key: "/owner/invoice",
        icon: <FileTextOutlined />,
        label: <Link to="/owner/invoice">Hóa đơn</Link>,
      },
    ];
  }

  return (
    <div className="owner-sidebar">
      <div className="sidebar-logo" onClick={() => navigate("/")}>
        <img src={logoFull} alt="CoEV Logo" className="logo-img" />
      </div>

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
