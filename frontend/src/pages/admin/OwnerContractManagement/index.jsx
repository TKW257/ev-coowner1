import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  message,
  Space,
  Tag,
  Descriptions,
  Tooltip,
  Typography,
  Spin,
  Empty,
} from "antd";
import { PlusOutlined, EyeOutlined } from "@ant-design/icons";
import ownerContractsApi from "../../../api/owner-contractsApi";
import contractApi from "../../../api/contractApi";

const { Title } = Typography;

const BASE_URL = "https://vallate-enzootically-sterling.ngrok-free.dev";

const OwnerContractManagement = () => {
  const [ownerContracts, setOwnerContracts] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedOwnerContract, setSelectedOwnerContract] = useState(null);
  const [selectedContractForCreate, setSelectedContractForCreate] = useState(null);
  const [createForm] = Form.useForm();

  useEffect(() => {
    fetchOwnerContracts();
    fetchApprovedContracts();
  }, []);

  /** Chuyển array ngày [YYYY,MM,DD] thành Date */
  const parseDate = (dateArr) => {
    if (!dateArr) return null;
    if (Array.isArray(dateArr)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = dateArr;
      return new Date(year, month - 1, day, hour, minute, second);
    }
    return new Date(dateArr);
  };

  /** Xây URL ảnh đầy đủ */
  const buildUrl = (path) => {
    if (!path) return null;
    const fixedPath = path.replace(/\\/g, "/");
    return fixedPath.startsWith("http")
      ? fixedPath
      : `${BASE_URL}${fixedPath.startsWith("/") ? fixedPath : `/${fixedPath}`}`;
  };

  const fetchOwnerContracts = async () => {
    setLoading(true);
    try {
      const response = await ownerContractsApi.getAll();
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (response?.data && Array.isArray(response.data)) data = response.data;
      else if (response?.content && Array.isArray(response.content)) data = response.content;
      setOwnerContracts(data);
    } catch (error) {
      console.error("Error fetching owner contracts:", error);
      message.error("Không tải được danh sách Owner Contract!");
      setOwnerContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedContracts = async () => {
    try {
      const response = await contractApi.getAll();
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (response?.data && Array.isArray(response.data)) data = response.data;
      else if (response?.content && Array.isArray(response.content)) data = response.content;
      const approved = data.filter((c) => c.status === "APPROVED");
      setContracts(approved);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      setContracts([]);
    }
  };

  const handleViewDetails = (record) => {
    setSelectedOwnerContract(record);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setSelectedOwnerContract(null);
    setDetailModalVisible(false);
  };

  const handleCreateOwnerContract = () => {
    setCreateModalVisible(true);
    createForm.resetFields();
    setSelectedContractForCreate(null);
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
    setSelectedContractForCreate(null);
  };

  const handleContractSelect = (contractId) => {
    const selected = contracts.find(c => (c.contractId || c.id) === contractId);
    setSelectedContractForCreate(selected || null);
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const data = { contractId: values.contractId };
      await ownerContractsApi.create(data);
      message.success("Tạo Owner Contract thành công!");
      handleCloseCreateModal();
      fetchOwnerContracts();
      fetchApprovedContracts();
    } catch (error) {
      console.error("Error creating owner contract:", error);
      message.error("Không thể tạo Owner Contract!");
    }
  };

  /** Hiển thị trạng thái tiếng Việt */
  const renderStatus = (status) => {
    const map = {
      PENDING: { text: "Đang chờ duyệt", color: "orange" },
      APPROVED: { text: "Đã được duyệt", color: "green" },
      COMPLETED: { text: "Đã bán đủ cổ phần", color: "blue" },
      EXPIRED: { text: "Hết hạn hợp đồng", color: "red" },
    };
    const { text, color } = map[status] || { text: status || "-", color: "default" };
    return <Tag color={color}>{text}</Tag>;
  };

  const columns = [
    {
      title: "Mã Owner Contract",
      dataIndex: "ownerContractId",
      key: "ownerContractId",
      render: (id, record) => id || record.id || "-",
    },
    {
      title: "Mã Contract",
      key: "contract",
      render: (_, record) => record.contract?.contractId || record.contractId || "-",
    },
    {
      title: "Người ký (Chủ xe)",
      key: "user",
      render: (_, record) => {
        const user = record.contract?.user || record.user;
        return user?.fullName || user?.email || "-";
      },
    },
    {
      title: "Xe",
      key: "vehicle",
      render: (_, record) => {
        const v = record.contract?.vehicle || record.vehicle;
        return v ? `${v.brand} ${v.model} (${v.plateNumber})` : "-";
      },
    },
    {
      title: "% Sở hữu",
      key: "salePercentage",
      render: (_, record) => `${record.contract?.salePercentage || record.salePercentage || 0}%`,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => {
        const d = parseDate(date);
        return d && !isNaN(d) ? d.toLocaleDateString("vi-VN") : "-";
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Title level={2}>Quản Lý Owner Contract</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateOwnerContract}>
          Tạo Owner Contract
        </Button>
      </div>

      {loading ? (
        <Spin tip="Đang tải dữ liệu..." size="large" style={{ width: "100%", marginTop: 100 }} />
      ) : ownerContracts.length === 0 ? (
        <Empty description="Không có Owner Contract nào" />
      ) : (
        <Table
          rowKey={(r) => (r.ownerContractId || r.id).toString()}
          dataSource={ownerContracts}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* 🔍 Modal chi tiết */}
      <Modal
        title="Chi tiết Owner Contract"
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={<Button onClick={handleCloseDetailModal}>Đóng</Button>}
        width={900}
      >
        {selectedOwnerContract && (() => {
          const contract = selectedOwnerContract.contract || {};
          const user = contract.user || selectedOwnerContract.user;
          const vehicle = contract.vehicle || selectedOwnerContract.vehicle;

          const adminSig = buildUrl(contract.adminSignature);
          const userSig = buildUrl(contract.userSignature);

          return (
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Mã Owner Contract">
                {selectedOwnerContract.ownerContractId || selectedOwnerContract.id || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {parseDate(selectedOwnerContract.createdAt)?.toLocaleString("vi-VN") || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Mã Contract">
                {contract.contractId || contract.id || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái Contract">
                {renderStatus(contract.status)}
              </Descriptions.Item>

              <Descriptions.Item label="Người ký (Chủ xe)" span={2}>
                {user ? user.fullName || user.email : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Xe" span={2}>
                {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plateNumber})` : "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Màu sắc">{vehicle?.color || "-"}</Descriptions.Item>
              <Descriptions.Item label="Năm SX">{vehicle?.year || "-"}</Descriptions.Item>
              <Descriptions.Item label="Giá/phần">
                {contract.pricePerShare
                  ? `${contract.pricePerShare.toLocaleString()} VND`
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="% Sở hữu">
                {contract.salePercentage ? `${contract.salePercentage}%` : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                {parseDate(contract.startDate)?.toLocaleDateString("vi-VN") || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kết thúc">
                {parseDate(contract.endDate)?.toLocaleDateString("vi-VN") || "-"}
              </Descriptions.Item>

              <Descriptions.Item label="Chữ ký Admin">
                {adminSig ? (
                  <img
                    src={adminSig}
                    alt="Admin Signature"
                    style={{ maxHeight: 100, border: "1px solid #ccc", borderRadius: 4 }}
                  />
                ) : (
                  "Không có"
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Chữ ký User">
                {userSig ? (
                  <img
                    src={userSig}
                    alt="User Signature"
                    style={{ maxHeight: 100, border: "1px solid #ccc", borderRadius: 4 }}
                  />
                ) : (
                  "Không có"
                )}
              </Descriptions.Item>
            </Descriptions>
          );
        })()}
      </Modal>

      {/* 🆕 Modal tạo mới */}
      <Modal
        title="Tạo Owner Contract Mới"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={handleCloseCreateModal}
        okText="Tạo"
        cancelText="Hủy"
        width={800}
      >
        <Form form={createForm} layout="vertical">
          <Form.Item
            name="contractId"
            label="Chọn Contract (chỉ hiển thị contract đã APPROVED)"
            rules={[{ required: true, message: "Vui lòng chọn contract!" }]}
          >
            <Select 
              placeholder="Chọn contract" 
              showSearch
              onChange={handleContractSelect}
            >
              {contracts.map((contract) => {
                const v = contract.vehicle;
                const u = contract.user;
                return (
                  <Select.Option
                    key={contract.contractId || contract.id}
                    value={contract.contractId || contract.id}
                  >
                    #{contract.contractId || contract.id} – {v ? `${v.brand} ${v.model}` : "N/A"} –{" "}
                    {u ? u.fullName || u.email : "N/A"}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>

          {/* Hiển thị thông tin khi đã chọn contract */}
          {selectedContractForCreate && (
            <div style={{ marginTop: 24, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
              <Typography.Title level={5} style={{ marginBottom: 16 }}>Thông tin Owner Contract sẽ được tạo:</Typography.Title>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Owner Contract ID" span={1}>
                  <span style={{ color: '#999', fontStyle: 'italic' }}>Sẽ được tạo tự động</span>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo" span={1}>
                  {new Date().toLocaleString('vi-VN')}
                </Descriptions.Item>

                <Descriptions.Item label="User (Chủ xe)" span={1}>
                  {selectedContractForCreate.user ? (
                    selectedContractForCreate.user.fullName || selectedContractForCreate.user.email || 'N/A'
                  ) : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Admin" span={1}>
                  <span style={{ color: '#999', fontStyle: 'italic' }}>Sẽ được gán tự động</span>
                </Descriptions.Item>

                <Descriptions.Item label="Share Percentage" span={1}>
                  {selectedContractForCreate.salePercentage ? `${selectedContractForCreate.salePercentage}%` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Contract Status" span={1}>
                  {renderStatus(selectedContractForCreate.status)}
                </Descriptions.Item>

                <Descriptions.Item label="User Signature" span={1}>
                  {buildUrl(selectedContractForCreate.userSignature) ? (
                    <img
                      src={buildUrl(selectedContractForCreate.userSignature)}
                      alt="User Signature"
                      style={{ maxWidth: 200, maxHeight: 80, border: "1px solid #ccc", borderRadius: 4 }}
                      onError={(e) => e.target.style.display = "none"}
                    />
                  ) : (
                    <span style={{ color: "#999" }}>Không có</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Admin Signature" span={1}>
                  {buildUrl(selectedContractForCreate.adminSignature) ? (
                    <img
                      src={buildUrl(selectedContractForCreate.adminSignature)}
                      alt="Admin Signature"
                      style={{ maxWidth: 200, maxHeight: 80, border: "1px solid #ccc", borderRadius: 4 }}
                      onError={(e) => e.target.style.display = "none"}
                    />
                  ) : (
                    <span style={{ color: "#999" }}>Không có</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default OwnerContractManagement;
