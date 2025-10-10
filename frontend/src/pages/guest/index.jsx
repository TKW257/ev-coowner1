import React from "react";
import { Layout } from "antd";
import Header from "../../components/header/GuestHeader";
import Footer from "../../components/footer";

const { Content } = Layout;

const GuestPage = () => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header />

      {/* Content */}
      <Content style={{ padding: "24px", background: "#fff" }}>
        <h1>Welcome Guest</h1>
        <p>
          Đây là trang dành cho khách (chưa đăng nhập). Bạn có thể xem thông tin
          cơ bản, giới thiệu dịch vụ hoặc đăng ký/đăng nhập để trải nghiệm đầy
          đủ.
        </p>
      </Content>

      {/* Footer */}
      <Footer />
    </Layout>
  );
};

export default GuestPage;
