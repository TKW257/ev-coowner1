import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { MenuUnfoldOutlined, MenuFoldOutlined } from "@ant-design/icons";
import OwnerSidebar from "../../sidebar";
import HeaderBar from "../../header/DashboardHeader";
import { Outlet } from "react-router-dom";
import "./style.scss";

const { Sider, Content } = Layout;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Tự collapse khi màn hình nhỏ hơn 768px
  useEffect(() => {
    const handleResize = () => setCollapsed(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }} className="dashboard-layout">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        width={220}
        className="sidebar-container"
      >
        <OwnerSidebar collapsed={collapsed} />
      </Sider>

      <Layout>
        <HeaderBar>
          <div
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <MenuUnfoldOutlined style={{ color: "#fff", fontSize: 20 }} />
            ) : (
              <MenuFoldOutlined style={{ color: "#fff", fontSize: 20 }} />
            )}
          </div>
        </HeaderBar>

        <Content style={{ margin: "24px", background: "#fff", padding: "24px" }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
