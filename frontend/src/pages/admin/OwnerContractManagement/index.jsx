import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Space,
  Tooltip,
  Typography,
  Spin,
  Empty,
  Row,
  Col,
} from "antd";
import { EyeOutlined, UserAddOutlined, PlusOutlined } from "@ant-design/icons";
import ownerContractsApi from "../../../api/owner-contractsApi";
import contractApi from "../../../api/contractApi";
import userApi from "../../../api/userApi";
import SignatureCanvas from "react-signature-canvas";
import OwnerContract from "../../../components/ContractOwner";
import { App } from "antd";

const { Title } = Typography;

const BASE_URL = "https://vallate-enzootically-sterling.ngrok-free.dev";

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

const OwnerContractManagement = () => {
  const [ownerContracts, setOwnerContracts] = useState([]);
  const [users, setUsers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [createContractModalVisible, setCreateContractModalVisible] = useState(false);
  const [selectContractModalVisible, setSelectContractModalVisible] = useState(false);
  const [selectedOwnerContract, setSelectedOwnerContract] = useState(null);
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [addUserForm] = Form.useForm();
  const [selectContractForm] = Form.useForm();
  const adminSigPadRef = useRef(null);
  const userSigPadRef = useRef(null);
  const { message } = App.useApp();

  useEffect(() => {
    fetchOwnerContracts();
    fetchApprovedUsers();
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await contractApi.getAll();
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (response?.data && Array.isArray(response.data)) data = response.data;
      else if (response?.content && Array.isArray(response.content)) data = response.content;
      
      setContracts(data);
    } catch {
      setContracts([]);
    }
  };

  const fetchOwnerContracts = async () => {
    setLoading(true);
    try {
      const response = await ownerContractsApi.getAll();
      console.log("📦 [API viewAllOwnerContract] Raw response:", response);
      let data = [];
      if (Array.isArray(response)) data = response;
      else if (response?.data && Array.isArray(response.data)) data = response.data;
      else if (response?.content && Array.isArray(response.content)) data = response.content;

      setOwnerContracts(data);
    } catch {
      message.error("Không tải được danh sách Owner Contract!");
      setOwnerContracts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedUsers = async () => {
    try {
      const response = await userApi.getAll();
      let usersData = [];
      if (Array.isArray(response)) usersData = response;
      else if (response?.data && Array.isArray(response.data)) usersData = response.data;
      else if (response?.content && Array.isArray(response.content)) usersData = response.content;

      // Lọc chỉ lấy users đã APPROVED
      const approvedUsers = usersData.filter(
        (user) => user.verifyStatus === "APPROVED" && user.role === "USER"
      );
      setUsers(approvedUsers);
    } catch {
      setUsers([]);
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

  // const handleAddUser = (record) => {
  //   setSelectedOwnerContract(record);
  //   setAddUserModalVisible(true);
  //   addUserForm.resetFields();
  //   // Xóa chữ ký
  //   if (adminSigPadRef.current) adminSigPadRef.current.clear();
  //   if (userSigPadRef.current) userSigPadRef.current.clear();
  // };

  const handleCloseAddUserModal = () => {
    setAddUserModalVisible(false);
    setSelectedOwnerContract(null);
    addUserForm.resetFields();
    // Xóa chữ ký
    if (adminSigPadRef.current) adminSigPadRef.current.clear();
    if (userSigPadRef.current) userSigPadRef.current.clear();
  };

  const handleSelectContract = () => {
    selectContractForm.validateFields().then(values => {
      setSelectedContractId(values.contractId);
      setSelectContractModalVisible(false);
      setCreateContractModalVisible(true);
      addUserForm.resetFields();
      // Xóa chữ ký
      if (adminSigPadRef.current) adminSigPadRef.current.clear();
      if (userSigPadRef.current) userSigPadRef.current.clear();
    }).catch(() => {});
  };

  const handleOpenCreateContract = () => {
    setSelectContractModalVisible(true);
    selectContractForm.resetFields();
  };

  const handleCloseSelectContractModal = () => {
    setSelectContractModalVisible(false);
    selectContractForm.resetFields();
  };

  const handleCloseCreateContractModal = () => {
    setCreateContractModalVisible(false);
    setSelectedContractId(null);
    addUserForm.resetFields();
    // Xóa chữ ký
    if (adminSigPadRef.current) adminSigPadRef.current.clear();
    if (userSigPadRef.current) userSigPadRef.current.clear();
  };

  const handleAddUserSubmit = async () => {
    try {
      const values = await addUserForm.validateFields();
      
      // Lấy contractId từ ownerContract hoặc từ selectedContractId
      const contractId = selectedContractId || 
                        selectedOwnerContract?.contract_Id || 
                        selectedOwnerContract?.contractId || 
                        selectedOwnerContract?.contract?.contractId || 
                        selectedOwnerContract?.contract?.id;
      
      if (!contractId) {
        message.error("Không tìm thấy Contract ID!");
        return;
      }

      if (!values.userId) {
        message.error("Vui lòng chọn User!");
        return;
      }

      if (!values.sharePercentage) {
        message.error("Vui lòng nhập Share Percentage!");
        return;
      }

      // Tạo FormData
      const formData = new FormData();
      formData.append("contractId", contractId.toString());
      formData.append("userId", values.userId.toString());
      formData.append("sharePercentage", values.sharePercentage.toString());
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

      await ownerContractsApi.create(formData);
      message.success("Thêm User vào Owner Contract thành công!");
      
      if (selectedContractId) {
        handleCloseCreateContractModal();
      } else {
        handleCloseAddUserModal();
      }
      
      fetchOwnerContracts();
      fetchApprovedUsers();
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể thêm User!";
      message.error(errorMessage);
    }
  };

  // /** Hiển thị trạng thái tiếng Việt */
  // const renderStatus = (status) => {
  //   const map = {
  //     PENDING: { text: "Đang chờ duyệt", color: "orange" },
  //     APPROVED: { text: "Đã được duyệt", color: "green" },
  //     COMPLETED: { text: "Đã bán đủ cổ phần", color: "blue" },
  //     EXPIRED: { text: "Hết hạn hợp đồng", color: "red" },
  //   };
  //   const { text, color } = map[status] || { text: status || "-", color: "default" };
  //   return <Tag color={color}>{text}</Tag>;
  // };

  const columns = [
    {
      title: "Owner Contract ID",
      dataIndex: "ownerContractId",
      key: "ownerContractId",
      width: 150,
      render: (id, record) => id || record.id || "-",
    },
    {
      title: "Họ và Tên",
      key: "userFullName",
      width: 200,
      render: (_, record) => {
        const user = record.user || record.contract?.user;
        return user?.fullName || user?.full_name || "-";
      },
    },
    {
      title: "Email",
      key: "userEmail",
      width: 200,
      render: (_, record) => {
        const user = record.user || record.contract?.user;
        return user?.email || "-";
      },
    },
    {
      title: "Số Điện Thoại",
      key: "userPhone",
      width: 150,
      render: (_, record) => {
        const user = record.user || record.contract?.user;
        return user?.phone || "-";
      },
    },
    {
      title: "Share Percentage",
      key: "sharePercentage",
      width: 150,
      render: (_, record) => {
        const sharePercentage = record.sharePercentage || record.contract?.salePercentage || record.salePercentage;
        return sharePercentage ? `${sharePercentage}%` : "-";
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button type="link" icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          {/* <Tooltip title="Thêm User">
            <Button type="link" icon={<UserAddOutlined />} onClick={() => handleAddUser(record)} />
          </Tooltip> */}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <Title level={2}>Quản Lý Owner Contract</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreateContract}
        >
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
    const user = selectedOwnerContract.user;
    const admin = selectedOwnerContract.admin;
    const contract = selectedOwnerContract.contract;
    const adminSig = buildUrl(selectedOwnerContract.adminSignature);
    const userSig = buildUrl(selectedOwnerContract.userSignature);
    
    // Lấy các trường từ ownerContract hoặc contract
    const insurance = selectedOwnerContract.insurance ?? contract?.insurance;
    const registration = selectedOwnerContract.registration ?? contract?.registration;
    const maintenance = selectedOwnerContract.maintenance ?? contract?.maintenance;
    const cleaning = selectedOwnerContract.cleaning ?? contract?.cleaning;
    const operationPerMonth = selectedOwnerContract.operationPerMonth ?? contract?.operationPerMonth;

    return (
      <Descriptions bordered column={2}>
        <Descriptions.Item label="Mã Owner Contract">
          {selectedOwnerContract.ownerContractId || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Mã Contract">
          {selectedOwnerContract.contractId || selectedOwnerContract.contract_Id || contract?.contractId || contract?.id || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Ngày tạo">
          {parseDate(selectedOwnerContract.createdAt)?.toLocaleString("vi-VN") || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái hợp đồng">
          {renderStatus(selectedOwnerContract.contractStatus)}
        </Descriptions.Item>

        <Descriptions.Item label="% Sở hữu">
          {selectedOwnerContract.sharePercentage
            ? `${selectedOwnerContract.sharePercentage}%`
            : "-"}
        </Descriptions.Item>

        {insurance !== undefined && insurance !== null && (
          <Descriptions.Item label="Bảo hiểm">
            {insurance.toLocaleString('vi-VN')} VND
          </Descriptions.Item>
        )}

        {registration !== undefined && registration !== null && (
          <Descriptions.Item label="Đăng ký">
            {registration.toLocaleString('vi-VN')} VND
          </Descriptions.Item>
        )}

        {maintenance !== undefined && maintenance !== null && (
          <Descriptions.Item label="Bảo trì">
            {maintenance.toLocaleString('vi-VN')} VND
          </Descriptions.Item>
        )}

        {cleaning !== undefined && cleaning !== null && (
          <Descriptions.Item label="Vệ sinh">
            {cleaning.toLocaleString('vi-VN')} VND
          </Descriptions.Item>
        )}

        {operationPerMonth !== undefined && operationPerMonth !== null && (
          <Descriptions.Item label="Chi phí vận hành/tháng">
            {operationPerMonth.toLocaleString('vi-VN')} VND
          </Descriptions.Item>
        )}

        <Descriptions.Item label="Chủ xe (User)" span={2}>
          {user
            ? `${user.fullName || "-"} (${user.email || "Không có email"})`
            : "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Số điện thoại (User)">
          {user?.phone || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái xác thực (User)">
          {user?.verifyStatus || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Admin duyệt" span={2}>
          {admin
            ? `${admin.fullName || "-"} (${admin.email || "Không có email"})`
            : "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Số điện thoại (Admin)">
          {admin?.phone || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Trạng thái xác thực (Admin)">
          {admin?.verifyStatus || "-"}
        </Descriptions.Item>

        <Descriptions.Item label="Chữ ký Admin">
          {adminSig ? (
            <img
              src={adminSig}
              alt="Admin Signature"
              style={{
                maxHeight: 100,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
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
              style={{
                maxHeight: 100,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            />
          ) : (
            "Không có"
          )}
        </Descriptions.Item>
      </Descriptions>
    );
  })()}
</Modal>


      {/* Modal chọn Contract ID */}
      <Modal
        title="Chọn Contract"
        open={selectContractModalVisible}
        onOk={handleSelectContract}
        onCancel={handleCloseSelectContractModal}
        okText="Tiếp tục"
        cancelText="Hủy"
      >
        <Form form={selectContractForm} layout="vertical">
          <Form.Item
            name="contractId"
            label="Chọn Contract ID"
            rules={[{ required: true, message: "Vui lòng chọn Contract ID!" }]}
          >
            <Select 
              placeholder="Chọn contract" 
              showSearch
              filterOption={(input, option) =>
                (option?.children?.props?.children || option?.children || "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {contracts.map((contract) => (
                <Select.Option key={contract.contractId || contract.id} value={contract.contractId || contract.id}>
                  Contract ID: {contract.contractId || contract.id} - {contract.vehicleName || contract.vehicle?.model || contract.vehicleId || "N/A"}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal thêm User vào Owner Contract */}
      <Modal
        title="Thêm User vào Owner Contract"
        open={addUserModalVisible}
        onOk={handleAddUserSubmit}
        onCancel={handleCloseAddUserModal}
        okText="Thêm"
        cancelText="Hủy"
        width={1000}
      >
        {selectedOwnerContract && (
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
            <Typography.Text strong>Owner Contract ID: </Typography.Text>
            <Typography.Text>{selectedOwnerContract.ownerContractId || selectedOwnerContract.id}</Typography.Text>
            <br />
            <Typography.Text strong>Contract ID: </Typography.Text>
            <Typography.Text>
              {selectedOwnerContract.contractId || selectedOwnerContract.contract?.contractId || selectedOwnerContract.contract?.id || "-"}
            </Typography.Text>
          </div>
        )}
        <Form form={addUserForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userId"
                label="Chọn User (Co-owner) - Chỉ hiển thị user đã được APPROVED"
                rules={[{ required: true, message: "Vui lòng chọn user!" }]}
              >
                <Select 
                  placeholder="Chọn user" 
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children?.props?.children || option?.children || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {users.map((user) => {
                    // Lọc bỏ user đã có trong owner contract
                    const isExistingUser = selectedOwnerContract?.user?.id === user.id || 
                                          selectedOwnerContract?.user?.userId === user.id;
                    if (isExistingUser) return null;
                    
                    return (
                      <Select.Option key={user.id || user.userId} value={user.id || user.userId}>
                        {user.fullName || user.full_name || "N/A"} - {user.email} {user.phone ? `(${user.phone})` : ""}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="sharePercentage"
                label="Share Percentage (%)"
                rules={[
                  { required: true, message: 'Vui lòng nhập share percentage!' },
                  { type: 'number', min: 0, max: 100, message: 'Share percentage phải từ 0 đến 100!' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  max={100} 
                  placeholder="Nhập share percentage (0-100%)"
                />
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chữ ký Admin"
              >
                <SignatureCanvas
                  ref={adminSigPadRef}
                  penColor="black"
                  canvasProps={{
                    width: 400,
                    height: 120,
                    className: "signatureCanvas",
                    style: { border: "1px solid #ccc", borderRadius: "6px", width: "100%" },
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
            </Col>

            <Col span={12}>
              <Form.Item
                label="Chữ ký User (Co-owner)"
              >
                <SignatureCanvas
                  ref={userSigPadRef}
                  penColor="black"
                  canvasProps={{
                    width: 400,
                    height: 120,
                    className: "signatureCanvas",
                    style: { border: "1px solid #ccc", borderRadius: "6px", width: "100%" },
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
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Modal Tạo Owner Contract mới (từ Contract ID đã chọn) */}
      <Modal
        title="Tạo Owner Contract"
        open={createContractModalVisible}
        onOk={handleAddUserSubmit}
        onCancel={handleCloseCreateContractModal}
        okText="Tạo"
        cancelText="Hủy"
        width={1000}
      >
        {selectedContractId && (
          <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 6 }}>
            <Typography.Text strong>Contract ID: </Typography.Text>
            <Typography.Text>{selectedContractId}</Typography.Text>
          </div>
        )}
        <Form form={addUserForm} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="userId"
                label="Chọn User (Co-owner) - Chỉ hiển thị user đã được APPROVED"
                rules={[{ required: true, message: "Vui lòng chọn user!" }]}
              >
                <Select 
                  placeholder="Chọn user" 
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children?.props?.children || option?.children || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                >
                  {users.map((user) => (
                    <Select.Option key={user.id || user.userId} value={user.id || user.userId}>
                      {user.fullName || user.full_name || "N/A"} - {user.email} {user.phone ? `(${user.phone})` : ""}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="sharePercentage"
                label="Share Percentage (%)"
                rules={[
                  { required: true, message: 'Vui lòng nhập share percentage!' },
                  { type: 'number', min: 0, max: 100, message: 'Share percentage phải từ 0 đến 100!' }
                ]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  min={0} 
                  max={100} 
                  placeholder="Nhập share percentage (0-100%)"
                />
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Chữ ký Admin"
              >
                <SignatureCanvas
                  ref={adminSigPadRef}
                  penColor="black"
                  canvasProps={{
                    width: 400,
                    height: 120,
                    className: "signatureCanvas",
                    style: { border: "1px solid #ccc", borderRadius: "6px", width: "100%" },
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
            </Col>

            <Col span={12}>
              <Form.Item
                label="Chữ ký User (Co-owner)"
              >
                <SignatureCanvas
                  ref={userSigPadRef}
                  penColor="black"
                  canvasProps={{
                    width: 400,
                    height: 120,
                    className: "signatureCanvas",
                    style: { border: "1px solid #ccc", borderRadius: "6px", width: "100%" },
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
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default OwnerContractManagement;

