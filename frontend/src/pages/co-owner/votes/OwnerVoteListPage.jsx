import { useEffect, useState } from "react";
import { Spin, message, Modal, Radio } from "antd";
import TopicCard from "../../../components/vote/TopicCard";
import voteApi from "../../../api/voteApi";

export default function OwnerVoteListPage() {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState(null); // topic đang vote
  const [choice, setChoice] = useState(true); // giá trị radio
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy danh sách topic
  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await voteApi.getUserTopics(); // call API thật hoặc mock
      const data = Array.isArray(res) ? res : res?.data ?? res?.content;
      setTopics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load topics:", err);
      message.error("Failed to load topics");
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // 🔹 Khi nhấn Submit vote
  const handleVote = async () => {
    if (!selected) return;
    try {
      await voteApi.castVote({
        topicId: selected.topicId ?? selected.id,
        agree: choice,
      });
      message.success("Vote submitted!");

      // Cập nhật local state ngay để UI hiển thị vote mới
      setTopics((prev) =>
        prev.map((t) =>
          t.topicId === selected.topicId || t.id === selected.id
            ? { ...t, userVote: choice }
            : t
        )
      );

      setSelected(null);
    } catch (err) {
      console.error("Vote failed:", err);
      message.error("Failed to cast vote");
    }
  };

  // 🔹 Khi mở modal, set choice theo vote trước đó
  const openVoteModal = (topic) => {
    setSelected(topic);
    setChoice(topic.userVote !== undefined ? topic.userVote : true);
  };

  return (
    <Spin spinning={loading} tip="Loading topics..." style={{ minHeight: 120 }}>
      <div className="container mt-4">
        <h2>Vote Topics (Owner)</h2>

        {topics.length === 0 && !loading ? (
          <div>No topics found.</div>
        ) : (
          topics.map((t) => (
            <TopicCard
              key={t.topicId ?? t.id ?? t.topic_id}
              topic={t}
              onDetail={openVoteModal}
            />
          ))
        )}

        <Modal
          open={!!selected}
          onCancel={() => setSelected(null)}
          onOk={handleVote}
          title={`Vote on "${selected?.title}"`}
          afterClose={() => setChoice(true)} // reset choice khi modal đóng
        >
          <Radio.Group
            onChange={(e) =>
              setChoice(e.target.value === true || e.target.value === "true")
            }
            value={choice}
          >
            <Radio value={true}>Agree</Radio>
            <Radio value={false}>Disagree</Radio>
          </Radio.Group>
        </Modal>
      </div>
    </Spin>
  );
}
