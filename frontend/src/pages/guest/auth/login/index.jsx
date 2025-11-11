import React from "react";
import { Form, Input, Button, Typography, Divider, App } from "antd"; 
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import { login } from "../../../../features/userSlice";
import "./style.scss";

const { Text } = Typography;

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { message } = App.useApp(); 

  const handleSubmit = async (values) => {
    try {
      const actionResult = await dispatch(login(values));
      const user = unwrapResult(actionResult);

      message.success("Đăng nhập thành công 🎉");

      if (user.role === "STAFF") {
        navigate("/staff/bookingmanage");
      } else if (user.role === "USER") {
        navigate("/owner/mycar");
      } else if (user.role == "ADMIN") {
        navigate("/admin/")
      } else {
        navigate("/");
      }

      console.log("Đăng nhập thành công:", user);
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
      if (error?.message) {
        message.error(error.message);
      } else {
        message.error("Email hoặc mật khẩu không đúng ❌");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-right">
        <div className="login-form-box">
          <div className="login-header">
            <Text className="login-subtitle">Chào mừng bạn quay lại</Text>
          </div>

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label={<span className="login-label">Email</span>}
              name="email"
              rules={[{ required: true, message: "Vui lòng nhập email!" }]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            <Form.Item
              label={<span className="login-label">Mật khẩu</span>}
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="login-btn"
              >
                Đăng Nhập
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div className="login-footer">
            <Text>
              Chưa có tài khoản?{" "}
              <a href="/guest/register" className="login-link">
                Đăng ký ngay
              </a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
