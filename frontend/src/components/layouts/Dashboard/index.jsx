import React from "react";
import { Layout } from "antd";
import OwnerSidebar from "../../sidebar";
import HeaderBar from "../../header/DashboardHeader";
import { Outlet } from "react-router-dom";
import "./style.scss";

const { Sider, Content } = Layout;

const DashboardLayout = () => {
  return (
    <Layout className="dashboard-layout">
      {/* Sidebar cố định */}
      <Sider
        width={220}
        className="fixed-sidebar"
        trigger={null}
      >
        <OwnerSidebar />
      </Sider>

      {/* Main layout */}
      <Layout className="main-layout">
        <HeaderBar />
        <Content className="dashboard-content">
          <div className="content-inner">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
