import React, { useState } from "react";
import { Card, Input, Button, Form, message, Typography } from "antd";
import voteApi from "../../../api/voteApi";
import StorageKeys from "../../../constants/storage-key";

const { Title } = Typography;

const VoteCreate = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const currentUser = JSON.parse(localStorage.getItem(StorageKeys.USER));
    if (!currentUser) {
      message.warning("Vui lòng đăng nhập trước khi tạo biểu quyết!");
      return;
    }

    const newTopic = {
      title: values.title,
      description: values.description,
      createdBy: currentUser.name,
      createdAt: new Date().toISOString(),
    };

    try {
      setLoading(true);
      await voteApi.createTopic(newTopic);
      message.success("Đã tạo biểu quyết thành công ✅");
      form.resetFields();
    } catch (err) {
      console.error(err);
      message.error("Không thể tạo biểu quyết!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Card
        title={<Title level={3}>Tạo Biểu Quyết Mới</Title>}
        style={{
          maxWidth: 600,
          margin: "0 auto",
          borderRadius: 16,
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: "Nhập tiêu đề biểu quyết!" }]}
          >
            <Input placeholder="VD: Mua bảo hiểm xe mới?" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả chi tiết"
            rules={[{ required: true, message: "Nhập mô tả chi tiết!" }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Nội dung đề xuất biểu quyết..."
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ background: "#1677ff" }}
            >
              Tạo Biểu Quyết
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default VoteCreate;
