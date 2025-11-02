import React, { useState, useEffect } from "react";
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
  Upload,
} from "antd";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import contractApi from "../../../api/contractApi";
import ownerContractsApi from "../../../api/owner-contractsApi";
import vehiclesApi from "../../../api/vehiclesApi";
import userApi from "../../../api/userApi";

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

  // Contract status options
  const contractStatusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Pending", label: "Pending" },
    { value: "Approved", label: "Approved" },
    { value: "Closed", label: "Closed" },
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
  };

  const handleCloseCreateModal = () => {
    setCreateModalVisible(false);
    createForm.resetFields();
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
      
      // Thêm file chữ ký admin
      if (values.adminSignature && Array.isArray(values.adminSignature) && values.adminSignature.length > 0) {
        const adminFile = values.adminSignature[0].originFileObj || values.adminSignature[0];
        if (adminFile) {
          formData.append("adminSignature", adminFile);
        }
      }
      
      // Thêm file chữ ký user
      if (values.userSignature && Array.isArray(values.userSignature) && values.userSignature.length > 0) {
        const userFile = values.userSignature[0].originFileObj || values.userSignature[0];
        if (userFile) {
          formData.append("userSignature", userFile);
        }
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

  // Helper function để lấy thông tin xe
  const getVehicleInfo = (vehicleId) => {
    const vehicle = vehicles.find(v => (v.vehicleId || v.id) === vehicleId);
    if (vehicle) {
      return `${vehicle.brand} ${vehicle.model} - ${vehicle.plateNumber}`;
    }
    return vehicleId || "N/A";
  };

  const columns = [
    {
      title: "Mã hợp đồng",
      dataIndex: "contractNumber",
      key: "contractNumber",
      width: 150,
    },
    {
      title: "Thông tin xe",
      key: "vehicleInfo",
      width: 250,
      render: (_, record) => getVehicleInfo(record.vehicleId),
    },
    {
      title: "Tổng phần sở hữu",
      dataIndex: "totalShares",
      key: "totalShares",
      width: 120,
      render: (v) => v || "-"
    },
    {
      title: "Giá/Phần",
      dataIndex: "pricePerShare",
      key: "pricePerShare",
      width: 120,
      render: (v) => v ? `${v?.toLocaleString()} VND` : "-"
    },
    {
      title: "Ngày có hiệu lực",
      dataIndex: "effectiveDate",
      key: "effectiveDate",
      width: 120,
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : "-"
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const color = status === "Approved" ? "green" :
          status === "Pending" ? "orange" :
          status === "Draft" ? "blue" : "red";
        return <Tag color={color}>{status}</Tag>;
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
          {record.status === "Draft" && (
            <Tooltip title="Chỉnh sửa">
              <Button
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleEditContract(record)}
              />
            </Tooltip>
          )}
          {record.status === "Approved" && (
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
      <Modal
        title="Chi tiết hợp đồng"
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedContract && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã hợp đồng" span={1}>
              {selectedContract.contractNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag color={
                selectedContract.status === "Approved" ? "green" :
                  selectedContract.status === "Pending" ? "orange" :
                    selectedContract.status === "Draft" ? "blue" : "red"
              }>
                {selectedContract.status}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Thông tin xe" span={2}>
              {getVehicleInfo(selectedContract.vehicleId)}
            </Descriptions.Item>
            <Descriptions.Item label="Tổng phần sở hữu" span={1}>
              {selectedContract.totalShares || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Giá mỗi phần" span={1}>
              {selectedContract.pricePerShare ? `${selectedContract.pricePerShare.toLocaleString()} VND` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày có hiệu lực" span={1}>
              {selectedContract.effectiveDate ? new Date(selectedContract.effectiveDate).toLocaleDateString('vi-VN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày hết hạn" span={1}>
              {selectedContract.expiryDate ? new Date(selectedContract.expiryDate).toLocaleDateString('vi-VN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {selectedContract.description || 'Không có mô tả'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo" span={1}>
              {selectedContract.createdAt ? new Date(selectedContract.createdAt).toLocaleString('vi-VN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối" span={1}>
              {selectedContract.updatedAt ? new Date(selectedContract.updatedAt).toLocaleString('vi-VN') : '-'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

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
            initialValue="Draft"
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
            name="adminSignature"
            label="Chữ ký Admin"
            rules={[{ required: true, message: 'Vui lòng upload chữ ký admin!' }]}
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              beforeUpload={() => false}
              accept="image/*,.pdf"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn file chữ ký Admin</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            name="userSignature"
            label="Chữ ký User (Chủ xe)"
            rules={[{ required: true, message: 'Vui lòng upload chữ ký user!' }]}
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
          >
            <Upload
              beforeUpload={() => false}
              accept="image/*,.pdf"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Chọn file chữ ký User</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContractManagement;

