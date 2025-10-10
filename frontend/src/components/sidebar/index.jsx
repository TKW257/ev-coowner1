import React from "react";
import { Menu } from "antd";
import { HomeOutlined, CarOutlined, CalendarOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import "./style.scss";

const OwnerSidebar = ({ collapsed }) => {
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
      <div className="sidebar-logo">
        {collapsed ? (
          <div className="logo-icon">🚗</div>
        ) : (
          <div className="logo-text">
            <span className="brand">CoEV</span>
          </div>
        )}
      </div>

      <Menu
        mode="inline"
        theme="dark"
        selectedKeys={[location.pathname]}
        className="menu"
        items={menuItems} 
      />
    </div>
  );
};

export default OwnerSidebar;
