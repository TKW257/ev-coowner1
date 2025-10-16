import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Layout, Input, Avatar, Dropdown, Space, Typography } from "antd";
import { SearchOutlined, UserOutlined, DatabaseOutlined } from "@ant-design/icons";
import { logout } from "../../../features/userSlice";
import { useNavigate } from "react-router-dom";
import "./style.scss";

const { Header } = Layout;
const { Text } = Typography;

const DashboardHeader = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useSelector((state) => state.user.current);
  const isLoggedIn = Boolean(currentUser && Object.keys(currentUser).length > 0);

  const role = currentUser?.role || "USER";
  const headerTitle = role === "STAFF" ? "Admin Dashboard" : "Owner Dashboard";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleGoToDashboard = () => {
    if (role === "STAFF") navigate("/admin");
    else if (role === "USER") navigate("/owner/mycar");
    else navigate("/user/dashboard");
  };

  const userMenu = {
    items: [
      {
        key: "profile",
        label: <span>Trang cá nhân</span>,
        icon: <UserOutlined />,
        onClick: () => navigate("/profile"),
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
    <Header className="dashboard-header">
      <div className="header-left">
        {children}
        <Text className="title">{headerTitle}</Text>
      </div>

      <div className="header-search">
        <Input
          placeholder="Search or type..."
          prefix={<SearchOutlined />}
          className="search-input"
        />
      </div>

      <div className="header-right">
        {isLoggedIn ? (
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
              <span className="username">
                {currentUser?.fullName || "Người dùng"}
              </span>
            </Space>
          </Dropdown>
        ) : (
          <span
            className="login-link"
            onClick={() => navigate("/login")}
          >
            Sign In
          </span>
        )}
      </div>
    </Header>
  );
};

export default DashboardHeader;
