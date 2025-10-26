import { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Spin,
} from "antd";
import voteApi from "../../../api/voteApi";
import vehiclesApi from "../../../api/vehiclesApi";
import { useNavigate } from "react-router-dom";

export default function AdminCreateTopicPage() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // ✅ Lấy danh sách xe khi load trang
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehiclesApi.getAllVehicles();
        console.log("🚗 Toàn bộ danh sách xe API:", res);

        // Một số backend trả về { data: [...] } hoặc trả thẳng mảng => cần kiểm tra kỹ
        const vehicleList = Array.isArray(res)
          ? res
          : Array.isArray(res?.data)
          ? res.data
          : [];

        if (vehicleList.length === 0) {
          message.warning("Không có xe nào để tạo biểu quyết!");
        }
        setVehicles(vehicleList);
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách xe:", err);
        message.error("Không thể tải danh sách xe!");
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  // ✅ Mở modal tạo vote cho xe được chọn
  const handleOpenModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    form.resetFields();
    setOpen(true);
  };

  // ✅ Gửi yêu cầu tạo topic
  const handleCreate = async (values) => {
    if (!selectedVehicle) {
      message.warning("Vui lòng chọn xe trước khi tạo biểu quyết");
      return;
    }

    try {
      console.log("📤 Dữ liệu gửi API:", {
        ...values,
        vehicleId: selectedVehicle.vehicleId,
      });

      await voteApi.createTopic({
        ...values,
        vehicleId: selectedVehicle.vehicleId,
      });

      message.success("Tạo chủ đề biểu quyết thành công!");
      setOpen(false);
      navigate("/admin/vote/list");
    } catch (err) {
      console.error("❌ Lỗi khi tạo chủ đề:", err);
      message.error("Tạo chủ đề thất bại, vui lòng thử lại!");
    }
  };

  // ✅ Hiển thị loading khi đang tải dữ liệu
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Đang tải danh sách xe..." />
      </div>
    );

  // ✅ Giao diện
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-700 mb-6">
        Chọn xe để tạo biểu quyết
      </h1>

      <Row gutter={[16, 16]}>
        {vehicles.map((v) => (
          <Col xs={24} sm={12} md={8} lg={6} key={v.vehicleId}>
            <Card
              hoverable
              cover={
                <img
                  alt={v.model}
                  src={v.imageUrl || "https://via.placeholder.com/300x200"}
                  className="h-40 w-full object-cover rounded-t-md"
                />
              }
              actions={[
                <Button type="primary" onClick={() => handleOpenModal(v)}>
                  Tạo biểu quyết
                </Button>,
              ]}
              className="shadow-md hover:shadow-lg bg-white"
            >
              <p className="font-semibold text-gray-700">
                {v.brand} {v.model}
              </p>
              <p>Biển số: {v.plateNumber}</p>
              <p>Màu: {v.color}</p>
              <p>Trạng thái: {v.status}</p>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Modal tạo chủ đề */}
      <Modal
        title={
          selectedVehicle
            ? `Tạo biểu quyết cho xe ${selectedVehicle.model}`
            : "Tạo biểu quyết"
        }
        open={open}
        onCancel={() => setOpen(false)}
        onOk={() => form.submit()}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input placeholder="Ví dụ: Thay động cơ chính" />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="description"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả chi tiết" />
          </Form.Item>

          <Form.Item
            label="Loại quyết định"
            name="decisionType"
            rules={[
              { required: true, message: "Vui lòng chọn loại quyết định" },
            ]}
          >
            <Select
              options={[
                { value: "MINOR", label: "Minor" },
                { value: "MEDIUM", label: "Medium" },
                { value: "MAJOR", label: "Major" },
              ]}
              placeholder="Chọn loại quyết định"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
