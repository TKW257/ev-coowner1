import React from "react";
import { Layout, Row, Col } from "antd";

const { Footer: FooterLayout } = Layout;

const Footer = () => {
  return (
    <FooterLayout style={{ textAlign: "center", background: "#f0f2f5", padding: "24px" }}>
      <Row gutter={[16, 16]} justify="center">
        <Col xs={24} md={8} style={{ textAlign: "center" }}>
          ©2025 CARHUB. All rights reserved.
        </Col>
        <Col xs={24} md={8} style={{ textAlign: "center" }}>
          <a href="/about">Giới thiệu</a> | <a href="/contact">Liên hệ</a>
        </Col>
        <Col xs={24} md={8} style={{ textAlign: "center" }}>
          Email: support@carhub.com
        </Col>
      </Row>
    </FooterLayout>
  );
};

export default Footer;
