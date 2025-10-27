import { useEffect, useState } from "react";
import { Spin, message, Modal, Radio } from "antd";
import voteApi from "../../../api/voteApi";
import TopicCard from "../../../components/vote/TopicCard";

export default function OwnerVoteListPage() {
  const [topics, setTopics] = useState([]);
  const [selected, setSelected] = useState(null);
  const [choice, setChoice] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await voteApi.getUserTopics();
      console.log("voteApi response:", res);
      // Support both: API may return an array directly or an object with .data / .content
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

  const handleVote = async () => {
    if (!selected) return;
    try {
      await voteApi.castVote({ topicId: selected.topicId, agree: choice });
      message.success("Vote submitted!");
      setSelected(null);
      fetchTopics();
    } catch (err) {
      console.error("Vote failed:", err);
      message.error("Failed to cast vote");
    }
  };

  return (
    <Spin spinning={loading} tip="Loading topics..." style={{ minHeight: 120 }}>
      <div className="container mt-4">
        <h2>Vote Topics (Owner)</h2>

        {console.log("Rendering topics:", topics)}
        {topics.length === 0 && !loading ? (
          <div>No topics found.</div>
        ) : (
          topics.map((t) => {
            const id = t.topicId ?? t.id ?? t.topic_id;
            return (
              <TopicCard
                key={id ?? JSON.stringify(t)}
                topic={t}
                onDetail={() => setSelected(t)}
              />
            );
          })
        )}

        <Modal
          open={!!selected}
          onCancel={() => setSelected(null)}
          onOk={handleVote}
          title={`Vote on "${selected?.title}"`}
        >
          <Radio.Group
            onChange={(e) => setChoice(e.target.value === "true")}
            value={choice}
          >
            <Radio value={"true"}>Agree</Radio>
            <Radio value={"false"}>Disagree</Radio>
          </Radio.Group>
        </Modal>
      </div>
    </Spin>
  );
}
