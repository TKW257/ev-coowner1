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
import contractApi from "../../../api/contractApi";
import ownerContractsApi from "../../../api/owner-contractsApi";
import vehiclesApi from "../../../api/vehiclesApi";
import userApi from "../../../api/userApi";
import SignatureCanvas from "react-signature-canvas";
import Contract from "../../../components/Contract";

const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

const { Title } = Typography;

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [ownerContractModalVisible, setOwnerContractModalVisible] = useState(false);
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

  // Contract status options
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

      // Log response từ API
      console.log("📋 Response từ getAll contract API:", response);
      console.log("📋 Response type:", typeof response);
      console.log("📋 Is Array?", Array.isArray(response));
      console.log("📋 Response keys:", response ? Object.keys(response) : "null/undefined");

      // Xử lý response từ API
      let contractsData = [];
      if (Array.isArray(response)) {
        contractsData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        contractsData = response.data;
      } else if (response?.data) {
        contractsData = [response.data];
      } else if (response?.content && Array.isArray(response.content)) {
        contractsData = response.content;
      }

      console.log("📋 ContractsData sau khi xử lý:", contractsData);
      console.log("📋 Số lượng contracts:", contractsData.length);

      setContracts(contractsData);

      if (contractsData.length === 0) {
        message.info("Danh sách hợp đồng trống");
      }
    } catch (error) {
      console.error("Error fetching contracts:", error);

      // Check if it's a 403 error
      if (error.response?.status === 403) {
        message.error("Bạn không có quyền truy cập hợp đồng! Vui lòng đăng nhập với tài khoản ADMIN.");
      } else {
        const errorMessage = error.response?.data?.message || error.message || "Không xác định được lỗi";
        message.error(`Không tải được danh sách hợp đồng! ${errorMessage}`);
      }
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
      } else if (response?.data) {
        vehiclesData = [response.data];
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
      } else if (response?.data) {
        usersData = [response.data];
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
    // Xóa chữ ký
    if (adminSigPadRef.current) adminSigPadRef.current.clear();
    if (userSigPadRef.current) userSigPadRef.current.clear();
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
    // Xóa chữ ký
    if (adminSigPadRef.current) adminSigPadRef.current.clear();
    if (userSigPadRef.current) userSigPadRef.current.clear();
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await createForm.validateFields();

      // Tạo FormData cho multipart/form-data request
      const formData = new FormData();
      formData.append("vehicleId", (values.vehicleId ?? "").toString());
      formData.append("userId", (values.userId ?? "").toString());
      formData.append("salePercentage", (values.salePercentage ?? 0).toString());
      formData.append("startDate", values.startDate ?? "");
      if (values.endDate) {
        formData.append("endDate", values.endDate);
      }
      if (values.status) {
        formData.append("status", values.status);
      }

      // Lấy chữ ký admin từ Signature Canvas
      const adminSigPad = adminSigPadRef.current;
      if (adminSigPad && !adminSigPad.isEmpty()) {
        const blob = await new Promise((resolve) => adminSigPad.getCanvas().toBlob(resolve));
        if (blob) {
          formData.append("adminSignature", blob, "admin_signature.png");
        }
      } else {
        message.error("Vui lòng vẽ chữ ký Admin!");
        return;
      }

      // Lấy chữ ký user từ Signature Canvas
      const userSigPad = userSigPadRef.current;
      if (userSigPad && !userSigPad.isEmpty()) {
        const blob = await new Promise((resolve) => userSigPad.getCanvas().toBlob(resolve));
        if (blob) {
          formData.append("userSignature", blob, "user_signature.png");
        }
      } else {
        message.error("Vui lòng vẽ chữ ký User!");
        return;
      }

      const response = await contractApi.create(formData);

      if (response || response === undefined) {
        message.success("Tạo hợp đồng thành công!");
        handleCloseCreateModal();
        fetchContracts();
      } else {
        message.warning("Phản hồi từ server không hợp lệ");
      }
    } catch (error) {
      console.error("Error creating contract:", error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Không xác định được lỗi";

      if (error.response?.status === 400) {
        message.error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      } else if (error.response?.status === 401) {
        message.error("Bạn không có quyền thực hiện thao tác này!");
      } else if (error.response?.status === 403) {
        message.error("Không có quyền truy cập!");
      } else if (error.response?.status === 409) {
        message.error(`Hợp đồng đã tồn tại: ${errorMessage}`);
      } else {
        message.error(`Không thể tạo hợp đồng! ${errorMessage}`);
      }
    }
  };

  const handleEditContract = (contract) => {
    setEditingContract(contract);
    setEditModalVisible(true);

    form.setFieldsValue({
      contractNumber: contract.contractNumber,
      vehicleId: contract.vehicleId,
      status: contract.status,
      effectiveDate: contract.effectiveDate,
      expiryDate: contract.expiryDate,
      totalShares: contract.totalShares,
      pricePerShare: contract.pricePerShare,
      description: contract.description,
    });
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditingContract(null);
    form.resetFields();
  };

  const handleUpdateSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (!editingContract?.contractId && !editingContract?.id) {
        message.error("Không tìm thấy ID hợp đồng để cập nhật!");
        return;
      }

      const contractId = editingContract.contractId ?? editingContract.id;
      const response = await contractApi.updateStatus(contractId, { status: values.status });

      if (response || response === undefined) {
        message.success("Cập nhật hợp đồng thành công!");
        handleCloseEditModal();
        fetchContracts();
      } else {
        message.warning("Phản hồi từ server không hợp lệ");
      }
    } catch (error) {
      console.error("Error updating contract:", error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Không xác định được lỗi";

      if (error.response?.status === 404) {
        message.error("Không tìm thấy hợp đồng để cập nhật!");
      } else if (error.response?.status === 400) {
        message.error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      } else if (error.response?.status === 401) {
        message.error("Bạn không có quyền thực hiện thao tác này!");
      } else if (error.response?.status === 403) {
        message.error("Không có quyền truy cập!");
      } else {
        message.error(`Không thể cập nhật hợp đồng! ${errorMessage}`);
      }
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

      if (!contractId) {
        message.error("Không tìm thấy ID hợp đồng để xóa!");
        return;
      }

      await contractApi.delete(contractId);

      message.success("Xóa hợp đồng thành công!");
      setDeleteModalVisible(false);
      setDeletingContract(null);
      fetchContracts();
    } catch (error) {
      console.error("Error deleting contract:", error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Không xác định được lỗi";

      if (error.response?.status === 404) {
        message.error("Không tìm thấy hợp đồng để xóa!");
      } else if (error.response?.status === 400) {
        message.error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      } else if (error.response?.status === 401) {
        message.error("Bạn không có quyền thực hiện thao tác này!");
      } else if (error.response?.status === 403) {
        message.error("Không có quyền truy cập!");
      } else if (error.response?.status === 409) {
        message.error(`Không thể xóa hợp đồng vì đang được sử dụng: ${errorMessage}`);
      } else {
        message.error(`Không thể xóa hợp đồng! ${errorMessage}`);
      }
    }
  };

  const handleCreateOwnerContract = (contract) => {
    setSelectedContract(contract);
    setOwnerContractModalVisible(true);
  };

  const handleCloseOwnerContractModal = () => {
    setOwnerContractModalVisible(false);
    setSelectedContract(null);
    form.resetFields();
  };

  const handleCreateOwnerContractSubmit = async () => {
    try {
      if (!selectedContract?.contractId && !selectedContract?.id) {
        message.error("Không tìm thấy ID hợp đồng!");
        return;
      }

      const contractId = selectedContract.contractId ?? selectedContract.id;
      const data = {
        contractId: contractId,
      };

      const response = await ownerContractsApi.create(data);

      if (response || response === undefined) {
        message.success("Tạo Owner Contract thành công!");
        handleCloseOwnerContractModal();
        fetchContracts();
      } else {
        message.warning("Phản hồi từ server không hợp lệ");
      }
    } catch (error) {
      console.error("Error creating owner contract:", error);

      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Không xác định được lỗi";

      if (error.response?.status === 400) {
        message.error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      } else if (error.response?.status === 401) {
        message.error("Bạn không có quyền thực hiện thao tác này!");
      } else if (error.response?.status === 403) {
        message.error("Không có quyền truy cập!");
      } else {
        message.error(`Không thể tạo Owner Contract! ${errorMessage}`);
      }
    }
  };


  // Helper function để lấy thông tin xe đầy đủ
  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => (v.vehicleId || v.id) === vehicleId);
    if (vehicle) {
      return `${vehicle.brand} ${vehicle.model} - ${vehicle.plateNumber}`;
    }
    return vehicleId || "N/A";
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
      title: "Ngày hiệu lực",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "-"
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
            <Tooltip title="Tạo Owner Contract">
              <Button
                type="link"
                icon={<FileTextOutlined />}
                onClick={() => handleCreateOwnerContract(record)}
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateContract}
        >
          Tạo Hợp Đồng
        </Button>
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

      {/* Contract Details Modal */}
      <Contract
        contract={selectedContract}
        visible={detailModalVisible}
        onClose={handleCloseDetailModal}
        baseURL={baseURL}
      />

      {/* Edit Contract Status Modal */}
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
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
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

      {/* Delete Confirmation Modal */}
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
        <div style={{ padding: '16px 0' }}>
          <p>Bạn có chắc chắn muốn xóa hợp đồng này không?</p>
          {deletingContract && (
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '6px',
              marginTop: '12px'
            }}>
              <p><strong>Thông tin hợp đồng sẽ bị xóa:</strong></p>
              <p><strong>Mã hợp đồng:</strong> {deletingContract.contractNumber}</p>
              <p><strong>Xe:</strong> {getVehicleInfo(deletingContract.vehicleId)}</p>
              <p><strong>Trạng thái:</strong> {deletingContract.status}</p>
            </div>
          )}
          <p style={{ color: '#ff4d4f', marginTop: '16px', fontWeight: 'bold' }}>
            ⚠️ Hành động này không thể hoàn tác!
          </p>
        </div>
      </Modal>

      {/* Create Owner Contract Modal */}
      <Modal
        title="Tạo Owner Contract"
        open={ownerContractModalVisible}
        onOk={handleCreateOwnerContractSubmit}
        onCancel={handleCloseOwnerContractModal}
        okText="Tạo"
        cancelText="Hủy"
        width={600}
      >
        {selectedContract && (
          <div style={{ padding: '16px 0' }}>
            <p>Bạn có chắc chắn muốn tạo Owner Contract từ hợp đồng này không?</p>
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '6px',
              marginTop: '12px'
            }}>
              <p><strong>Thông tin hợp đồng:</strong></p>
              <p><strong>Mã hợp đồng:</strong> {selectedContract.contractNumber}</p>
              <p><strong>Xe:</strong> {getVehicleInfo(selectedContract.vehicleId)}</p>
              <p><strong>Trạng thái:</strong> {selectedContract.status}</p>
              <p><strong>Tổng phần sở hữu:</strong> {selectedContract.totalShares || '-'}</p>
              <p><strong>Giá mỗi phần:</strong> {selectedContract.pricePerShare ? `${selectedContract.pricePerShare.toLocaleString()} VND` : '-'}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Create Contract Modal */}
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
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              max={100}
              placeholder="Nhập tỷ lệ bán (0-100%)"
            />
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày Bắt Đầu"
            rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày Kết Thúc"
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng Thái"
            initialValue="PENDING"
          >
            <Select>
              {contractStatusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Chữ ký Admin"
          >
            <SignatureCanvas
              ref={adminSigPadRef}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 150,
                className: "signatureCanvas",
                style: { border: "1px solid #ccc", borderRadius: "6px" },
              }}
            />
            <Button
              type="link"
              onClick={() => {
                if (adminSigPadRef.current) adminSigPadRef.current.clear();
              }}
              style={{ padding: 0, marginTop: 5 }}
            >
              Xóa chữ ký Admin
            </Button>
          </Form.Item>

          <Form.Item
            label="Chữ ký User (Chủ xe)"
          >
            <SignatureCanvas
              ref={userSigPadRef}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 150,
                className: "signatureCanvas",
                style: { border: "1px solid #ccc", borderRadius: "6px" },
              }}
            />
            <Button
              type="link"
              onClick={() => {
                if (userSigPadRef.current) userSigPadRef.current.clear();
              }}
              style={{ padding: 0, marginTop: 5 }}
            >
              Xóa chữ ký User
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractManagement;

