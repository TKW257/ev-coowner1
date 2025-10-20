import React from "react";
import { Card, Button, Space, Tag } from "antd";

// Minimal TopicCard used by OwnerVoteListPage and AdminVoteListPage
// Props:
// - topic: { topicId, title, description, status, createdAt }
// - onDetail: function(topic or topicId)
// - onCalculate: optional function(topicId)

export default function TopicCard({ topic, onDetail, onCalculate }) {
  if (!topic)
    return (
      <Card style={{ marginBottom: 12 }}>
        <div>No topic data</div>
      </Card>
    );

  // Support multiple possible field names from API
  const topicId = topic.topicId ?? topic.id ?? topic.topic_id;
  const title = topic.title ?? topic.name ?? topic.topicTitle ?? "(No title)";
  const description =
    topic.description ?? topic.desc ?? topic.summary ?? "(No description)";
  const status = topic.status ?? topic.isOpen ?? false;
  const createdAt = topic.createdAt ?? topic.created_at ?? topic.created;

  return (
    <Card
      style={{ marginBottom: 12 }}
      title={title}
      extra={status ? <Tag color="green">Open</Tag> : <Tag>Closed</Tag>}
    >
      <div style={{ marginBottom: 12 }}>{description}</div>
      <div style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>
        Created: {createdAt ? new Date(createdAt).toLocaleString() : "-"}
      </div>

      <Space>
        <Button
          type="link"
          onClick={() => onDetail && onDetail(topicId ?? topic)}
        >
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
