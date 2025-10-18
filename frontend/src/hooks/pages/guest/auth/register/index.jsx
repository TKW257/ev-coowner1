import React from "react";
import { Input, Button, Typography, Form, Divider, message } from "antd";
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { register } from "../../../../../features/userSlice";
import "./style.scss";

const { Text } = Typography;

function Register() {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values) => {
    try {
      const actionResult = await dispatch(register(values));
      const user = unwrapResult(actionResult);

      messageApi.open({
        type: "success",
        content: "Register successfully",
      });

      console.log("New user", user);
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Register failed. Please try again",
      });
      console.error("Failed to register", error);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="register-container">
        <div className="register-right">
          <div className="register-form-box">
            <div className="register-header">
              <Text className="register-subtitle">Join with us now</Text>
            </div>

            <Form layout="vertical" onFinish={handleSubmit}>
              {/* Full Name */}
              <Form.Item
                label={<span className="register-label">Full Name</span>}
                name="fullName"
                rules={[{ required: true, message: "Please enter your name!" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>

              {/* Email */}
              <Form.Item
                label={<span className="register-label">Email</span>}
                name="email"
                rules={[
                  { required: true, message: "Please enter your email!" },
                  { type: "email", message: "Invalid email format" },
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              {/* Password */}
              <Form.Item
                label={<span className="register-label">Password</span>}
                name="password"
                rules={[
                  { required: true, message: "Please enter your password!" },
                  { min: 6, message: "Password must be at least 6 characters!" },
                ]}
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  className="register-btn"
                >
                  Sign Up
                </Button>
              </Form.Item>

              <Divider />

              <div className="register-footer">
                <Text>
                  Already have an account?{" "}
                  <a href="/guest/login" className="register-link">
                    Sign in
                  </a>
                </Text>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
