import React, { useEffect, useState } from "react";
import { Card, Button, Spin, message, Typography } from "antd";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const VoteList = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("http://localhost:3000/topics");
        if (!res.ok) throw new Error("Không thể tải danh sách bình chọn!");
        const data = await res.json();
        setTopics(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  if (loading) return <Spin tip="Đang tải danh sách..." />;
  if (error) return <p style={{ color: "red" }}>Lỗi: {error}</p>;

  return (
    <div style={{ padding: "20px" }}>
      <Title level={3}>Danh sách chủ đề bình chọn</Title>

      {topics.length === 0 ? (
        <Text type="secondary">Hiện chưa có chủ đề nào để biểu quyết.</Text>
      ) : (
        topics.map((topic) => (
          <Card
            key={topic.id}
            style={{
              marginBottom: 16,
              borderRadius: 12,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Title level={4}>{topic.title}</Title>
            <Text>{topic.description}</Text>
            <br />
            <Text type="secondary">
              Tạo bởi: <b>{topic.createdBy}</b> —{" "}
              {new Date(topic.createdAt).toLocaleString("vi-VN")}
            </Text>
            <div style={{ marginTop: 10 }}>
              <Button
                type="primary"
                onClick={() => navigate(`/owner/vote/${topic.id}`)}
              >
                Xem chi tiết
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
};

export default VoteList;
