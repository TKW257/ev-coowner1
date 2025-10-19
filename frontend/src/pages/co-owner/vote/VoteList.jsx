import { useEffect, useState } from "react";
import { Card, Button, Spin } from "antd";
import voteApi from "../../../api/voteApi";
import { useNavigate } from "react-router-dom";

const VoteList = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const res = await voteApi.getVoteList();
        setVotes(res);
      } catch (err) {
        console.error("Error fetching votes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVotes();
  }, []);

  if (loading) return <Spin tip="Loading vote topics..." />;

  return (
    <div style={{ padding: 24 }}>
      <h2>Vote Topics</h2>
      {votes.map((topic) => (
        <Card
          key={topic.id}
          title={topic.title}
          style={{ marginBottom: 16 }}
          extra={
            <Button
              type="link"
              onClick={() => navigate(`/owner/vote/${topic.id}`)}
            >
              View Detail
            </Button>
          }
        >
          <p>{topic.description}</p>
          <p>Status: {topic.status}</p>
        </Card>
      ))}
    </div>
  );
};

export default VoteList;
