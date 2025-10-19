import { useEffect, useState } from "react";
import { Button, message, Spin } from "antd";
import voteApi from "../../../../api/voteApi";
import TopicCard from "../../../../components/vote/TopicCard";

import { useNavigate } from "react-router-dom";

export default function AdminVoteListPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTopics = async () => {
    try {
      const res = await voteApi.getAllTopics();
      console.log("Admin voteApi response:", res);
      // Support both: API may return an array directly or an object with .data / .content
      const data = Array.isArray(res) ? res : res?.data ?? res?.content;
      setTopics(Array.isArray(data) ? data : []);
    } catch {
      message.error("Failed to load topics");
    } finally {
      setLoading(false);
    }
  };

  const handleCalculate = async (id) => {
    try {
      await voteApi.calculateResult(id);
      message.success("Result calculated");
      fetchTopics();
    } catch {
      message.error("Failed to calculate");
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  return (
    <Spin spinning={loading} tip="Loading topics...">
      <div className="container mt-4">
        <h2>Voting Topics (Staff)</h2>
        <Button
          type="primary"
          onClick={() => navigate("/admin/vote/create")}
          className="mb-3"
        >
          + Create Topic
        </Button>

        {console.log("Rendering admin topics:", topics)}
        {(!topics || topics.length === 0) && !loading ? (
          <div>No topics found.</div>
        ) : (
          topics.map((t) => {
            const id = t.topicId ?? t.id ?? t.topic_id;
            return (
              <TopicCard
                key={id ?? JSON.stringify(t)}
                topic={t}
                onDetail={(id) => navigate(`/admin/vote/${id}`)}
                onCalculate={handleCalculate}
              />
            );
          })
        )}
      </div>
    </Spin>
  );
}
