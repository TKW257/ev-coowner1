import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Tag,
  Tooltip,
  Typography,
  Spin,
  Empty,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import contractApi from "../../../api/contractApi";
import vehiclesApi from "../../../api/vehiclesApi";
import userApi from "../../../api/userApi";
import ownerShipsApi from "../../../api/ownerShipsApi";
import SignatureCanvas from "react-signature-canvas";
import Contract from "../../../components/Contract";

const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

const { Title } = Typography;

const formatNumberWithCommas = (value) => {
  if (value === undefined || value === null || value === "") return "";
  const [integerPart, decimalPart] = value.toString().split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimalPart !== undefined ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

const parseNumberFromFormatted = (value) => {
  if (value === undefined || value === null || value === "") return value;
  if (typeof value === "number") return value;
  return value.replace(/,/g, "");
};

const ContractManagement = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [ownershipModalVisible, setOwnershipModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [deletingContract, setDeletingContract] = useState(null);
  const [ownershipData, setOwnershipData] = useState([]);
  const [ownershipLoading, setOwnershipLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const adminSigPadRef = useRef(null);
  const userSigPadRef = useRef(null);

  const contractStatusOptions = [
    { value: "PENDING", label: "Đang chờ duyệt" },
    { value: "APPROVED", label: "Đã được duyệt" },
    { value: "COMPLETED", label: "Đã bán đủ cổ phần" },
    { value: "EXPIRED", label: "Hết hạn hợp đồng" },
  ];

  useEffect(() => {
    fetchContracts();
    fetchVehicles();
    fetchUsers();
  }, []);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await contractApi.getAll();
      let contractsData = [];
      if (Array.isArray(response)) {
        contractsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        contractsData = response.data;
      } else if (response?.content && Array.isArray(response.content)) {
        contractsData = response.content;
      }
      setContracts(contractsData);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      message.error("Không tải được danh sách hợp đồng!");
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await vehiclesApi.getAllVehicles();
      let vehiclesData = [];
      if (Array.isArray(response)) {
        vehiclesData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        vehiclesData = response.data;
      } else if (response?.content && Array.isArray(response.content)) {
        vehiclesData = response.content;
      }
      setVehicles(vehiclesData);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userApi.getAll();
      let usersData = [];
      if (Array.isArray(response)) {
        usersData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        usersData = response.data;
      } else if (response?.content && Array.isArray(response.content)) {
        usersData = response.content;
      }
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  const handleViewDetails = (contract) => {
    setSelectedContract(contract);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedContract(null);
  };

  const handleCreateContract = () => {
    setCreateModalVisible(true);
    createForm.resetFields();
    if (adminSigPadRef.current) adminSigPadRef.current.clear();
    if (userSigPadRef.current) userSigPadRef.current.clear();
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
    if (adminSigPadRef.current) adminSigPadRef.current.clear();
    if (userSigPadRef.current) userSigPadRef.current.clear();
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();
      const formData = new FormData();
      formData.append("vehicleId", (values.vehicleId ?? "").toString());
      formData.append("userId", (values.userId ?? "").toString());
      formData.append("salePercentage", (values.salePercentage ?? 0).toString());
      if (values.insurance !== undefined && values.insurance !== null) {
        formData.append("insurance", values.insurance.toString());
      }
      if (values.registration !== undefined && values.registration !== null) {
        formData.append("registration", values.registration.toString());
      }
      if (values.maintenance !== undefined && values.maintenance !== null) {
        formData.append("maintenance", values.maintenance.toString());
      }
      if (values.cleaning !== undefined && values.cleaning !== null) {
        formData.append("cleaning", values.cleaning.toString());
      }
      if (values.operationPerMonth !== undefined && values.operationPerMonth !== null) {
        formData.append("operationPerMonth", values.operationPerMonth.toString());
      }
      formData.append("startDate", values.startDate ?? "");
      if (values.endDate) formData.append("endDate", values.endDate);
      if (values.status) formData.append("status", values.status);

      const adminSigPad = adminSigPadRef.current;
      if (adminSigPad && !adminSigPad.isEmpty()) {
        const blob = await new Promise((resolve) => adminSigPad.getCanvas().toBlob(resolve));
        if (blob) formData.append("adminSignature", blob, "admin_signature.png");
      } else {
        message.error("Vui lòng vẽ chữ ký Admin!");
        return;
      }

      const userSigPad = userSigPadRef.current;
      if (userSigPad && !userSigPad.isEmpty()) {
        const blob = await new Promise((resolve) => userSigPad.getCanvas().toBlob(resolve));
        if (blob) formData.append("userSignature", blob, "user_signature.png");
      } else {
        message.error("Vui lòng vẽ chữ ký User!");
        return;
      }

      const response = await contractApi.create(formData);
      if (response) {
        message.success("Tạo hợp đồng thành công!");
        handleCloseCreateModal();
        fetchContracts();
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      message.error("Không thể tạo hợp đồng!");
    }
  };

  const handleEditContract = (contract) => {
    setEditingContract(contract);
    setEditModalVisible(true);
    form.setFieldsValue({ status: contract.status });
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditingContract(null);
    form.resetFields();
  };

  const handleUpdateSubmit = async () => {
    try {
      const values = await form.validateFields();
      const contractId = editingContract.contractId ?? editingContract.id;
      await contractApi.updateStatus(contractId, { status: values.status });
      message.success("Cập nhật hợp đồng thành công!");
      handleCloseEditModal();
      fetchContracts();
    } catch (error) {
      console.error("Error updating contract:", error);
      message.error("Không thể cập nhật hợp đồng!");
    }
  };

  const handleDeleteContract = (contract) => {
    setDeletingContract(contract);
    setDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletingContract(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const contractId = deletingContract?.contractId ?? deletingContract?.id;
      await contractApi.delete(contractId);
      message.success("Xóa hợp đồng thành công!");
      setDeleteModalVisible(false);
      setDeletingContract(null);
      fetchContracts();
    } catch (error) {
      console.error("Error deleting contract:", error);
      message.error("Không thể xóa hợp đồng!");
    }
  };

  const handleViewOwnership = async (contract) => {
    const vehicleId = contract?.vehicleId || contract?.vehicle?.vehicleId || contract?.vehicle?.id;
    if (!vehicleId) {
      message.error("Không tìm thấy Vehicle ID!");
      return;
    }

    setOwnershipModalVisible(true);
    setOwnershipLoading(true);
    setOwnershipData([]);
    
    try {
      const response = await ownerShipsApi.getMyGroupOwnership(vehicleId);
      const data = Array.isArray(response) ? response : response?.data || [];
      setOwnershipData(data);
    } catch (error) {
      console.error("Error fetching ownership:", error);
      message.error("Không thể tải danh sách đồng sở hữu!");
      setOwnershipData([]);
    } finally {
      setOwnershipLoading(false);
    }
  };

  const handleCloseOwnershipModal = () => {
    setOwnershipModalVisible(false);
    setOwnershipData([]);
  };

  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "contractId",
      key: "contractId",
      width: 120,
      render: (id, record) => id || record?.id || "-"
    },
    {
      title: "User",
      key: "user",
      width: 120,
      render: (_, record) => record.user?.fullName || record.user?.email || "N/A"
    },
    {
      title: "Xe",
      key: "vehicle",
      width: 200,
      render: (_, record) =>
        record.vehicle
          ? `${record.vehicle.brand} ${record.vehicle.model} (${record.vehicle.plateNumber})`
          : "N/A"
    },
    {
      title: "% Chào bán",
      dataIndex: "salePercentage",
      key: "salePercentage",
      width: 120,
      render: (percentage) => percentage ? `${percentage}%` : "-"
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        const statusMap = {
          PENDING: { label: "Đang chờ duyệt", color: "orange" },
          APPROVED: { label: "Đã được duyệt", color: "green" },
          COMPLETED: { label: "Đã bán đủ cổ phần", color: "blue" },
          EXPIRED: { label: "Hết hạn hợp đồng", color: "red" },
        };
        const { label, color } = statusMap[status] || { label: status, color: "default" };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          {record.status === "PENDING" && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEditContract(record)}
              />
            </Tooltip>
          )}
          <Tooltip title={record.status === "EXPIRED" ? "Hợp đồng đã hết hạn" : "Quản lý Owner Contract"}>
            <Button
              type="link"
              icon={<FileTextOutlined />}
              onClick={() => navigate('/admin/owner-contracts')}
              disabled={record.status === "EXPIRED"}
            />
          </Tooltip>
          <Tooltip title="Xem đồng sở hữu">
            <Button
              type="link"
              icon={<TeamOutlined />}
              onClick={() => handleViewOwnership(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteContract(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2} style={{ margin: 0, color: "black" }}>Quản Lý Hợp Đồng</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateContract}>
            Tạo Hợp Đồng
          </Button>
        </Space>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 50 }}>
          <Spin size="large" tip="Đang tải danh sách hợp đồng..." />
        </div>
      ) : contracts.length === 0 ? (
        <Empty description="Không có hợp đồng nào" />
      ) : (
        <Table
          rowKey={(record) => (record.contractId || record.id).toString()}
          columns={columns}
          dataSource={contracts}
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      )}

      {/* Modal xem chi tiết */}
      <Contract
        contract={selectedContract}
        visible={detailModalVisible}
        onClose={handleCloseDetailModal}
        baseURL={baseURL}
      />

      {/* Modal chỉnh sửa */}
      <Modal
        title="Cập nhật trạng thái hợp đồng"
        open={editModalVisible}
        onOk={handleUpdateSubmit}
        onCancel={handleCloseEditModal}
        okText="Cập nhật"
        cancelText="Hủy"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select placeholder="Chọn trạng thái">
              {contractStatusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal xác nhận xóa */}
      <Modal
        title="Xác nhận xóa hợp đồng"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        width={500}
      >
        <p>Bạn có chắc chắn muốn xóa hợp đồng này không?</p>
      </Modal>

      {/* Modal tạo hợp đồng */}
      <Modal
        title="Tạo Hợp Đồng Mới"
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={handleCloseCreateModal}
        okText="Tạo"
        cancelText="Hủy"
        width={1000}
      >
        <Form form={createForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vehicleId"
                label="Chọn Xe"
                rules={[{ required: true, message: 'Vui lòng chọn xe!' }]}
              >
                <Select placeholder="Chọn xe" showSearch>
                  {vehicles.map(vehicle => (
                    <Select.Option key={vehicle.vehicleId || vehicle.id} value={vehicle.vehicleId || vehicle.id}>
                      {vehicle.brand} {vehicle.model} - {vehicle.plateNumber}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="userId"
                label="Chọn Chủ Xe (Owner)"
                rules={[{ required: true, message: 'Vui lòng chọn chủ xe!' }]}
              >
                <Select placeholder="Chọn chủ xe" showSearch>
                  {users
                    .filter(user => user.role === 'USER')
                    .map(user => (
                      <Select.Option key={user.id} value={user.id}>
                        {user.fullName || user.full_name} - {user.email}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="salePercentage"
                label="Tỷ Lệ Bán (%)"
                rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ bán!' }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Nhập tỷ lệ bán (0-100%)" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="status" label="Trạng Thái" initialValue="PENDING">
                <Select>
                  {contractStatusOptions.map(option => (
                    <Select.Option key={option.value} value={option.value}>
                      {option.label}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="insurance"
                label="Bảo hiểm"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={0.01} 
                  placeholder="Nhập chi phí bảo hiểm"
                  formatter={formatNumberWithCommas}
                  parser={parseNumberFromFormatted}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="registration"
                label="Đăng ký"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={0.01} 
                  placeholder="Nhập chi phí đăng ký"
                  formatter={formatNumberWithCommas}
                  parser={parseNumberFromFormatted}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="maintenance"
                label="Bảo trì"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={0.01} 
                  placeholder="Nhập chi phí bảo trì"
                  formatter={formatNumberWithCommas}
                  parser={parseNumberFromFormatted}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="cleaning"
                label="Vệ sinh"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={0.01} 
                  placeholder="Nhập chi phí vệ sinh"
                  formatter={formatNumberWithCommas}
                  parser={parseNumberFromFormatted}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="operationPerMonth"
                label="Chi phí vận hành/tháng"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  step={0.01} 
                  placeholder="Nhập chi phí vận hành mỗi tháng"
                  formatter={formatNumberWithCommas}
                  parser={parseNumberFromFormatted}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="startDate"
                label="Ngày Bắt Đầu"
                rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="endDate" label="Ngày Kết Thúc">
                <Input type="date" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Chữ ký Admin">
                <SignatureCanvas
                  ref={adminSigPadRef}
                  penColor="black"
                  canvasProps={{
                    width: 400,
                    height: 120,
                    style: { border: "1px solid #ccc", borderRadius: "6px", width: "100%" },
                  }}
                />
                <Button type="link" onClick={() => adminSigPadRef.current?.clear()} style={{ padding: 0, marginTop: 5 }}>
                  Xóa chữ ký Admin
                </Button>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Chữ ký User (Chủ xe)">
                <SignatureCanvas
                  ref={userSigPadRef}
                  penColor="black"
                  canvasProps={{
                    width: 400,
                    height: 120,
                    style: { border: "1px solid #ccc", borderRadius: "6px", width: "100%" },
                  }}
                />
                <Button type="link" onClick={() => userSigPadRef.current?.clear()} style={{ padding: 0, marginTop: 5 }}>
                  Xóa chữ ký User
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal xem đồng sở hữu */}
      <Modal
        title="Danh sách đồng sở hữu"
        open={ownershipModalVisible}
        onCancel={handleCloseOwnershipModal}
        footer={[
          <Button key="close" onClick={handleCloseOwnershipModal}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {ownershipLoading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải danh sách đồng sở hữu..." />
          </div>
        ) : ownershipData.length === 0 ? (
          <Empty description="Không có đồng sở hữu nào" />
        ) : (
          <Table
            rowKey={(record, index) => record.ownershipId || record.id || index}
            dataSource={ownershipData}
            columns={[
              {
                title: "Thành viên",
                key: "userName",
                render: (_, record) => {
                  if (record.userName) return record.userName;
                  if (record.user?.fullName) return record.user.fullName;
                  if (record.user?.full_name) return record.user.full_name;
                  if (record.user?.email) return record.user.email;
                  return "N/A";
                },
              },
              {
                title: "Email",
                key: "email",
                render: (_, record) => {
                  if (record.user?.email) return record.user.email;
                  return "-";
                },
              },
              {
                title: "Tỷ lệ sở hữu (%)",
                key: "totalSharePercentage",
                render: (_, record) => {
                  const percentage = record.totalSharePercentage || record.sharePercentage || 0;
                  return `${percentage}%`;
                },
              },
              {
                title: "Trạng thái",
                key: "status",
                render: (_, record) => {
                  const status = record.status || "N/A";
                  const statusLower = status.toLowerCase();
                  let color = "default";
                  if (statusLower === "active") color = "green";
                  else if (statusLower === "inactive") color = "default";
                  else if (statusLower === "pending") color = "orange";
                  return <Tag color={color}>{status}</Tag>;
                },
              },
            ]}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Modal>
    </div>
  );
};

export default ContractManagement;
