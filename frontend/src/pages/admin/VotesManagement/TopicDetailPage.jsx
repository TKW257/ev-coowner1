import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, Spin, message, Button, Space } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import voteApi from "../../../api/voteApi";

export default function TopicDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVotes = async () => {
    console.log("[TopicDetailPage] Fetching votes for topic ID:", id);
    setLoading(true);
    try {
      const res = await voteApi.getVotesByTopic(id);
      console.log("[TopicDetailPage] Votes response:", res);
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setVotes(data);
    } catch (err) {
      console.error("[TopicDetailPage] Error fetching votes:", err);
      message.error("Không thể tải danh sách phiếu bầu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchVotes();
    }
  }, [id]);

  const columns = [
    { 
      title: "ID", 
      dataIndex: "voteId", 
      key: "voteId",
      width: 80,
    },
    { 
      title: "Người dùng", 
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Lựa chọn",
      dataIndex: "choice",
      key: "choice",
      render: (v) => v ? "Đồng ý" : "Không đồng ý",
    },
    { 
      title: "Trọng số", 
      dataIndex: "weight",
      key: "weight",
    },
    { 
      title: "Thời gian bình chọn", 
      dataIndex: "votedAt",
      key: "votedAt",
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/admin/vote')}
          >
            Quay lại
          </Button>
          <h2 style={{ margin: 0, color: "black" }}>Chi Tiết Bình Chọn - Topic #{id}</h2>
        </div>
      </div>

      <Table 
        rowKey="voteId" 
        columns={columns} 
        dataSource={votes}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}