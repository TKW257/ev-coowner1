import { useEffect, useState } from "react";
import {
  Button,
  message,
  Spin,
  Tag,
  Card,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
} from "antd";
import voteApi from "../../../api/voteApi";
import vehiclesApi from "../../../api/vehiclesApi";

export default function AdminVoteListPage() {
  const [topics, setTopics] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Load topics + vehicles
  useEffect(() => {
    fetchTopics();
    fetchVehicles();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await voteApi.getAllTopics();
      const data = Array.isArray(res) ? res : res?.data ?? res?.content;
      setTopics(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchTopics error:", err);
      message.error("Không thể tải danh sách chủ đề");
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await vehiclesApi.getAllVehicles();
      const data = Array.isArray(res) ? res : res?.data ?? res?.content;
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchVehicles error:", err);
      message.error("Không thể tải danh sách xe");
    }
  };

  const handleCreateTopic = async () => {
    try {
      const values = await form.validateFields();

      // chuyển requiredRatioPercent (ví dụ 60) -> requiredRatio (0.6)
      const payload = {
        title: values.title,
        description: values.description,
        vehicleId: values.vehicleId,
        decisionType: values.decisionType,
        requiredRatio:
          typeof values.requiredRatioPercent === "number"
            ? Number((values.requiredRatioPercent / 100).toFixed(4))
            : undefined,
      };

      await voteApi.createTopic(payload);
      message.success("Tạo chủ đề thành công!");
      form.resetFields();
      setModalVisible(false);
      fetchTopics();
    } catch (err) {
      console.error("Create topic failed:", err);
      // Try to show server message if present
      const serverMsg =
        err?.response?.data?.message ?? err?.message ?? "Không thể tạo chủ đề";
      message.error(serverMsg);
    }
  };

  const handleCalculate = async (id) => {
    try {
      await voteApi.calculateResult(id);
      message.success("Đã tính kết quả bình chọn");
      fetchTopics();
    } catch (err) {
      console.error("calculateResult error:", err);
      message.error("Không thể tính kết quả");
    }
  };

  const getStatusTag = (topic) => {
    if (topic.resultCalculated || topic.status === "CALCULATED") {
      return <Tag color="green">Đã tính kết quả</Tag>;
    }
    return <Tag color="orange">Chưa tính</Tag>;
  };

  return (
    <Spin spinning={loading} tip="Đang tải danh sách...">
      <div className="container mt-4">
        <h2 className="mb-3">Danh Sách Chủ Đề Bình Chọn (Admin)</h2>

        <Button
          type="primary"
          onClick={() => {
            form.resetFields();
            // set sensible defaults
            form.setFieldsValue({
              decisionType: "MINOR",
              requiredRatioPercent: 50,
            });
            setModalVisible(true);
          }}
          className="mb-3"
        >
          + Tạo Chủ Đề
        </Button>

        {(!topics || topics.length === 0) && !loading ? (
          <div>Không có chủ đề nào.</div>
        ) : (
          topics.map((t) => {
            const id = t.topicId ?? t.id;
            return (
              <Card
                key={id}
                className="mb-3 shadow-sm"
                title={t.title || `Chủ đề #${id}`}
                extra={getStatusTag(t)}
              >
                <p>{t.description || "Không có mô tả."}</p>
                <p>
                  <strong>Xe:</strong>{" "}
                  {t.vehicleName || t.vehicle?.model || t.vehicleId || "N/A"}
                </p>

                <div style={{ display: "flex", gap: 8 }}>
                  <Button
                    type="default"
                    onClick={() => message.info(`Chi tiết topic #${id}`)}
                  >
                    Xem chi tiết
                  </Button>
                  <Button
                    type="primary"
                    disabled={t.resultCalculated || t.status === "CALCULATED"}
                    onClick={() => handleCalculate(id)}
                  >
                    Tính kết quả
                  </Button>
                </div>
              </Card>
            );
          })
        )}

        {/* Modal Tạo Chủ Đề */}
        <Modal
          open={modalVisible}
          title="Tạo Chủ Đề Bình Chọn"
          onOk={handleCreateTopic}
          onCancel={() => setModalVisible(false)}
          okText="Tạo"
          cancelText="Hủy"
          destroyOnClose
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="title"
              label="Tiêu đề chủ đề"
              rules={[{ required: true, message: "Vui lòng nhập tiêu đề!" }]}
            >
              <Input placeholder="Nhập tiêu đề chủ đề" />
            </Form.Item>

            <Form.Item
              name="description"
              label="Mô tả"
              rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
            >
              <Input.TextArea rows={3} placeholder="Nhập mô tả chủ đề" />
            </Form.Item>

            <Form.Item
              name="vehicleId"
              label="Chọn xe áp dụng"
              rules={[{ required: true, message: "Vui lòng chọn xe!" }]}
            >
              <Select placeholder="Chọn 1 xe để bình chọn">
                {vehicles.map((v) => (
                  <Select.Option key={v.vehicleId} value={v.vehicleId}>
                    {v.brand} {v.model} (
                    {v.licensePlate || v.plateNumber || v.plate})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="decisionType"
              label="Loại quyết định"
              rules={[
                { required: true, message: "Vui lòng chọn loại quyết định!" },
              ]}
            >
              <Select>
                <Select.Option value="MINOR">Minor</Select.Option>
                <Select.Option value="MEDIUM">Medium</Select.Option>
                <Select.Option value="MAJOR">Major</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Spin>
  );
}
