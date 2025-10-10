import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layout, Menu, Drawer, Avatar, Dropdown, Space, Grid } from "antd";
import { MenuOutlined, CarOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../../features/userSlice";
import "./style.scss";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const GuestHeader = () => {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.current);
  const isLoggedIn = Boolean(currentUser && Object.keys(currentUser).length > 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const navItems = [
    {
      key: "home",
      label: <NavLink to="/">Home</NavLink>
    },
    {
      key: "cars",
      label: <NavLink to="/cars">Stock Cars</NavLink>
    },
    {
      key: "terms",
      label: <NavLink to="/terms">Our Terms</NavLink>
    },
    {
      key: "about",
      label: <NavLink to="/about">About Us</NavLink>
    },
    {
      key: "admin",
      label: <NavLink to="/admin">Admin</NavLink>
    },
    {
      key: "owner",
      label: <NavLink to="/owner/mycar">Owner</NavLink>
    },
  ];

  const userMenu = {
    items: [
      {
        key: "profile",
        label: <NavLink to="/profile">Trang cá nhân</NavLink>, icon: <UserOutlined />
      },
      {
        type: "divider"
      },
      {
        key: "logout",
        label: "Đăng xuất", icon: <LogoutOutlined />, onClick: handleLogout
      },
    ],
  };

  return (
    <Header className="app-header">

      <div className="logo">
        <CarOutlined /> <span>CoEV</span>
      </div>

      {/* Desktop menu */}
      {screens.md && (
        <div className="nav-menu">
          <Menu theme="dark" mode="horizontal" items={navItems} />
        </div>
      )}

      {/* User / menu toggle */}
      <div className="header-right">
        {screens.md ? (
          isLoggedIn ? (
            <Dropdown menu={userMenu} placement="bottomRight">
              <Space className="user-info">
                <Avatar
                  className="avatar"
                  src={currentUser?.image || null}
                  icon={!currentUser?.image && <UserOutlined />}
                />
                <span>{currentUser?.full_name || "Người dùng"}</span>
              </Space>
            </Dropdown>
          ) : (
            <NavLink to="/login" className="login-link">
              Sign In
            </NavLink>
          )
        ) : (
          <MenuOutlined className="menu-toggle" onClick={() => setOpen(true)} />
        )}
      </div>

      {/* Mobile drawer */}
      {!screens.md && (
        <Drawer
          title="Menu"
          placement="right"
          onClose={() => setOpen(false)}
          open={open}
          className="mobile-drawer"
        >
          <Menu mode="vertical" items={navItems} />
          <div className="drawer-user">
            {isLoggedIn ? (
              <>
                <Space className="drawer-user-info">
                  <Avatar
                    className="avatar"
                    src={currentUser?.image || null}
                    icon={!currentUser?.image && <UserOutlined />}
                  />
                  <span>{currentUser?.full_name || "Người dùng"}</span>
                </Space>
                <a className="logout-link" onClick={handleLogout}>
                  Logout
                </a>
              </>
            ) : (
              <NavLink to="/login" className="login-link">
                Sign In
              </NavLink>
            )}
          </div>
        </Drawer>
      )}
    </Header>
  );
};

export default GuestHeader;
