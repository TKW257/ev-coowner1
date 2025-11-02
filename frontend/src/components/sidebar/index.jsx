import React from "react";
import { Menu } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  BookOutlined,
  DashboardOutlined,
  FileTextOutlined,
  PieChartOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  LikeOutlined,
  CarOutlined,
  UserOutlined,
  FileDoneOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/userSlice";
import logoFull from "../../assets/logo_main.png";
import "./style.scss";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.current);
  const role = currentUser?.role || "USER";

  let menuItems = [];

  if (role === "ADMIN") {
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
        label: <Link to="/admin/vehicles">Quản Lý Phương Tiện</Link>,
      },
      {
        key: "/admin/bookingmanage",
        icon: <CalendarOutlined />,
        label: <Link to="/admin/bookingmanage">Quản Lý Đặt Xe</Link>,
      },
      {
        key: "/admin/staffchecking",
        icon: <FileDoneOutlined />,
        label: <Link to="/admin/staffchecking">Biên bản giao nhận xe</Link>,
      },
      {
        key: "/admin/vote",
        icon: <PieChartOutlined />,
        label: <Link to="/admin/vote">Quản Lý Bình Chọn</Link>,
      },
      {
        key: "/admin/invoice",
        icon: <FileTextOutlined />,
        label: <Link to="/admin/invoice">Quản Lý Hóa Đơn</Link>,
      },
      {
        key: "/admin/contracts",
        icon: <FileDoneOutlined />,
        label: <Link to="/admin/contracts">Quản Lý Hợp Đồng</Link>,
      },
      {
        key: "/admin/owner-contracts",
        icon: <FileTextOutlined />,
        label: <Link to="/admin/owner-contracts">Quản Lý Owner Contract</Link>,
      },
    ];
  } else if (role === "USER") {
    menuItems = [
      {
        key: "/owner/mycar",
        icon: <HomeOutlined />,
        label: <Link to="/owner/mycar">Xe Của Tôi</Link>,
      },
      {
        key: "/owner/bookingtracking",
        icon: <CalendarOutlined />,
        label: <Link to="/owner/bookingtracking">Lịch Đặt Xe</Link>,
      },
      {
        key: "/owner/vote",
        icon: <PieChartOutlined />,
        label: <Link to="/owner/vote">Bình Chọn</Link>,
      },
      {
        key: "/owner/invoice",
        icon: <FileTextOutlined />,
        label: <Link to="/owner/invoice">Thanh Toán</Link>,
      },
    ];
  }

  const footerItems = [
    {
      type: "divider",
    },
    {
      key: "/owner/profile",
      icon: <UserOutlined />,
      label: <Link to="/owner/profile">Hồ Sơ Người Dùng</Link>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng Xuất",
      onClick: () => {
        dispatch(logout());
        navigate("/login");
      },
    },
  ];

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

      <div className="menu-footer">
        <Menu
          mode="inline"
          theme="dark"
          selectedKeys={[]}
          className="menu footer-menu"
          items={footerItems}
          onClick={({ key }) => {
            if (key === "logout") {
              dispatch(logout());
              navigate("guest/login");
            }
          }}
        />
      </div>
    </div>

  );
};

export default Sidebar;
