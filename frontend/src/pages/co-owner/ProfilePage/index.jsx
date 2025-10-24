import React from "react";
import { Form, Input, Button, Upload, Row, Col, Typography, Card } from "antd";
import { UploadOutlined, CameraOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ProfileForm = () => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    console.log("Form values:", values);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <Card
        style={{
          width: "600px",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          padding: "24px 36px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Upload showUploadList={false}>
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                cursor: "pointer",
              }}
            >
              <CameraOutlined style={{ fontSize: 30, color: "#52c41a" }} />
            </div>
            <div
              style={{
                marginTop: 8,
                color: "#52c41a",
                fontWeight: 500,
              }}
            >
              Upload Photo
            </div>
          </Upload>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Full Name"
                name="fullName"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input placeholder="Enter your full name" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  { type: "email", message: "Invalid email" },
                ]}
              >
                <Input placeholder="Enter your email" size="large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Phone Number"
                name="phone"
                rules={[{ required: true, message: "Please enter your phone number" }]}
              >
                <Input placeholder="Enter your phone number" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Bằng lái xe"
                name="driverLicense"
                rules={[{ required: true, message: "Please enter your driver license" }]}
              >
                <Input placeholder="Enter your driver license number" size="large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Căn cước công dân"
                name="citizenId"
                rules={[{ required: true, message: "Please enter your ID card number" }]}
              >
                <Input placeholder="Enter your citizen ID" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ textAlign: "center", marginTop: 32 }}>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              style={{
                backgroundColor: "#52c41a",
                borderColor: "#52c41a",
                borderRadius: "8px",
                padding: "0 40px",
              }}
            >
              Add Now
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ProfileForm;
