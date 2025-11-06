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
  Descriptions,
  Tooltip,
  Typography,
  Spin,
  Empty,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import contractApi from "../../../api/contractApi";
import vehiclesApi from "../../../api/vehiclesApi";
import userApi from "../../../api/userApi";
import SignatureCanvas from "react-signature-canvas";
import Contract from "../../../components/Contract";

const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

const { Title } = Typography;

const ContractManagement = () => {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [editingContract, setEditingContract] = useState(null);
  const [deletingContract, setDeletingContract] = useState(null);
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
          {record.status === "APPROVED" && (
            <Tooltip title="Quản lý Owner Contract">
              <Button
                type="link"
                icon={<FileTextOutlined />}
                onClick={() => navigate('/admin/owner-contracts')}
              />
            </Tooltip>
          )}
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
      <Modal
        title="Chi tiết hợp đồng"
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Đóng
          </Button>
        ]}
        width={900}
      >
        {selectedContract && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã hợp đồng">
              {selectedContract.contractId || selectedContract.id}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag>{selectedContract.status}</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

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
        width={600}
      >
        <Form form={createForm} layout="vertical">
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

          <Form.Item
            name="salePercentage"
            label="Tỷ Lệ Bán (%)"
            rules={[{ required: true, message: 'Vui lòng nhập tỷ lệ bán!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Nhập tỷ lệ bán (0-100%)" />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày Bắt Đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item name="endDate" label="Ngày Kết Thúc">
            <Input type="date" />
          </Form.Item>

          <Form.Item name="status" label="Trạng Thái" initialValue="PENDING">
            <Select>
              {contractStatusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Chữ ký Admin">
            <SignatureCanvas
              ref={adminSigPadRef}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 150,
                style: { border: "1px solid #ccc", borderRadius: "6px" },
              }}
            />
            <Button type="link" onClick={() => adminSigPadRef.current?.clear()} style={{ padding: 0, marginTop: 5 }}>
              Xóa chữ ký Admin
            </Button>
          </Form.Item>

          <Form.Item label="Chữ ký User (Chủ xe)">
            <SignatureCanvas
              ref={userSigPadRef}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 150,
                style: { border: "1px solid #ccc", borderRadius: "6px" },
              }}
            />
            <Button type="link" onClick={() => userSigPadRef.current?.clear()} style={{ padding: 0, marginTop: 5 }}>
              Xóa chữ ký User
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractManagement;
