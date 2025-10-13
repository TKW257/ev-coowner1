import React from "react";
import { Form, Input, Button, Typography, Divider } from "antd";
import { useDispatch } from 'react-redux';
import { unwrapResult } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import { login } from "../../../../features/userSlice";
import "./style.scss";

const { Text } = Typography;

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const actionResult = await dispatch(login(values));
      const user = unwrapResult(actionResult);

      if (user.role === "STAFF") {
        navigate("/admin/bookingmanage");
      } else if (user.role === "USER") {
        navigate("/owner/mycar");
      } else {
        navigate("/");
      }

      console.log("Logged in user:", user);
    } catch (error) {
      console.log("Failed to login", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-right">
        <div className="login-form-box">
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            <Text style={{ color: "#bbb" }}>
              Welcome back
            </Text>
          </div>

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label={<span style={{ color: "white" }}>Email</span>}
              name="email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: "white" }}>Password</span>}
              name="password"
              rules={[{ required: true, message: "Please enter your password!" }]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{ backgroundColor: "#3CB371", borderColor: "#3CB371" }}
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider style={{ borderColor: "#444" }} />

          <div style={{ textAlign: "center" }}>
            <Text style={{ color: "#bbb" }}>
              Don’t have an account?{" "}
              <a href="/register" style={{ color: "#3CB371" }}>
                Sign up
              </a>
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
