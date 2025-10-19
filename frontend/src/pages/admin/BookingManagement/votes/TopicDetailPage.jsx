import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Spin, message } from "antd";
import voteApi from "../../../../api/voteApi";

export default function TopicDetailPage() {
  const { id } = useParams();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVotes = async () => {
    try {
      const res = await voteApi.getVotesByTopic(id);
      setVotes(res.data);
    } catch {
      message.error("Failed to load votes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [id]);

  if (loading) return <Spin tip="Loading votes..." />;

  const columns = [
    { title: "User", dataIndex: "userName" },
    {
      title: "Choice",
      dataIndex: "choice",
      render: (v) => (v ? "Agree" : "Disagree"),
    },
    { title: "Weight", dataIndex: "weight" },
    { title: "Voted At", dataIndex: "votedAt" },
  ];

  return (
    <div className="container mt-4">
      <h2>Vote Detail</h2>
      <Table rowKey="voteId" columns={columns} dataSource={votes} />
    </div>
  );
}
