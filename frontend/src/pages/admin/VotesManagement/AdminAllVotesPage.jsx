import React, { useEffect, useState } from "react";
import { PieChartOutlined } from "@ant-design/icons";

import { Table, Tag, Spin, message, Card, Statistic, Row, Col } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import voteApi from "../../../api/voteApi";

export default function AdminAllVotesPage() {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVote, setSelectedVote] = useState(null);

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const res = await voteApi.getAllTopics();
        setVotes(res.data || []);
        console.log("✅ Danh sách vote:", res.data);
      } catch (error) {
        console.error("❌ Lỗi khi tải vote:", error);
        message.error("Không thể tải danh sách vote");
      } finally {
        setLoading(false);
      }
    };
    fetchVotes();
  }, []);

  const columns = [
    {
      title: "Chủ đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Loại quyết định",
      dataIndex: "decisionType",
      key: "decisionType",
      render: (type) => <Tag color="blue">{type}</Tag>,
    },
    {
      title: "Tỉ lệ yêu cầu",
      dataIndex: "requiredRatio",
      key: "requiredRatio",
      render: (r) => `${(r * 100).toFixed(0)}%`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "OPEN" ? "green" : "volcano"}>
          {status === "OPEN" ? "Đang mở" : "Đã đóng"}
        </Tag>
      ),
    },
    {
      title: "Kết quả",
      key: "result",
      render: (_, record) => {
        const yes = record.votesYes || 0;
        const no = record.votesNo || 0;
        const total = yes + no;
        const yesPercent = total > 0 ? ((yes / total) * 100).toFixed(1) : 0;
        return (
          <>
            <Tag color="green">Đồng ý: {yesPercent}%</Tag>
            <Tag color="red">Không: {100 - yesPercent}%</Tag>
          </>
        );
      },
    },
  ];

  const COLORS = ["#00C49F", "#FF8042"];

  const handleRowClick = (record) => {
    setSelectedVote(record);
  };

  return (
    <Card title="📊 Tất cả các cuộc bình chọn">
      {loading ? (
        <Spin />
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: 20 }}>
            <Col span={8}>
              <Statistic
                title="Tổng số vote"
                value={votes.length}
                valueStyle={{ color: "#1890ff" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Vote đang mở"
                value={votes.filter((v) => v.status === "OPEN").length}
                valueStyle={{ color: "#52c41a" }}
              />
            </Col>
            <Col span={8}>
              <Statistic
                title="Vote đã đóng"
                value={votes.filter((v) => v.status === "CLOSED").length}
                valueStyle={{ color: "#fa541c" }}
              />
            </Col>
          </Row>

          <Table
            rowKey="topicId"
            columns={columns}
            dataSource={votes}
            pagination={{ pageSize: 5 }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
          />

          {selectedVote && (
            <Card
              title={`📈 Kết quả: ${selectedVote.title}`}
              style={{ marginTop: 20 }}
            >
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Đồng ý", value: selectedVote.votesYes || 0 },
                      {
                        name: "Không đồng ý",
                        value: selectedVote.votesNo || 0,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          )}
        </>
      )}
    </Card>
  );
}
