import React from "react";
import { Menu } from "antd";
import { HomeOutlined, CalendarOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import logoFull from "../../assets/logo_main.png";
import "./style.scss";

const OwnerSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      key: "/owner/mycar",
      icon: <HomeOutlined />,
      label: <Link to="/owner/mycar">Dashboard</Link>,
    },
    {
      key: "/owner/carbooking",
      icon: <CalendarOutlined />,
      label: <Link to="/owner/carbooking">Book Cars</Link>,
    },
  ];

  return (
    <div className="owner-sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
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

export default OwnerSidebar;
