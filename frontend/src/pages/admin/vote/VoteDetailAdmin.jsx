import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Card, Progress, Tag, Spin, message } from "antd";

const VoteDetailAdmin = () => {
  const { id } = useParams();
  const [vote, setVote] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoteDetail = async () => {
      try {
        // ⚠️ Dùng JSON giả hoặc API thật tùy bạn
        const res = await fetch(
          `http://localhost:3000/votes/${id}?_embed=voters`
        );
        if (!res.ok) throw new Error("Không thể tải dữ liệu vote");
        const data = await res.json();
        setVote(data);
      } catch (err) {
        console.error(err);
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVoteDetail();
  }, [id]);

  if (loading) return <Spin tip="Đang tải..." />;

  if (!vote) return <div>❌ Không tìm thấy thông tin vote (ID: {id})</div>;

  const totalVotes = vote.voters?.length || 0;
  const optionCounts = {};
  vote.voters?.forEach((v) => {
    optionCounts[v.choice] = (optionCounts[v.choice] || 0) + 1;
  });

  return (
    <div style={{ padding: 20 }}>
      <Card title={`🗳️ Chủ đề: ${vote.title}`} bordered={false}>
        <p>
          <strong>Mô tả:</strong> {vote.description}
        </p>
        <p>
          <strong>Thời gian:</strong> {vote.start_date} → {vote.end_date}
        </p>
      </Card>

      <br />
      <Card title="📊 Kết quả hiện tại">
        {Object.entries(optionCounts).map(([option, count]) => {
          const percent = totalVotes
            ? Math.round((count / totalVotes) * 100)
            : 0;
          return (
            <div key={option} style={{ marginBottom: 15 }}>
              <strong>{option}</strong>
              <Progress percent={percent} format={() => `${count} phiếu`} />
            </div>
          );
        })}
      </Card>

      <br />
      <Card title="👥 Danh sách người vote">
        <Table
          dataSource={vote.voters || []}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        >
          <Table.Column title="Tên" dataIndex="name" key="name" />
          <Table.Column title="Email" dataIndex="email" key="email" />
          <Table.Column title="Lựa chọn" dataIndex="choice" key="choice" />
          <Table.Column
            title="Trạng thái"
            key="status"
            render={(_, record) => (
              <Tag color={record.choice ? "green" : "red"}>
                {record.choice ? "Đã vote" : "Chưa vote"}
              </Tag>
            )}
          />
        </Table>
      </Card>
    </div>
  );
};

export default VoteDetailAdmin;
