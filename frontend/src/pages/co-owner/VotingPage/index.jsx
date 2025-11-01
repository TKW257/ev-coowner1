import { useEffect, useState } from "react";

































import { Spin, message, Modal, Radio, Select, Card, Tag } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  LikeOutlined,
  DislikeOutlined,
  CarOutlined,
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

  // 🧩 Giả lập user (thay cho /api/users/me)
  useEffect(() => {
    const mockUser = JSON.parse(localStorage.getItem("user")) || {
      id: 1,
      fullName: "Demo User",
    };
    setCurrentUser(mockUser);
  }, []);

  // 🟦 Fetch dữ liệu khi có user
  useEffect(() => {
    if (currentUser) {
      fetchVehicles();
      fetchTopics();
    }
  }, [currentUser]);

  // 🟢 Lấy danh sách xe
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

  // 🟢 Lấy danh sách chủ đề + kiểm tra user đã vote chưa
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await voteApi.getUserTopics();
      const data = Array.isArray(res) ? res : res?.data ?? res?.content;
      const list = Array.isArray(data) ? data : [];

      // 🧠 Lấy tất cả phiếu cho từng topic
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

  // 🟨 Gửi phiếu bình chọn
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

  // 🧩 Lọc topic theo xe và trạng thái
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

  // 🌈 Hiển thị tag kết quả vote
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
          Đã bình chọn (Đồng ý)
        </Tag>
      );
    return (
      <Tag color="red" icon={<CloseCircleOutlined />}>
        Đã bình chọn (Không đồng ý)
      </Tag>
    );
  };

  return (
    <Spin spinning={loading} tip="Đang tải danh sách...">
      <div className="container mt-4">
        <h2 className="mb-3 fw-bold" style={{ color: "black" }}>
          🗳️ Danh Sách Bình Chọn (Chủ Sở Hữu)
        </h2>



        {/* Bộ lọc */}
        <div className="d-flex flex-wrap gap-3 mb-4">
          <Select
            style={{ minWidth: 220 }}
            placeholder="🚗 Chọn xe"
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

        {/* Danh sách chủ đề */}
        {filteredTopics.length === 0 ? (
          <div className="text-muted fst-italic">Không có chủ đề phù hợp.</div>
        ) : (
          filteredTopics.map((t) => (
            <Card
              key={t.topicId}
              className="mb-4 shadow-sm rounded-3 border-0"
              hoverable
              title={<div className="fw-semibold">{t.title}</div>}
              extra={renderVoteTag(t)}
            >
              <p className="mb-2 text-secondary">
                {t.description || "Không có mô tả."}
              </p>

              <p>
                <CarOutlined /> <strong>Xe:</strong>{" "}
                <span className="text-primary">{t.vehicleName || "N/A"}</span>
              </p>

              <div className="d-flex gap-2 mt-3">
                {!t.voted ? (
                  <button
                    className="btn btn-primary fw-semibold"
                    onClick={() => {
                      setSelected(t);
                      setChoice(true);
                    }}
                  >
                    <LikeOutlined /> Bình chọn ngay
                  </button>
                ) : (
                  <button className="btn btn-outline-success" disabled>
                    {t.userChoice ? (
                      <>
                        <CheckCircleOutlined /> Đồng ý
                      </>
                    ) : (
                      <>
                        <CloseCircleOutlined /> Không đồng ý
                      </>
                    )}
                  </button>
                )}
              </div>
            </Card>
          ))
        )}

        {/* Modal Vote */}
        <Modal
          open={!!selected}
          onCancel={() => setSelected(null)}
          onOk={handleVote}
          title={`Bình chọn cho "${selected?.title}"`}
          okText="Gửi phiếu"
          cancelText="Hủy"
        >
          <div className="text-center mb-3 text-secondary">
            Bạn chọn đồng ý hay không đồng ý?
          </div>
          <Radio.Group
            onChange={(e) => setChoice(e.target.value === "true")}
            value={choice ? "true" : "false"}
            className="d-flex justify-content-around"
          >
            <Radio value="true">
              <LikeOutlined style={{ color: "#52c41a" }} /> Đồng ý
            </Radio>
            <Radio value="false">
              <DislikeOutlined style={{ color: "#ff4d4f" }} /> Không đồng ý
            </Radio>
          </Radio.Group>
        </Modal>
      </div>
    </Spin>
  );
}