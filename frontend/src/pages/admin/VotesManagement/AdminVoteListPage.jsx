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
  Card,
  Tooltip,
  Checkbox,
  Spin,
  Descriptions,
} from "antd";
import { PlusOutlined, EyeOutlined, CalculatorOutlined, SearchOutlined, FileTextOutlined } from "@ant-design/icons";
import { PieChart, Pie, Cell, Tooltip as ReTooltip, Legend, ResponsiveContainer } from "recharts";
import voteApi from "../../../api/voteApi";
import vehiclesApi from "../../../api/vehiclesApi";
import feeApi from "../../../api/feeApi";
import ownerShipsApi from "../../../api/ownerShipsApi";

export default function AdminVoteListPage() {
  const [topics, setTopics] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmCalculateVisible, setConfirmCalculateVisible] = useState(false);
  const [calculatingId, setCalculatingId] = useState(null);
  const [form] = Form.useForm();

  // Detail modal states
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [votes, setVotes] = useState([]);
  const [votesLoading, setVotesLoading] = useState(false);

  // Fee invoice modal states
  const [feeModalVisible, setFeeModalVisible] = useState(false);
  const [feeForm] = Form.useForm();
  const [feeLoading, setFeeLoading] = useState(false);
  const [emailOptions, setEmailOptions] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  
  // Filter states
  const [selectedVehicles, setSelectedVehicles] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState([]);

  const agreeCount = votes.filter(v => v.choice === true).length;
  const disagreeCount = votes.filter(v => v.choice === false).length;

  const chartData = [
    { name: "Đồng ý", value: agreeCount },
    { name: "Không đồng ý", value: disagreeCount },
  ];

  const COLORS = ["#52c41a", "#ff4d4f"];

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
    } catch {
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
    } catch {
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
        amount: values.amount ? Number(values.amount) : undefined,
      };

      await voteApi.createTopic(payload);
      message.success("Tạo chủ đề thành công!");
      form.resetFields();
      setModalVisible(false);
      fetchTopics();
    } catch (err) {
      // Try to show server message if present
      const serverMsg =
        err?.response?.data?.message ?? err?.message ?? "Không thể tạo chủ đề";
      message.error(serverMsg);
    }
  };

  const handleCalculate = (id) => {
    setCalculatingId(id);
    setConfirmCalculateVisible(true);
  };

  const confirmCalculate = async () => {
    if (!calculatingId) return;
    
    try {
      await voteApi.calculateResult(calculatingId);
      message.success("Đã tính kết quả bình chọn");
      setConfirmCalculateVisible(false);
      setCalculatingId(null);
      fetchTopics();
    } catch (err) {
      const serverMsg = err?.response?.data?.message ?? err?.message ?? "Không thể tính kết quả";
      message.error(serverMsg);
    }
  };

  const handleViewDetail = async (record) => {
    setSelectedTopic(record);
    setDetailModalVisible(true);
    setVotesLoading(true);

    try {
      const id = record.topicId ?? record.id;
      const res = await voteApi.getVotesByTopic(id);
      const data = Array.isArray(res) ? res : res?.data ?? [];
      setVotes(data);
    } catch {
      message.error("Không thể tải danh sách phiếu bầu");
      setVotes([]);
    } finally {
      setVotesLoading(false);
    }
  };

  const handleCreateFee = async (record) => {
    feeForm.resetFields();
    setFeeModalVisible(true);
    setLoadingEmails(true);
    
    try {
      // Gọi API để lấy danh sách ownership theo vehicleId
      console.log("===========================================");
      console.log("🔍 [CREATE FEE] Gọi API getMyGroupOwnership");
      console.log("VehicleId:", record.vehicleId);
      console.log("===========================================");
      
      const res = await ownerShipsApi.getMyGroupOwnership(record.vehicleId);
      
      console.log("✅ [CREATE FEE] API Response nhận được:");
      console.log("Full Response:", JSON.stringify(res, null, 2));
      console.log("Response Type:", typeof res);
      console.log("Is Array:", Array.isArray(res));
      console.log("Response Keys:", Object.keys(res || {}));
      
      const data = Array.isArray(res) ? res : res?.data || [];
      
      console.log("📋 [CREATE FEE] Data sau khi xử lý:");
      console.log("Data Array:", JSON.stringify(data, null, 2));
      console.log("Data Length:", data.length);
      
      // Log từng item để xem cấu trúc
      if (data.length > 0) {
        console.log("\n📦 [CREATE FEE] Chi tiết từng item trong response:");
        data.forEach((item, index) => {
          console.log(`\n--- Item ${index + 1} ---`);
          console.log(JSON.stringify(item, null, 2));
          console.log("Keys:", Object.keys(item));
          if (item.user) {
            console.log("User object:", JSON.stringify(item.user, null, 2));
            console.log("User keys:", Object.keys(item.user));
          }
        });
      } else {
        console.log("⚠️ [CREATE FEE] Data rỗng - không có ownership nào");
      }
      
      // Trích xuất userName từ danh sách ownership
      const userNames = data
        .map((item, index) => {
          const userName = item.userName || item.user?.userName;
          console.log(`[AdminVoteListPage] Item ${index} userName extraction:`, {
            item,
            userName,
            'item.userName': item.userName,
            'item.user?.userName': item.user?.userName,
          });
          return userName;
        })
        .filter(userName => userName && userName.trim()); // Loại bỏ userName rỗng
      
      console.log("[AdminVoteListPage] Extracted userNames:", userNames);
      
      // Tạo options cho Select
      const emailList = userNames.map(userName => ({
        label: userName,
        value: userName,
      }));
      
      console.log("[AdminVoteListPage] Email options list (from userName):", emailList);
      setEmailOptions(emailList);
      
      // Tự động set userName đầu tiên nếu có
      const formValues = {
        vehicleId: record.vehicleId,
        amount: record.amount || undefined,
        email: userNames.length > 0 ? userNames : undefined,
      };
      console.log("[AdminVoteListPage] Setting form values:", formValues);
      feeForm.setFieldsValue(formValues);
    } catch (err) {
      console.error("[AdminVoteListPage] Error fetching group ownership:", err);
      console.error("[AdminVoteListPage] Error response:", err?.response);
      console.error("[AdminVoteListPage] Error response data:", err?.response?.data);
      console.error("[AdminVoteListPage] Error message:", err?.message);
      message.error("Không thể tải danh sách email");
      setEmailOptions([]);
      feeForm.setFieldsValue({
        vehicleId: record.vehicleId,
        amount: record.amount || undefined,
      });
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleCreateFeeSubmit = async () => {
    try {
      const values = await feeForm.validateFields();
      setFeeLoading(true);
  
      const vehicleId = typeof values.vehicleId === 'string' ? parseInt(values.vehicleId, 10) : values.vehicleId;
      const emails = Array.isArray(values.email)
        ? values.email
        : [values.email.trim()];
  
      // Gửi song song tất cả email bằng Promise.all
      await Promise.all(
        emails.map(email => {
          const payload = {
            vehicleId,
            email,
            type: "Upgrade",
            amount: Number(values.amount),
            description: values.description.trim(),
          };
          return feeApi.createVariableFee(payload);
        })
      );
  
      message.success(`Đã tạo hóa đơn phát sinh cho ${emails.length} người dùng!`);
      feeForm.resetFields();
      setFeeModalVisible(false);
    } catch (err) {
      if (err?.response?.status === 403) {
        message.error("Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại với tài khoản ADMIN.");
      } else if (err?.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        const serverMsg = err?.response?.data?.message ?? err?.message ?? "Không thể tạo hóa đơn phát sinh";
        message.error(serverMsg);
      }
    } finally {
      setFeeLoading(false);
    }
  };

  const voteColumns = [
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

  const getStatusTag = (topic) => {
    const status = topic.status;
    const statusMap = {
      PENDING: { color: "orange", text: "Đang chờ" },
      APPROVED: { color: "green", text: "Đã phê duyệt" },
      REJECTED: { color: "red", text: "Đã từ chối" },
      EXPIRED: { color: "default", text: "Hết hạn" },
    };

    const statusInfo = statusMap[status] || { color: "default", text: status || "N/A" };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
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
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
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
      dataIndex: "status",
      key: "status",
      width: 150,
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <Checkbox.Group
              options={[
                { label: 'Đang chờ', value: 'PENDING' },
                { label: 'Đã phê duyệt', value: 'APPROVED' },
                { label: 'Đã từ chối', value: 'REJECTED' },
                { label: 'Hết hạn', value: 'EXPIRED' }
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
        return record.status === value;
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
        const canCalculate = record.status === "PENDING";
        const canCreateFee = record.status === "APPROVED";

        return (
          <Space size="middle">
            <Tooltip title="Xem chi tiết">
              <Button
                type="link"
                icon={<EyeOutlined />}
                onClick={() => handleViewDetail(record)}
              />
            </Tooltip>
            <Tooltip title="Tính kết quả">
              <Button
                type="link"
                icon={<CalculatorOutlined />}
                disabled={!canCalculate}
                onClick={() => handleCalculate(id)}
              />
            </Tooltip>
            {canCreateFee && (
              <Tooltip title="Tạo hóa đơn phát sinh">
                <Button
                  type="link"
                  icon={<FileTextOutlined />}
                  onClick={() => handleCreateFee(record)}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: "black" }}>
        <h2>Danh Sách Chủ Đề Bình Chọn </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields();
            // set sensible defaults
            form.setFieldsValue({
              decisionType: "MINOR",
              requiredRatioPercent: 40,
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
            <Select
              onChange={(value) => {
                // Tự động set tỷ lệ yêu cầu dựa trên loại quyết định
                if (value === "MINOR") {
                  form.setFieldsValue({ requiredRatioPercent: 40 });
                } else if (value === "MEDIUM") {
                  form.setFieldsValue({ requiredRatioPercent: 60 });
                } else if (value === "MAJOR") {
                  form.setFieldsValue({ requiredRatioPercent: 80 });
                }
              }}
            >
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
              { type: 'number', min: 0, max: 100, message: "Tỷ lệ phải từ 0 đến 100!" }
            ]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="Tự động theo loại quyết định"
              style={{ width: '100%' }}
              addonAfter="%"
              disabled
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Giá tiền"
            rules={[
              { required: true, message: "Vui lòng nhập giá tiền!" },
              { type: 'number', min: 0, message: "Giá tiền phải lớn hơn hoặc bằng 0!" }
            ]}
          >
            <InputNumber
              min={0}
              placeholder="Nhập giá tiền"
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Xác nhận Tính Kết quả */}
      <Modal
        open={confirmCalculateVisible}
        onOk={confirmCalculate}
        onCancel={() => {
          setConfirmCalculateVisible(false);
          setCalculatingId(null);
        }}
        okText="Xác nhận"
        cancelText="Hủy"
        title="Xác nhận tính kết quả"
      >
        <p>Bạn có chắc chắn muốn tính kết quả bình chọn cho chủ đề này?</p>
        <p>Thao tác này không thể hoàn tác.</p>
      </Modal>

      {/* Modal Chi Tiết Bình Chọn */}
      <Modal
        open={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedTopic(null);
          setVotes([]);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setDetailModalVisible(false);
            setSelectedTopic(null);
            setVotes([]);
          }}>
            Đóng
          </Button>
        ]}
        title={`Chi Tiết Bình Chọn - Topic #${selectedTopic?.topicId ?? selectedTopic?.id ?? ''}`}
        width={1000}
        destroyOnClose
      >
        {selectedTopic && (
          <>
            <Descriptions bordered column={2} style={{ marginBottom: 24 }}>
              <Descriptions.Item label="ID">{selectedTopic.topicId ?? selectedTopic.id}</Descriptions.Item>
              <Descriptions.Item label="Tiêu đề">{selectedTopic.title}</Descriptions.Item>
              <Descriptions.Item label="Mô tả" span={2}>{selectedTopic.description}</Descriptions.Item>
              <Descriptions.Item label="Xe áp dụng">
                {selectedTopic.vehicleName || selectedTopic.vehicle?.model || selectedTopic.vehicleId || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedTopic)}
              </Descriptions.Item>
              <Descriptions.Item label="Loại quyết định">
                {selectedTopic.decisionType || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Tỷ lệ yêu cầu">
                {selectedTopic.requiredRatio
                  ? `${(selectedTopic.requiredRatio * 100).toFixed(2)}%`
                  : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Giá tiền">
                {selectedTopic.amount 
                  ? `${selectedTopic.amount.toLocaleString('vi-VN')} VNĐ`
                  : "N/A"}
              </Descriptions.Item>
            </Descriptions>

            <Card title="Tỷ lệ bình chọn" style={{ marginBottom: 24 }}>
              {votesLoading || votes.length === 0 ? (
                <Spin />
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ReTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>


            <div>
              <h3 style={{ marginBottom: 16 }}>Danh sách phiếu bầu</h3>
              <Spin spinning={votesLoading}>
                <Table
                  rowKey="voteId"
                  columns={voteColumns}
                  dataSource={votes}
                  loading={votesLoading}
                  pagination={{ pageSize: 5 }}
                  size="small"
                />
              </Spin>
            </div>
          </>
        )}
      </Modal>

      {/* Modal Tạo Hóa Đơn Phát Sinh */}
      <Modal
        open={feeModalVisible}
        title="Tạo Hóa Đơn Phát Sinh"
        onOk={handleCreateFeeSubmit}
        onCancel={() => {
          setFeeModalVisible(false);
          feeForm.resetFields();
        }}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={feeLoading}
        destroyOnClose
      >
        <Form form={feeForm} layout="vertical">
          <Form.Item
            name="vehicleId"
            label="ID Xe"
            rules={[{ required: true, message: "Vui lòng chọn xe!" }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một email!" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder={loadingEmails ? "Đang tải danh sách email..." : "Chọn email người dùng"}
              options={emailOptions}
              loading={loadingEmails}
              notFoundContent={loadingEmails ? "Đang tải..." : "Không có email nào"}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền!" },
              { type: 'number', min: 0, message: "Số tiền phải lớn hơn 0!" }
            ]}
          >
            <InputNumber
              min={0}
              placeholder="Tự động từ giá tiền của chủ đề"
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              disabled
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả hóa đơn phát sinh" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}