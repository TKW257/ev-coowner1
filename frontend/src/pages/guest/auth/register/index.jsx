import React from "react";
import { Input, Button, Typography, Form, Divider, App } from "antd"; 
import { useDispatch } from "react-redux";
import { unwrapResult } from "@reduxjs/toolkit";
import { register } from "../../../../features/userSlice";
import "./style.scss";

const { Text } = Typography;

function Register() {
  const dispatch = useDispatch();
  const { message } = App.useApp(); 

  const handleSubmit = async (values) => {
    try {
      const actionResult = await dispatch(register(values));
      const user = unwrapResult(actionResult);
      
      message.success("Đăng ký tài khoản thành công 🎉");

      console.log("Người dùng mới:", user);
    } catch (error) {
      console.error("Đăng ký thất bại:", error);
      message.error("Đăng ký thất bại. Vui lòng thử lại ❌");
    }
  };

  return (
    <div className="register-container">
      <div className="register-right">
        <div className="register-form-box">
          <div className="register-header">
            <Text className="register-subtitle">Tham gia cùng chúng tôi ngay</Text>
          </div>

          <Form layout="vertical" onFinish={handleSubmit}>
            {/* Full Name */}
            <Form.Item
              label={<span className="register-label">Họ và tên</span>}
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ tên!" }]}
            >
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label={<span className="register-label">Email</span>}
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input placeholder="Nhập email" />
            </Form.Item>

            {/* Password */}
            <Form.Item
              label={<span className="register-label">Mật khẩu</span>}
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu!" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
              ]}
            >
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                className="register-btn"
              >
                Đăng ký
              </Button>
            </Form.Item>

            <Divider />

            <div className="register-footer">
              <Text>
                Đã có tài khoản?{" "}
                <a href="/guest/login" className="register-link">
                  Đăng nhập ngay
                </a>
              </Text>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default Register;
