import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layout, Menu, Drawer, Avatar, Dropdown, Space, Grid } from "antd";
import { MenuOutlined, UserOutlined, DatabaseOutlined } from "@ant-design/icons";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../../features/userSlice";
import logo from "../../../assets/logo_main.png";
import "./style.scss";

const { Header } = Layout;
const { useBreakpoint } = Grid;

const GuestHeader = () => {
  const [open, setOpen] = useState(false);
  const screens = useBreakpoint();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.current);
  const role = currentUser?.role || "USER";
  const isLoggedIn = Boolean(currentUser && Object.keys(currentUser).length > 0);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleGoToDashboard = () => {
    if (role === "STAFF") navigate("/admin");
    else if (role === "USER") navigate("/owner/mycar");
    else navigate("/user/dashboard");
  };

  const navItems = [
    {
      key: "/",
      label: <NavLink to="/">Trang Chủ</NavLink>
    },
    {
      key: "guest/stockcars",
      label: <NavLink to="guest/stockcars">Danh Sách Xe Điện</NavLink>
    },
    {
      key: "/guest/terms",
      label: <NavLink to="/guest/terms">Điều Khoản</NavLink>
    },
    {
      key: "/guest/aboutus",
      label: <NavLink to="/guest/aboutus">Về Chúng Tôi</NavLink>
    },
  ];

  const userMenu = {
    items: [
      {
        key: "profile",
        label: <NavLink to="/owner/profile">Trang cá nhân</NavLink>,
        icon: <UserOutlined />,
      },
      {
        key: "dashboard",
        label: <span> Dashboard</span>,
        icon: <DatabaseOutlined />,
        onClick: handleGoToDashboard,
      },
      { type: "divider" },
      {
        key: "logout",
        label: <span className="logout-link">Đăng xuất</span>,
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Header className="app-header">

      <div className="logo" onClick={() => navigate("/")}>
        <img src={logo} alt="CoEV logo" />
      </div>

      {screens.md && (
        <div className="nav-menu">
          <Menu theme="dark" mode="horizontal" items={navItems} />
        </div>
      )}

      <div className="header-right">
        {screens.md ? (
          isLoggedIn ? (
            <Dropdown
              menu={userMenu}
              placement="bottomRight"
              overlayClassName="user-dropdown"
              arrow={{ pointAtCenter: true }}
            >
              <Space className="user-info">
                <Avatar
                  className="avatar"
                  src={currentUser?.image || null}
                  icon={!currentUser?.image && <UserOutlined />}
                />
                <span>{currentUser?.fullName || "Người dùng"}</span>
              </Space>
            </Dropdown>
          ) : (
            <NavLink to="/guest/login" className="login-link">
              Đăng nhập 
            </NavLink>
          )
        ) : (
          <MenuOutlined className="menu-toggle" onClick={() => setOpen(true)} />
        )}
      </div>

      {/* Mobile Drawer */}
      {!screens.md && (

        <Drawer
          title="Menu"
          placement="top"
          onClose={() => setOpen(false)}
          open={open}
          className="mobile-drawer"
          closable
          height="65vh"
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
                  <span>{currentUser?.fullName || "Người dùng"}</span>
                </Space>
                <a className="logout-link" onClick={handleLogout}>
                  Đăng xuất
                </a>
              </>
            ) : (
              <NavLink to="/guest/login" className="login-link">
                Đăng nhập
              </NavLink>
            )}
          </div>
        </Drawer>

      )}
    </Header>
  );
};

export default GuestHeader;
