import React from "react";
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { register } from "../../../../features/userSlice";
import { Input, Button, Typography, Form, Divider } from "antd";
import { message } from "antd";
import "./style.scss";

const { Text } = Typography;

function Register() {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();

  const handleSubmit = async (values) => {
    try {
      //values.name = values.email;
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
      console.log("Failed to register", error);
    }
  };

  return (
    <>
      {contextHolder}
      <div className="signup-container">
        <div className="signup-right">
          <div className="signup-form-box">
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <Text style={{ color: "#bbb" }}>Join with us now</Text>
            </div>

            <Form layout="vertical" onFinish={handleSubmit}>

              {/* Full Name */}
              <Form.Item
                label={<span style={{ color: "white" }}>Full Name</span>}
                name="fullName"
                rules={[{ required: true, message: "Please enter your name!" }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>

              {/* Email */}
              <Form.Item
                label={<span style={{ color: "white" }}>Email</span>}
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
                label={<span style={{ color: "white" }}>Password</span>}
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
                  style={{ backgroundColor: "#3CB371", borderColor: "#3CB371" }}
                >
                  Sign Up
                </Button>
              </Form.Item>

              <Divider style={{ borderColor: "#444" }} />

              <div style={{ textAlign: "center" }}>
                <Text style={{ color: "#bbb" }}>
                  Already have an account?{" "}
                  <a href="/login" style={{ color: "#3CB371" }}>
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
