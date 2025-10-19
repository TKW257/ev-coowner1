import React from "react";
import { Form, Input, Button, Typography, Divider } from "antd";
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { useNavigate } from "react-router-dom";
import { login } from "../../../../features/userSlice";
import StorageKeys from "../../../../constants/storage-key";
import "./style.scss";

const { Text } = Typography;

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      const actionResult = await dispatch(login(values));
      const user = unwrapResult(actionResult);

      console.log("Logged in user:", user);

      if (user.role === "STAFF") {
        navigate("/admin/bookingmanage");
      } else if (user.role === "USER") {
        navigate("/owner/mycar");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log("Failed to login", error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-right">
        <div className="login-form-box">
          <div className="login-header">
            <Text className="login-subtitle">Welcome back</Text>
          </div>

          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label={<span className="login-label">Email</span>}
              name="email"
              rules={[{ required: true, message: "Please enter your email!" }]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>

            <Form.Item
              label={<span className="login-label">Password</span>}
              name="password"
              rules={[
                { required: true, message: "Please enter your password!" },
              ]}
            >
              <Input.Password placeholder="Enter password" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="login-btn"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider />

          <div className="login-footer">
            <Text>
              Don’t have an account?{" "}
              <a href="/guest/register" className="login-link">
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
