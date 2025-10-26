import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Table, Spin, Card, Button, message, Row, Col } from "antd";
import voteApi from "../../../api/voteApi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function AdminVoteDetailPage() {
  const { id } = useParams(); // lấy topicId
  const [votes, setVotes] = useState([]);
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1️⃣ Lấy danh sách vote theo topic
        const voteRes = await voteApi.getVotesByTopic(id);
        setVotes(voteRes.data || []);

        // 2️⃣ Lấy thông tin topic để hiển thị chi tiết
        const allTopics = await voteApi.getAllTopics();
        const foundTopic = allTopics.find((t) => t.topicId === Number(id));
        setTopic(foundTopic);
      } catch (err) {
        console.error("❌ Lỗi khi load dữ liệu:", err);
        message.error("Không thể tải dữ liệu chi tiết vote");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 3️⃣ Gọi API tính toán kết quả vote
  const handleCalculate = async () => {
    try {
      const res = await voteApi.calculateResult(id);
      setResult(res.data);
      message.success("Đã tính toán kết quả thành công!");
    } catch {
      message.error("Không thể tính toán kết quả vote");
    }
  };

  if (loading) return <Spin tip="Đang tải chi tiết vote..." />;

  // 📊 Thống kê vote
  const agree = votes.filter((v) => v.choice === true).length;
  const disagree = votes.length - agree;
  const ratio = votes.length ? (agree / votes.length) * 100 : 0;

  const chartData = [
    { name: "Đồng ý", value: agree },
    { name: "Không đồng ý", value: disagree },
  ];
  const COLORS = ["#00C49F", "#FF8042"];

  const columns = [
    { title: "Người dùng", dataIndex: "userName" },
    {
      title: "Lựa chọn",
      dataIndex: "choice",
      render: (v) => (v ? "✅ Đồng ý" : "❌ Không đồng ý"),
    },
    { title: "Trọng số", dataIndex: "weight" },
    { title: "Thời gian vote", dataIndex: "votedAt" },
  ];

  return (
    <div className="p-6">
      {/* 🧾 Thông tin chủ đề */}
      <Card
        title={`Chi tiết chủ đề: ${topic?.title || "Không xác định"}`}
        className="mb-4"
      >
        <p>
          <strong>Mô tả:</strong> {topic?.description}
        </p>
        <p>
          <strong>Loại quyết định:</strong> {topic?.decisionType}
        </p>
        <p>
          <strong>Tỷ lệ yêu cầu:</strong> {topic?.requiredRatio * 100}%
        </p>
      </Card>

      {/* 📋 Danh sách phiếu */}
      <Card title="Danh sách phiếu bầu" className="mb-4">
        <Table
          rowKey="voteId"
          columns={columns}
          dataSource={votes}
          pagination={false}
        />
      </Card>

      {/* 📈 Kết quả tổng hợp + Biểu đồ */}
      <Card title="Kết quả tổng hợp">
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <p>
              <strong>Tổng phiếu:</strong> {votes.length}
            </p>
            <p>
              <strong>Đồng ý:</strong> {agree}
            </p>
            <p>
              <strong>Không đồng ý:</strong> {disagree}
            </p>
            <p>
              <strong>Tỷ lệ đồng ý:</strong> {ratio.toFixed(1)}%
            </p>
            <p>
              <strong>Kết luận:</strong>{" "}
              {ratio >= (topic?.requiredRatio || 0) * 100
                ? "✅ Được thông qua"
                : "❌ Không đạt tỷ lệ"}
            </p>

            <Button type="primary" onClick={handleCalculate}>
              Cập nhật kết quả từ server
            </Button>

            {result && (
              <p className="mt-3">
                <strong>Kết quả server:</strong>{" "}
                {result.passed ? "✅ Được thông qua" : "❌ Không đạt tỷ lệ"} (
                {result.agreeRatio}% đồng ý)
              </p>
            )}
          </Col>

          {/* Biểu đồ tròn */}
          <Col xs={24} md={12}>
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}
