import { useEffect, useState } from "react";
import {
  Button,
  message,
  Table,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Space,
  Tooltip,
  Checkbox,
} from "antd";
import { PlusOutlined, EyeOutlined, CalculatorOutlined, SearchOutlined } from "@ant-design/icons";
import voteApi from "../../../api/voteApi";
import vehiclesApi from "../../../api/vehiclesApi";

export default function AdminVoteListPage() {
  const [topics, setTopics] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  // Filter states
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

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

  // Get unique vehicle names for filtering
  const getUniqueVehicles = () => {
    const vehicleSet = new Set();
    topics.forEach(topic => {
      const vehicleName = topic.vehicleName || topic.vehicle?.model || topic.vehicleId || "N/A";
      vehicleSet.add(vehicleName);
    });
    return Array.from(vehicleSet).sort();
  };

  const handleVehicleFilterChange = (checkedValues) => {
    setSelectedVehicles(checkedValues);
  };

  const handleStatusFilterChange = (checkedValues) => {
    setSelectedStatuses(checkedValues);
  };

  const clearFilter = (filterType) => {
    if (filterType === 'vehicle') {
      setSelectedVehicles([]);
    } else if (filterType === 'status') {
      setSelectedStatuses([]);
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "topicId",
      key: "topicId",
      width: 80,
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
      ellipsis: {
        showTitle: false,
      },
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      ellipsis: {
        showTitle: false,
      },
      render: (desc) => (
        <Tooltip placement="topLeft" title={desc || "Không có mô tả"}>
          {desc || "Không có mô tả"}
        </Tooltip>
      ),
    },
    {
      title: "Xe áp dụng",
      dataIndex: "vehicleName",
      key: "vehicleName",
      ellipsis: {
        showTitle: false,
      },
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <div style={{ marginBottom: 8, maxHeight: 300, overflow: 'auto' }}>
            <Checkbox.Group
              options={getUniqueVehicles().map(v => ({ label: v, value: v }))}
              value={selectedVehicles}
              onChange={(values) => {
                setSelectedVehicles(values);
                setSelectedKeys(values);
              }}
            />
          </div>
          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button
              size="small"
              onClick={() => {
                clearFilters();
                setSelectedVehicles([]);
              }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
            >
              Tìm
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => {
        const displayName = record.vehicleName || record.vehicle?.model || record.vehicleId || "N/A";
        return displayName === value;
      },
      filteredValue: selectedVehicles.length > 0 ? selectedVehicles : null,
      render: (vehicleName, record) => {
        const displayName = vehicleName || record.vehicle?.model || record.vehicleId || "N/A";
        return (
          <Tooltip placement="topLeft" title={displayName}>
            {displayName}
          </Tooltip>
        );
      },
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 150,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <Checkbox.Group
              options={[
                { label: 'Đã tính kết quả', value: 'calculated' },
                { label: 'Chưa tính', value: 'pending' }
              ]}
              value={selectedStatuses}
              onChange={(values) => {
                setSelectedStatuses(values);
                setSelectedKeys(values);
              }}
            />
          </div>
          <Space style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <Button
              size="small"
              onClick={() => {
                clearFilters();
                setSelectedStatuses([]);
              }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
            >
              Tìm
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilter: (value, record) => {
        const isCalculated = record.resultCalculated || record.status === "CALCULATED";
        if (value === 'calculated') return isCalculated;
        if (value === 'pending') return !isCalculated;
        return true;
      },
      filteredValue: selectedStatuses.length > 0 ? selectedStatuses : null,
      render: (_, record) => getStatusTag(record),
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_, record) => {
        const id = record.topicId ?? record.id;
        const isCalculated = record.resultCalculated || record.status === "CALCULATED";
        
        return (
          <Space size="middle">
            <Tooltip title="Xem chi tiết">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => message.info(`Chi tiết topic #${id}`)}
              />
            </Tooltip>
            <Tooltip title="Tính kết quả">
              <Button
                type="link"
                icon={<CalculatorOutlined />}
                disabled={isCalculated}
                onClick={() => handleCalculate(id)}
              />
            </Tooltip>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: "black" }}>
        <h2>Danh Sách Chủ Đề Bình Chọn (Admin)</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            // set sensible defaults
            form.setFieldsValue({
              decisionType: "MINOR",
              requiredRatioPercent: 50,
            });
            setModalVisible(true);
          }}
        >
          Tạo Chủ Đề
        </Button>
      </div>

      <Table
        rowKey={(record) => record.topicId ?? record.id}
        columns={columns}
        dataSource={topics}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

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
                  {v.brand} {v.model} ({v.licensePlate || v.plateNumber || v.plate})
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

          <Form.Item
            name="requiredRatioPercent"
            label="Tỷ lệ yêu cầu (%)"
            rules={[
              { required: true, message: "Vui lòng nhập tỷ lệ yêu cầu!" },
              { type: 'number', min: 1, max: 100, message: "Tỷ lệ phải từ 1 đến 100!" }
            ]}
          >
            <InputNumber
              min={1}
              max={100}
              placeholder="Nhập tỷ lệ yêu cầu (1-100%)"
              style={{ width: '100%' }}
              addonAfter="%"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}