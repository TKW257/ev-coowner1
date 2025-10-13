import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, message, Typography, Spin } from "antd";

const { Title, Text } = Typography;

const VoteDetail = () => {
  const { id } = useParams(); // Lấy id topic
  const [topic, setTopic] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [voteChoice, setVoteChoice] = useState(null);
  const userId = 2; // ✅ Giả lập user đang đăng nhập (Owner A)
  const userName = "Owner A"; // có thể lấy từ context sau này

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy thông tin topic
        const topicRes = await fetch(`http://localhost:3000/topics/${id}`);
        if (!topicRes.ok) throw new Error("Không thể tải chủ đề");
        const topicData = await topicRes.json();

        // Kiểm tra user đã bình chọn chưa
        const voteRes = await fetch(
          `http://localhost:3000/votes?topicId=${id}&userId=${userId}`
        );
        const voteData = await voteRes.json();

        setTopic(topicData);
        if (voteData.length > 0) {
          setHasVoted(true);
          setVoteChoice(voteData[0].choice);
        }
      } catch (err) {
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleVote = async (choice) => {
    try {
      const res = await fetch(`http://localhost:3000/votes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicId: Number(id),
          userId,
          userName,
          choice,
          votedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) throw new Error("Không thể gửi bình chọn!");
      message.success("Đã gửi bình chọn thành công 🎉");
      setHasVoted(true);
      setVoteChoice(choice);
    } catch (err) {
      message.error(err.message);
    }
  };

  if (loading) return <Spin tip="Đang tải chi tiết..." />;
  if (!topic) return <p>Không tìm thấy chủ đề!</p>;

  return (
    <div style={{ padding: "20px" }}>
      <Card
        style={{
          borderRadius: 12,
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        }}
      >
        <Title level={3}>{topic.title}</Title>
        <Text>{topic.description}</Text>
        <br />
        <Text type="secondary">
          Tạo bởi: <b>{topic.createdBy}</b> —{" "}
          {new Date(topic.createdAt).toLocaleString("vi-VN")}
        </Text>

        <div style={{ marginTop: 20 }}>
          {hasVoted ? (
            <Text type="success">
              ✅ Bạn đã bình chọn:{" "}
              <b>{voteChoice ? "Đồng ý" : "Không đồng ý"}</b>
            </Text>
          ) : (
            <>
              <Button
                type="primary"
                onClick={() => handleVote(true)}
                style={{ marginRight: 10 }}
              >
                Đồng ý 👍
              </Button>
              <Button danger onClick={() => handleVote(false)}>
                Không đồng ý 👎
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  );
};

export default VoteDetail;
