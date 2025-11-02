import React, { useEffect, useState, useCallback } from "react";
import { App } from "antd";
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, Row, Col, Select, Button, Tag, Typography, Divider, Space, Modal, Table, Spin } from "antd";
import { UserOutlined, DollarOutlined, CarOutlined, LikeOutlined, DislikeOutlined, EyeOutlined } from "@ant-design/icons";
import voteApi from "../../../api/voteApi";
import dayjs from "dayjs";
import "./style.scss";

const { Title, Text, Paragraph } = Typography;

const VoteDashboard = () => {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [statusFilter, setStatusFilter] = useState("PENDING");
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [voteList, setVoteList] = useState([]);
  const [voteStats, setVoteStats] = useState([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  const [voteModalOpen, setVoteModalOpen] = useState(false);
  const [currentTopic, setCurrentTopic] = useState(null);
  const { notification } = App.useApp();

  // get All topic user
  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      const res = await voteApi.getUserTopics();
      const data = Array.isArray(res) ? res : [];
      setTopics(data);

      setSelectedVehicle((prev) => prev || (data[0]?.vehicleName ?? null));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);


  // view trạng chi tiết trạng thái vote 
  const handleViewVotes = async (topicId) => {
    try {
      setModalOpen(true);
      setLoadingVotes(true);
      const res = await voteApi.getVotesByTopic(topicId);
      const votes = Array.isArray(res) ? res : [];
      setVoteList(votes);

      const agree = votes.filter(v => v.choice === true).length;
      const disagree = votes.filter(v => v.choice === false).length;
      setVoteStats([
        { name: "Đồng ý", value: agree },
        { name: "Không đồng ý", value: disagree },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingVotes(false);
    }
  };

  const openVoteModal = async (topic) => {
    setCurrentTopic(topic);
    setVoteModalOpen(true);
  };

  const handleCastVote = async (agree) => {
    if (!currentTopic) return;
    try {
      const payload = {
        topicId: currentTopic.topicId,
        agree,
        votedAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      };
      await voteApi.castVote(payload);

      notification.success({
        message: "Bình chọn thành công",
        description: `Bạn đã ${agree ? "đồng ý" : "không đồng ý"} bình chọn.`,
        placement: "topRight",
      });

      setVoteModalOpen(false);
    } catch (err) {
      console.error(err);
      notification.error({
        message: "Bình chọn thất bại",
        description: "Bạn đã bình chọn cho chủ đề này rồi.",
        placement: "topRight",
      });
    }
  };

  // filter và status
  const vehicleOptions = [...new Set(topics.map((t) => t.vehicleName))].map(
    (v) => ({ label: v, value: v })
  );

  const statusCount = {
    PENDING: topics.filter((t) => t.status === "PENDING").length,
    APPROVED: topics.filter((t) => t.status === "APPROVED").length,
    REJECTED: topics.filter((t) => t.status === "REJECTED").length,
  };

  useEffect(() => {
    if (selectedVehicle) {
      setFilteredTopics(
        topics.filter(
          (t) => t.vehicleName === selectedVehicle && t.status === statusFilter
        )
      );
    }
  }, [selectedVehicle, statusFilter, topics]);



  const voteColumns = [
    { title: "Người bỏ phiếu", dataIndex: "userName", key: "userName" },
    {
      title: "Lựa chọn",
      dataIndex: "choice",
      key: "choice",
      render: (choice) => (choice ? "Đồng ý" : "Không đồng ý"),
    },
    { title: "Trọng số", dataIndex: "weight", key: "weight" },
    { title: "Thời gian", dataIndex: "votedAt", key: "votedAt" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "red";
      default:
        return "blue";
    }
  };



  return (
    <div style={{ padding: 24 }}>

      {/* Bộ lọc trong Card */}
     <Card className="vote-filter-card" style={{ marginBottom: 24 }}>

        <Row gutter={16} align="middle">
          <Col>
            <Select
              style={{ width: 220 }}
              placeholder="Chọn xe"
              value={selectedVehicle}
              onChange={setSelectedVehicle}
              options={vehicleOptions}
            />
          </Col>
          <Col flex="auto">
            <Space wrap>
              <Button
                type={statusFilter === "PENDING" ? "primary" : "default"}
                onClick={() => setStatusFilter("PENDING")}
              >
                Đang mở ({statusCount.PENDING})
              </Button>
              <Button
                type={statusFilter === "APPROVED" ? "primary" : "default"}
                onClick={() => setStatusFilter("APPROVED")}
              >
                Đã duyệt ({statusCount.APPROVED})
              </Button>
              <Button
                type={statusFilter === "REJECTED" ? "primary" : "default"}
                onClick={() => setStatusFilter("REJECTED")}
              >
                Từ chối ({statusCount.REJECTED})
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>


      {/* Danh sách topic */}
      <Spin spinning={loading}>
        <Row gutter={[16, 16]}>
          {filteredTopics.map((topic) => (
            <Col key={topic.topicId} span={24}>
              <Card
                hoverable
                style={{
                  borderRadius: 12,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                  background: "#fff",
                }}
              >
                {/* --- Header --- */}
                <Row justify="space-between" align="middle">
                  <Col>
                    <Space align="center" size="middle" wrap>
                      <Text
                        strong
                        style={{
                          fontSize: 16,
                          color: "#555",
                          minWidth: 80,
                        }}
                      >
                        Tiêu đề:
                      </Text>

                      {/* Tiêu đề chính */}
                      <Title
                        level={4}
                        style={{
                          margin: 0,
                          color: "#222",
                          fontWeight: 500,
                          background: "#f0f2f5",
                          padding: "2px 10px",
                          borderRadius: 6,
                          lineHeight: 1.3,
                        }}
                      >
                        {topic.title}
                      </Title>

                      <Tag color={getStatusColor(topic.status)}>
                        {topic.status}
                      </Tag>
                    </Space>
                  </Col>

                  <Col>
                    <Space>

                      <Text type="secondary">
                        Tạo vào:
                      </Text>
                      <Text type="secondary">
                        {topic.createdAt
                          ? new Date(topic.createdAt).toLocaleString()
                          : "null"}
                      </Text>
                    </Space>
                  </Col>
                </Row>

                <Divider style={{ margin: "12px 0" }} />

                {/* --- Nội dung chia 2 cột --- */}
                <Row justify="space-between" align="top">
                  {/* Cột trái: thông tin chi tiết */}
                  <Col span={20}>
                    <Row gutter={[0, 8]}>
                      <Col span={24}>
                        <Tag color="purple">
                          Loại quyết định: {topic.decisionType}
                        </Tag>
                        <Tag color="orange">
                          Tỷ lệ yêu cầu: {topic.requiredRatio}
                        </Tag>
                        <Tag
                          color="#fffbe6"
                          style={{
                            border: "1px solid #ffe58f",
                            borderRadius: 6,
                            color: "#ad8b00",
                            fontWeight: 500,
                          }}
                        >
                          <DollarOutlined /> Giá dự kiến:{" "}
                          {topic.amount
                            ? `${topic.amount.toLocaleString()} ₫`
                            : "Chưa có"}
                        </Tag>
                      </Col>
                      <Col span={24}>
                        <Space>
                          <CarOutlined />
                          <Text>Xe: {topic.vehicleName || "N/A"}</Text>
                        </Space>
                      </Col>
                      <Col span={24}>
                        <Space>
                          <UserOutlined />
                          <Text>Người tạo: {topic.createdByName || "N/A"}</Text>
                        </Space>
                      </Col>
                      <Col span={24}>
                        <Text strong>Mô tả:</Text> {topic.description}
                      </Col>
                    </Row>
                  </Col>

                  {/* Cột phải: nút hành động */}
                  <Col>
                    <Space direction="vertical" size="middle">
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewVotes(topic.topicId)}
                      >
                        Chi tiết
                      </Button>

                      <Button
                        type="default"
                        icon={<LikeOutlined />}
                        onClick={() => openVoteModal(topic)}
                        disabled={topic.status !== "PENDING"}
                      >
                        Bình chọn
                      </Button>
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}

          {filteredTopics.length === 0 && (
            <Col span={24} style={{ textAlign: "center", padding: 40 }}>
              <Paragraph>Không có topic nào phù hợp.</Paragraph>
            </Col>
          )}
        </Row>
      </Spin>

      {/* Modal danh sách phiếu bầu */}
      <Modal
        title="Danh sách phiếu bầu"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
      >
        <Spin spinning={loadingVotes}>
          {/* --- Biểu đồ --- */}
          {modalOpen && voteStats.length > 0 && (
            <div style={{ height: 250, marginBottom: 24 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={voteStats}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={90}
                    label
                  >
                    <Cell key="agree" fill="#52c41a" />
                    <Cell key="disagree" fill="#ff4d4f" />
                  </Pie>
                  <ReTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* --- Bảng chi tiết phiếu bầu --- */}
          <Table
            dataSource={voteList}
            columns={voteColumns}
            rowKey="voteId"
            pagination={false}
          />
        </Spin>
      </Modal>


      {/* Modal bình chọn */}
      <Modal
        title={`🗳️ Bình chọn - ${currentTopic?.title || ""}`}
        open={voteModalOpen}
        onCancel={() => setVoteModalOpen(false)}
        footer={null}
        centered
      >
        <Spin spinning={loadingVotes}>
          {currentTopic ? (
            <div style={{ textAlign: "center", padding: "12px 0" }}>
              <Paragraph>
                <Text strong>Xe:</Text> {currentTopic.vehicleName}
              </Paragraph>
              <Paragraph>
                <Text strong>Mô tả:</Text>{" "}
                {currentTopic.description || "Không có mô tả"}
              </Paragraph>
              <Divider />
              <Space>
                <Button type="primary" onClick={() => handleCastVote(true)}>
                  <LikeOutlined /> Đồng ý
                </Button>
                <Button danger onClick={() => handleCastVote(false)}>
                  <DislikeOutlined /> Không đồng ý
                </Button>
              </Space>
            </div>
          ) : (
            <Paragraph>Không tìm thấy thông tin chủ đề.</Paragraph>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default VoteDashboard;