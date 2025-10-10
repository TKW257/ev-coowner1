import React from "react";
import { Layout, Input, Avatar, Dropdown, Space, Typography } from "antd";
import { SearchOutlined, UserOutlined, LogoutOutlined } from "@ant-design/icons";
import "./style.scss";

const { Header } = Layout;
const { Text } = Typography;

const DashboardHeader = () => {
  const menuItems = [
    {
      key: "1",
      label: "Profile", icon: <UserOutlined />
    },
    {
      type: "divider"
    },
    {
      key: "2",
      label: "Logout", icon: <LogoutOutlined />, danger: true
    },
  ];

  return (
    <Header className="dashboard-header">
      {/* Logo + Title */}
      <div className="header-left">
        <Text className="title">Owner Dashboard</Text>
      </div>

      {/* Search bar */}
      <div className="header-search">
        <Input
          placeholder="Search or type..."
          prefix={<SearchOutlined />}
          className="search-input"
        />
      </div>

      {/* Avatar dropdown */}
      <Dropdown
        menu={{
          items: menuItems,
          style: { background: "#141414", color: "#fff" },
        }}
        placement="bottomRight"
        arrow
      >
        <Space className="user-info">
          <Avatar
            size="large"
            src="https://www.giantbomb.com/a/uploads/square_small/16/164924/2809352-4830305850-latest"
            alt="user"
          />
          <Text className="user-name">Jane Doe</Text>
        </Space>
      </Dropdown>
    </Header>
  );
};

export default DashboardHeader;