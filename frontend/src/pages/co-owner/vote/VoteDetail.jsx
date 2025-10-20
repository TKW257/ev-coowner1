import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Radio, Spin, message } from "antd";
import voteApi from "../../../api/voteApi";

const VoteDetail = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [choice, setChoice] = useState(null);
  const [loading, setLoading] = useState(true);

  const userId = 1; // giả định user đang đăng nhập
  const ownershipId = 1; // giả định ownership của user

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await voteApi.getVoteDetail(id);
        setDetail(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const handleVote = async () => {
    try {
      await voteApi.castVote({
        topicId: parseInt(id),
        ownershipId,
        userId,
        choice: choice === "YES" ? "YES" : "NO",
      });
      message.success("Vote submitted!");
    } catch (err) {
      console.error(err);
      message.error("You already voted or something went wrong");
    }
  };

  if (loading)
    return (
      <Spin tip="Loading...">
        <div style={{ minHeight: 100 }} /> {/* hoặc nội dung placeholder */}
      </Spin>
    );

  if (!detail) return <p>No detail found.</p>;

  return (
    <Card title={detail.title} style={{ margin: 24 }}>
      <p>{detail.description}</p>
      <p>Status: {detail.status}</p>

      <Radio.Group onChange={(e) => setChoice(e.target.value)} value={choice}>
        <Radio value="YES">Yes</Radio>
        <Radio value="NO">No</Radio>
      </Radio.Group>

      <br />
      <Button
        type="primary"
        onClick={handleVote}
        disabled={!choice}
        style={{ marginTop: 16 }}
      >
        Submit Vote
      </Button>
    </Card>
  );
};

export default VoteDetail;
