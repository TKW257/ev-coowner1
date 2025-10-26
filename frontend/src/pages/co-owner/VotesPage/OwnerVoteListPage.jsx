import { useEffect, useState } from "react";
import {
  Breadcrumb,
  Card,
  Row,
  Col,
  Spin,
  Modal,
  Radio,
  Button,
  message,
} from "antd";
import { HomeOutlined, UserOutlined } from "@ant-design/icons";
import voteApi from "../../../api/voteApi";

export default function OwnerVoteListPage() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [choice, setChoice] = useState(true);

  const useMock = true; // 👉 bật mock data tạm thời

  const fetchTopics = async () => {
    try {
      if (useMock) {
        // Mock danh sách chủ đề
        const mockData = [];
        setTopics(mockData);
      } else {
        const res = await voteApi.getUserTopics();
        setTopics(res.data || []);
      }
    } catch (err) {
      message.error("Không thể tải danh sách chủ đề");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleVote = async () => {
    try {
      if (useMock) {
        // Giả lập việc vote và cập nhật kết quả
        const updated = topics.map((t) =>
          t.id === selected.id ? { ...t, voted: choice } : t
        );
        setTopics(updated);
        message.success("Bỏ phiếu thành công!");
        setSelected(null);
        return;
      }

      // Gọi API thật
      await voteApi.castVote({ topicId: selected.id, choice });
      message.success("Bỏ phiếu thành công!");
      setSelected(null);
    } catch (err) {
      message.error("Lỗi khi bỏ phiếu");
    }
  };

  if (loading)
    return <Spin className="flex justify-center mt-10" size="large" />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumb
        items={[
          { title: <HomeOutlined /> },
          { title: <UserOutlined /> },
          { title: "Vote Topics" },
        ]}
      />
      <h1 className="text-xl font-semibold text-gray-700 mb-5 mt-2">
        Danh sách chủ đề bình chọn
      </h1>

      <Row gutter={[16, 16]}>
        {topics.map((t) => (
          <Col xs={24} sm={12} md={8} lg={6} key={t.id}>
            <Card
              title={t.title}
              bordered={false}
              className="shadow-md hover:shadow-lg transition-all bg-white"
              actions={[
                <Button
                  type={t.voted !== null ? "default" : "primary"}
                  disabled={t.voted !== null}
                  onClick={() => setSelected(t)}
                >
                  {t.voted !== null ? "Đã bỏ phiếu" : "Bỏ phiếu"}
                </Button>,
              ]}
            >
              <p className="text-gray-600">{t.description}</p>
              {t.voted !== null && (
                <p className="mt-2 text-green-600 font-medium">
                  ✅ Bạn đã chọn: {t.voted ? "Đồng ý" : "Không đồng ý"}
                </p>
              )}
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        open={!!selected}
        onCancel={() => setSelected(null)}
        onOk={handleVote}
        okText="Xác nhận"
        cancelText="Hủy"
        title={`Bỏ phiếu cho: ${selected?.title}`}
      >
        <Radio.Group onChange={(e) => setChoice(e.target.value)} value={choice}>
          <Radio value={true}>Đồng ý</Radio>
          <Radio value={false}>Không đồng ý</Radio>
        </Radio.Group>
      </Modal>
    </div>
  );
}
