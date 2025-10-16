import React from "react";
import { Layout } from "antd";
import Header from "../../../components/header/GuestHeader";
import Footer from "../../../components/footer";
import { Outlet } from "react-router-dom";

const { Content } = Layout;

const GuestLayout = () => {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        overflowX: "hidden",
        background: "#fff",
      }}
    >
      <Header />

      <Content
        style={{
          flex: 1,
          background: "none",
          minHeight: "calc(100vh - 128px)",
          padding: 0,
          margin: 0,
          width: "100%",
          boxSizing: "border-box",
          overflowX: "hidden", 
        }}
      >
        <Outlet />
      </Content>

      <Footer />
    </Layout>
  );
};

export default GuestLayout;
