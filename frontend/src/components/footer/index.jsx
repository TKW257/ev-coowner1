import React from "react";
import { Layout, Row, Col } from "antd";
import { MailOutlined } from "@ant-design/icons";
import logo from "../../assets/logo_main.png";
import "./style.scss";

const { Footer: FooterLayout } = Layout;

const Footer = () => {
  return (
    <FooterLayout className="app-footer">
      <Row gutter={[16, 16]} justify="center" align="middle">
        <Col xs={24} md={8} className="footer-logo">
          <img src={logo} alt="CoEV logo" />
        </Col>

        <Col xs={24} md={8} className="footer-links">
          <a href="/guest/aboutus">Về Chúng Tôi</a> |{" "}
          <a href="/guest/terms">Điều Khoản</a> |{" "}
          <a href="/contact">Liên Hệ</a>
        </Col>

        <Col xs={24} md={8} className="footer-contact">
          <MailOutlined /> hỗ trợ@coev.com
        </Col>
      </Row>

      <div className="footer-copy">
        ©2025 CoEV. Bản quyền thuộc về CoEV.
      </div>
    </FooterLayout>
  );
};

export default Footer;
