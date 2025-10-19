import React from "react";
import { Card, Button, Space, Tag } from "antd";
import dayjs from "dayjs";

export default function TopicCard({ topic, onDetail, onCalculate }) {
  if (!topic)
    return (
      <Card style={{ marginBottom: 12 }}>
        <div>No topic data</div>
      </Card>
    );

  const topicId = topic.topicId ?? topic.id ?? topic.topic_id;
  const title = topic.title ?? topic.name ?? topic.topicTitle ?? "(No title)";
  const description =
    topic.description ?? topic.desc ?? topic.summary ?? "(No description)";
  const status = topic.status ?? topic.isOpen ?? false;
  const createdAt = topic.createdAt ?? topic.created_at ?? topic.created;

  const formattedCreated = createdAt
    ? dayjs(createdAt).isValid()
      ? dayjs(createdAt).format("YYYY-MM-DD HH:mm:ss")
      : String(createdAt)
    : "-";

  return (
    <Card
      style={{ marginBottom: 12 }}
      title={title}
      extra={status ? <Tag color="green">Open</Tag> : <Tag>Closed</Tag>}
    >
      <div style={{ marginBottom: 12 }}>{description}</div>
      <div style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>
        Created: {formattedCreated}
      </div>

      {/* Hiển thị vote của user nếu có */}
      {topic.userVote !== undefined && (
        <div style={{ marginBottom: 8, color: "green" }}>
          Your vote: {topic.userVote ? "Agree" : "Disagree"}
        </div>
      )}

      <Space>
        <Button type="link" onClick={() => onDetail && onDetail(topic)}>
          Details
        </Button>
        {onCalculate && (
          <Button danger onClick={() => onCalculate(topicId)}>
            Calculate
          </Button>
        )}
      </Space>
    </Card>
  );
}
