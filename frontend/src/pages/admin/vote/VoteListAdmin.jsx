import React, { useEffect, useState } from "react";
import { Card, Table, Button, message } from "antd";
import { useNavigate } from "react-router-dom";

const VoteListAdmin = () => {
  const [votes, setVotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const res = await fetch("http://localhost:3000/votes");
        if (!res.ok) throw new Error("Không thể tải danh sách votes");
        const data = await res.json();
        setVotes(data);
      } catch (err) {
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchVotes();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <Card title="🗳️ Danh sách các cuộc bầu chọn">
        <Table dataSource={votes} loading={loading} rowKey="id">
          <Table.Column title="ID" dataIndex="id" />
          <Table.Column title="Tiêu đề" dataIndex="title" />
          <Table.Column title="Mô tả" dataIndex="description" />
          <Table.Column
            title="Hành động"
            render={(_, record) => (
              <Button
                type="primary"
                onClick={() => navigate(`/admin/vote/${record.id}`)}
              >
                Xem chi tiết
              </Button>
            )}
          />
        </Table>
      </Card>
    </div>
  );
};

export default VoteListAdmin;
