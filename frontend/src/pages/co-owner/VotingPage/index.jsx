import { useEffect, useState } from "react";
import { Spin, message, Modal, Radio, Select, Table, Tag, Button, Space, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  DislikeOutlined,
  LikeFilled,
  DislikeFilled,
} from "@ant-design/icons";
import voteApi from "../../../api/voteApi";
import vehiclesApi from "../../../api/vehiclesApi";

export default function OwnerVoteListPage() {
  const [topics, setTopics] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [choice, setChoice] = useState(true);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Giả lập user (thay cho /api/users/me)
  useEffect(() => {
    const mockUser = JSON.parse(localStorage.getItem("user")) || {
      id: 1,
      fullName: "Demo User",
    };
    setCurrentUser(mockUser);
  }, []);

  // Fetch dữ liệu khi có user
  useEffect(() => {
    if (currentUser) {
      fetchVehicles();
      fetchTopics();
    }
  }, [currentUser]);

  // Lấy danh sách xe
  const fetchVehicles = async () => {
    try {
      const res = await vehiclesApi.getAllVehicles();
      const data = Array.isArray(res) ? res : res?.data ?? res?.content;
      setVehicles(Array.isArray(data) ? data : []);
      if (data.length === 1) setSelectedVehicle(data[0].vehicleId);
    } catch {
      message.error("Không thể tải danh sách xe");
    }
  };

  // Lấy danh sách chủ đề + kiểm tra user đã vote chưa
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await voteApi.getUserTopics();
      const data = Array.isArray(res) ? res : res?.data ?? res?.content;
      const list = Array.isArray(data) ? data : [];

      // Lấy tất cả phiếu cho từng topic
      const updated = await Promise.all(
        list.map(async (topic) => {
          try {
            const votes = await voteApi.getVotesByTopic(topic.topicId);
            const userVote = votes.find(
              (v) =>
                v.userId === currentUser.id ||
                v.userName === currentUser.fullName
            );
            if (userVote) {
              return {
                ...topic,
                voted: true,
                userChoice: userVote.choice,
              };
            }
            return { ...topic, voted: false };
          } catch {
            return topic;
          }
        })
      );

      setTopics(updated);
    } catch (err) {
      console.error("Failed to load topics:", err);
      message.error("Không thể tải danh sách chủ đề");
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  // Gửi phiếu bình chọn
  const handleVote = async () => {
    if (!selected) return;
    try {
      await voteApi.castVote({ topicId: selected.topicId, agree: choice });
      message.success("🎉 Bình chọn thành công!");

      // Cập nhật local thay vì fetch lại toàn bộ
      setTopics((prev) =>
        prev.map((t) =>
          t.topicId === selected.topicId
            ? { ...t, voted: true, userChoice: choice }
            : t
        )
      );

      setSelected(null);
    } catch (err) {
      console.error("Vote failed:", err);
      message.error("Không thể gửi bình chọn");
    }
  };

  // Lọc topic theo xe và trạng thái
  const filteredTopics = topics.filter((t) => {
    const matchVehicle =
      selectedVehicle === "ALL" ||
      t.vehicleId === selectedVehicle ||
      t.vehicle?.vehicleId === selectedVehicle;
    const matchStatus =
      filterStatus === "ALL"
        ? true
        : filterStatus === "VOTED"
          ? t.voted
          : !t.voted;
    return matchVehicle && matchStatus;
  });

  // Hiển thị tag kết quả vote
  const renderVoteTag = (t) => {
    if (!t.voted)
      return (
        <Tag color="orange" icon={<ClockCircleOutlined />}>
          Chưa bình chọn
        </Tag>
      );
    if (t.userChoice === true)
      return (
        <Tag color="green" icon={<CheckCircleOutlined />}>
          Đồng ý
        </Tag>
      );
    return (
      <Tag color="red" icon={<CloseCircleOutlined />}>
        Không đồng ý
      </Tag>
    );
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "topicId",
      key: "topicId",
      width: 80,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: {
        showTitle: false,
      },
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (desc) => (
        <Tooltip placement="topLeft" title={desc || "Không có mô tả"}>
          {desc || "Không có mô tả"}
        </Tooltip>
      ),
    },
    {
      title: "Xe áp dụng",
      dataIndex: "vehicleName",
      key: "vehicleName",
      ellipsis: {
        showTitle: false,
      },
      render: (vehicleName) => (
        <Tooltip placement="topLeft" title={vehicleName}>
          {vehicleName || "N/A"}
        </Tooltip>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      render: (_, record) => renderVoteTag(record),
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          {!record.voted ? (
            <Button
              type="primary"
              icon={<LikeOutlined />}
              onClick={() => {
                setSelected(record);
                setChoice(true);
              }}
            >
              Bình chọn
            </Button>
          ) : (
            <Tag color={record.userChoice ? "success" : "error"}>
              {record.userChoice ? (
                <>
                  <LikeFilled /> Đồng ý
                </>
              ) : (
                <>
                  <DislikeFilled /> Không đồng ý
                </>
              )}
            </Tag>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: "black" }}>
        <h2>🗳️ Danh Sách Bình Chọn</h2>
      </div>

      {/* Bộ lọc */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 12 }}>
        <Select
          style={{ minWidth: 220 }}
          placeholder="Chọn xe"
          value={selectedVehicle}
          onChange={(v) => setSelectedVehicle(v)}
        >
          <Select.Option value="ALL">Tất cả xe</Select.Option>
          {vehicles.map((v) => (
            <Select.Option key={v.vehicleId} value={v.vehicleId}>
              {v.brand} {v.model} ({v.licensePlate || v.plateNumber})
            </Select.Option>
          ))}
        </Select>

        <Select
          style={{ minWidth: 180 }}
          value={filterStatus}
          onChange={(v) => setFilterStatus(v)}
        >
          <Select.Option value="ALL">Tất cả</Select.Option>
          <Select.Option value="NOT_VOTED">Chưa bình chọn</Select.Option>
          <Select.Option value="VOTED">Đã bình chọn</Select.Option>
        </Select>
      </div>

      <Table
        rowKey="topicId"
        columns={columns}
        dataSource={filteredTopics}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal Vote */}
      <Modal
        open={!!selected}
        onCancel={() => setSelected(null)}
        onOk={handleVote}
        title={`Bình chọn cho "${selected?.title}"`}
        okText="Gửi phiếu"
        cancelText="Hủy"
      >
        <div style={{ textAlign: 'center', marginBottom: 16, color: '#666' }}>
          Bạn chọn đồng ý hay không đồng ý?
        </div>
        <Radio.Group
          onChange={(e) => setChoice(e.target.value === "true")}
          value={choice ? "true" : "false"}
          style={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}
        >
          <Radio value="true">
            <LikeOutlined style={{ color: "#52c41a", marginRight: 8 }} />
            Đồng ý
          </Radio>
          <Radio value="false">
            <DislikeOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
            Không đồng ý
          </Radio>
        </Radio.Group>
      </Modal>
    </div>
  );
}