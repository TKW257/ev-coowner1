import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Spin, message } from "antd";
import voteApi from "../../../api/voteApi";

export default function TopicDetailPage() {
  const { id } = useParams();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVotes = async () => {
    try {
      const res = await voteApi.getVotesByTopic(id);
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setVotes(data);
    } catch {
      message.error("Không thể tải danh sách phiếu bầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [id]);

  if (loading) return <Spin tip="Đang tải..." />;

  const columns = [
    { title: "Người dùng", dataIndex: "userName" },
    {
      title: "Lựa chọn",
      dataIndex: "choice",
      render: (v) => (v ? "Đồng ý" : "Không đồng ý"),
    },
    { title: "Trọng số", dataIndex: "weight" },
    { title: "Thời gian bình chọn", dataIndex: "votedAt" },
  ];

  return (
    <div className="container mt-4">
      <h2>Chi Tiết Bình Chọn</h2>
      <Table rowKey="voteId" columns={columns} dataSource={votes} />
    </div>
  );
}
