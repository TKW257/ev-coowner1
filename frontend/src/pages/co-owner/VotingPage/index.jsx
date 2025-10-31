import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Select,
  Button,
  Tag,
  Typography,
  Space,
  Modal,
  Table,
  message,
  Spin,
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import voteApi from "../../../api/voteApi";

const { Title, Paragraph } = Typography;

const VoteDashboard = () => {
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [statusFilter, setStatusFilter] = useState("OPEN");
  const [loading, setLoading] = useState(false);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [votes, setVotes] = useState([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  // ===== GỌI API LẤY DANH SÁCH TOPIC =====
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const res = await voteApi.getUserTopics();
        const data = res?.data ?? res;
        setTopics(data);

        // Auto chọn xe đầu tiên khi load xong
        const firstVehicle = data.length > 0 ? data[0].vehicleName : null;
        setSelectedVehicle(firstVehicle);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách biểu quyết");
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  // ===== LỌC THEO TRẠNG THÁI & XE =====
  useEffect(() => {
    if (selectedVehicle) {
      const filtered = topics.filter(
        (t) => t.vehicleName === selectedVehicle && t.status === statusFilter
      );
      setFilteredTopics(filtered);
    }
  }, [topics, selectedVehicle, statusFilter]);

  const vehicleOptions = [...new Set(topics.map((t) => t.vehicleName))].map((v) => ({
    label: v,
    value: v,
  }));

  const openCount = topics.filter((t) => t.status === "OPEN").length;
  const closedCount = topics.filter((t) => t.status === "CLOSED").length;

  // ===== MỞ MODAL VÀ LẤY VOTE THEO TOPIC =====
  const handleViewVotes = async (topic) => {
    try {
      setIsModalOpen(true);
      setSelectedTopic(topic);
      setLoadingVotes(true);
      const res = await voteApi.getVotesByTopic(topic.topicId);
      const data = res?.data ?? res;
      setVotes(data);
    } catch (err) {
      console.error(err);
      message.error("Không thể tải danh sách phiếu");
    } finally {
      setLoadingVotes(false);
    }
  };

  const columns = [
    { title: "Người bỏ phiếu", dataIndex: "userName", key: "userName" },
    {
      title: "Lựa chọn",
      dataIndex: "choice",
      key: "choice",
      render: (val) =>
        val ? (
          <Tag color="green">Đồng ý</Tag>
        ) : (
          <Tag color="red">Không đồng ý</Tag>
        ),
    },
    { title: "Trọng số", dataIndex: "weight", key: "weight" },
    {
      title: "Thời gian",
      dataIndex: "votedAt",
      key: "votedAt",
      render: (time) =>
        time ? new Date(time).toLocaleString("vi-VN") : "-",
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Vote Dashboard</Title>

      {/* Bộ lọc */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col>
          <Select
            style={{ width: 200 }}
            placeholder="Chọn xe"
            value={selectedVehicle}
            onChange={setSelectedVehicle}
            options={vehicleOptions}
          />
        </Col>
        <Col>
          <Space>
            <Button
              type={statusFilter === "OPEN" ? "primary" : "default"}
              onClick={() => setStatusFilter("OPEN")}
            >
              Đang mở ({openCount})
            </Button>
            <Button
              type={statusFilter === "CLOSED" ? "primary" : "default"}
              onClick={() => setStatusFilter("CLOSED")}
            >
              Đã đóng ({closedCount})
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Danh sách topic */}
      {loading ? (
        <Spin tip="Đang tải danh sách..." />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredTopics.map((topic) => (
            <Col key={topic.topicId} span={24}>
              <Card>
                <Row align="middle" gutter={16}>
                  {/* Thông tin chính */}
                  <Col flex="auto">
                    <Title level={5} style={{ margin: 0 }}>
                      {topic.title}
                    </Title>
                    <Paragraph type="secondary" style={{ margin: "4px 0" }}>
                      {topic.description}
                    </Paragraph>
                    <Space size="large">
                      <Tag color={topic.status === "OPEN" ? "green" : "red"}>
                        {topic.status === "OPEN" ? "Đang mở" : "Đã đóng"}
                      </Tag>
                      <Tag color="blue">{topic.vehicleName}</Tag>
                      <Tag color="purple">{topic.decisionType}</Tag>
                    </Space>
                  </Col>

                  {/* Nút thao tác */}
                  <Col flex="0 0 120px" style={{ textAlign: "right" }}>
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      onClick={() => handleViewVotes(topic)}
                    >
                      Xem
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}

          {filteredTopics.length === 0 && !loading && (
            <Col span={24} style={{ textAlign: "center", padding: "40px" }}>
              <Paragraph>Không có topic nào phù hợp.</Paragraph>
            </Col>
          )}
        </Row>
      )}

      {/* Modal chi tiết phiếu */}
      <Modal
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        title={
          selectedTopic
            ? `Chi tiết phiếu - ${selectedTopic.title}`
            : "Chi tiết phiếu"
        }
      >
        {loadingVotes ? (
          <Spin tip="Đang tải phiếu..." />
        ) : (
          <Table
            columns={columns}
            dataSource={votes}
            rowKey="voteId"
            pagination={false}
          />
        )}
      </Modal>
    </div>
  );
};

export default VoteDashboard;
