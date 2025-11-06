import React from "react";
import { Menu } from "antd";
import {
  HomeOutlined,
  CalendarOutlined,
  WalletOutlined,
  DashboardOutlined,
  FileTextOutlined,
  PieChartOutlined,
  AuditOutlined,
  LogoutOutlined,
  CarOutlined,
  FieldTimeOutlined,
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
        label: <Link to="/admin/staffchecking">Biên Bản Giao Nhận Xe</Link>,
      },
      {
        key: "/admim/disputes",
        icon: <FieldTimeOutlined />,
        label: <Link to="/admin/disputes">Lịch sử tranh chấp </Link>,
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
        icon: <AuditOutlined />,
        label: <Link to="/admin/owner-contracts">Quản Lý HĐ Sở Hữu</Link>,
      },
    ];

  } else if (role === "STAFF") {
    menuItems = [
      {
        key: "/staff/users",
        icon: <UserOutlined />,
        label: <Link to="/staff/users">Quản Lý Người Dùng</Link>,
      },
      {
        key: "/staff/vehicles",
        icon: <CarOutlined />,
        label: <Link to="/staff/vehicles">Quản Lý Phương Tiện</Link>,
      },
      {
        key: "/staff/bookingmanage",
        icon: <CalendarOutlined />,
        label: <Link to="/staff/bookingmanage">Quản Lý Đặt Xe</Link>,
      },
      {
        key: "/staff/staffchecking",
        icon: <FileDoneOutlined />,
        label: <Link to="/staff/staffchecking">Biên bản giao nhận xe</Link>,
      },
      {
        key: "/staff/disputes",
        icon: <FieldTimeOutlined />,
        label: <Link to="/staff/disputes">Lịch sử tranh chấp </Link>,
      },
      {
        key: "/staff/vote",
        icon: <PieChartOutlined />,
        label: <Link to="/staff/vote">Quản Lý Bình Chọn</Link>,
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
        icon: <WalletOutlined />,
        label: <Link to="/owner/invoice">Thanh Toán</Link>,
      },
      {
        key: "/owner/contract",
        icon: <FileDoneOutlined />,
        label: <Link to="/owner/contract">HĐ Phương Tiện</Link>,
      },
      {
        key: "/owner/ownercontract",
        icon: <AuditOutlined />,
        label: <Link to="/owner/ownercontract">HĐ Đồng Sở Hữu</Link>,
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
      label: <Link to="/public/profile">Hồ Sơ Người Dùng</Link>,
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
