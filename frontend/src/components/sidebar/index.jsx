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
  CarOutlined,
  UserOutlined,
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
        key: "/admin",
        icon: <DashboardOutlined />,
        label: <Link to="/admin">Bảng Điều Khiển</Link>,
      },
      {
        key: "/admin/users",
        icon: <UserOutlined />,
        label: <Link to="/admin/users">Quản Lý Người Dùng</Link>,
      },
      {
        key: "/admin/vehicles",
        icon: <CarOutlined />,
        label: <Link to="/admin/vehicles">Quản Lý Xe</Link>,
      },

      {
        key: "/admin/vote",
        icon: <LikeOutlined />,
        label: <Link to="/admin/vote">Bình Chọn</Link>,
      },
      {
        key: "/admin/bookingmanage",
        icon: <BookOutlined />,
        label: <Link to="/admin/bookingmanage">Quản Lý Đặt Xe</Link>,
      },
      {
        key: "/admin/staffchecking",
        icon: <CheckCircleOutlined />,
        label: <Link to="/admin/staffchecking">Biên bản giao nhận xe</Link>,
      },
      {
        key: "/admin/invoice",
        icon: <FileTextOutlined />,
        label: <Link to="/admin/invoice">Quản Lý Hóa Đơn</Link>,
      },
    ];
  } else if (role === "USER") {
    menuItems = [
      {
        key: "mycar",
        icon: <HomeOutlined />,
        label: <Link to="/owner/mycar">Xe Của Tôi</Link>,
      },
      {
        key: "booking",
        icon: <CalendarOutlined />,
        label: <Link to="/owner/carbooking">Đặt Xe</Link>,
      },
      {
        key: "/owner/vote",
        icon: <LikeOutlined />,
        label: <Link to="/owner/vote">Bình Chọn</Link>,
      },
      {
        key: "invoice",
        icon: <FileTextOutlined />,
        label: <Link to="/owner/invoice">Hóa Đơn</Link>,
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
