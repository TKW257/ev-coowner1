import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Select,
  InputNumber,
  Slider,
  message,
  Space,
  Tag,
  Descriptions,
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

const { Title } = Typography;

const BASE_URL = "https://vallate-enzootically-sterling.ngrok-free.dev";

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
  const [selectedContract, setSelectedContract] = useState(null);
  const [addUserForm] = Form.useForm();
  const [selectContractForm] = Form.useForm();
  const adminSigPadRef = useRef(null);
  const userSigPadRef = useRef(null);

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

  // /** Chuyển array ngày [YYYY,MM,DD] thành Date */
  // const parseDate = (dateArr) => {
  //   if (!dateArr) return null;
  //   if (Array.isArray(dateArr)) {
  //     const [year, month, day, hour = 0, minute = 0, second = 0] = dateArr;
  //     return new Date(year, month - 1, day, hour, minute, second);
  //   }
  //   return new Date(dateArr);
  // };

  // /** Xây URL ảnh đầy đủ */
  // const buildUrl = (path) => {
  //   if (!path) return null;
  //   const fixedPath = path.replace(/\\/g, "/");
  //   return fixedPath.startsWith("http")
  //     ? fixedPath
  //     : `${BASE_URL}${fixedPath.startsWith("/") ? fixedPath : `/${fixedPath}`}`;
  // };

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

  const handleSelectContract = async () => {
    try {
      const values = await selectContractForm.validateFields();
      const contractId = values.contractId;
      
      // Lấy tất cả contracts từ API và lọc ra contract cần thiết
      const contractsResponse = await contractApi.getAll();
      let contractsData = [];
      if (Array.isArray(contractsResponse)) contractsData = contractsResponse;
      else if (contractsResponse?.data && Array.isArray(contractsResponse.data)) contractsData = contractsResponse.data;
      else if (contractsResponse?.content && Array.isArray(contractsResponse.content)) contractsData = contractsResponse.content;
      
      // Lọc ra contract theo contractId
      const contractData = contractsData.find(c => (c.contractId || c.id) === contractId);
      
      if (!contractData) {
        message.error("Không tìm thấy hợp đồng!");
        return;
      }
      
      setSelectedContractId(contractId);
setSelectedContract(contractData);
      setSelectContractModalVisible(false);
      setCreateContractModalVisible(true);
      addUserForm.resetFields();
      // Xóa chữ ký
      if (adminSigPadRef.current) adminSigPadRef.current.clear();
      if (userSigPadRef.current) userSigPadRef.current.clear();
    } catch (error) {
      console.error("Error fetching contract:", error);
      message.error("Không thể tải thông tin hợp đồng!");
    }
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
    setSelectedContract(null);
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

      // Lấy contract data để lấy các trường insurance, registration, etc.
      let contractData = selectedContract;
      
      // Nếu không có selectedContract, tìm trong contracts list hoặc từ selectedOwnerContract
      if (!contractData) {
        if (selectedContractId) {
          contractData = contracts.find(c => (c.contractId || c.id) === selectedContractId);
        } else if (selectedOwnerContract?.contract) {
          contractData = selectedOwnerContract.contract;
        }
      }
      
      // Nếu vẫn không có, gọi API getAllContract và lọc ra
      if (!contractData && contractId) {
        try {
          const contractsResponse = await contractApi.getAll();
          let contractsData = [];
          if (Array.isArray(contractsResponse)) contractsData = contractsResponse;
          else if (contractsResponse?.data && Array.isArray(contractsResponse.data)) contractsData = contractsResponse.data;
          else if (contractsResponse?.content && Array.isArray(contractsResponse.content)) contractsData = contractsResponse.content;
contractData = contractsData.find(c => (c.contractId || c.id) === contractId);
        } catch (error) {
          console.error("Error fetching contract:", error);
        }
      }

      // Tạo FormData
      const formData = new FormData();
      formData.append("contractId", contractId.toString());
      formData.append("userId", values.userId.toString());
      formData.append("sharePercentage", values.sharePercentage.toString());
      
      // Lấy các trường từ contract data
      if (contractData) {
        if (contractData.insurance !== undefined && contractData.insurance !== null) {
          formData.append("insurance", contractData.insurance.toString());
        }
        if (contractData.registration !== undefined && contractData.registration !== null) {
          formData.append("registration", contractData.registration.toString());
        }
        if (contractData.maintenance !== undefined && contractData.maintenance !== null) {
          formData.append("maintenance", contractData.maintenance.toString());
        }
        if (contractData.cleaning !== undefined && contractData.cleaning !== null) {
          formData.append("cleaning", contractData.cleaning.toString());
        }
        if (contractData.operationPerMonth !== undefined && contractData.operationPerMonth !== null) {
          formData.append("operationPerMonth", contractData.operationPerMonth.toString());
        }
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

//   /** Hiển thị trạng thái tiếng Việt */
//   const renderStatus = (status) => {
//     const map = {
//       PENDING: { text: "Đang chờ duyệt", color: "orange" },
// APPROVED: { text: "Đã được duyệt", color: "green" },
//       COMPLETED: { text: "Đã bán đủ cổ phần", color: "blue" },
//       EXPIRED: { text: "Hết hạn hợp đồng", color: "red" },
//     };
//     const { text, color } = map[status] || { text: status || "-", color: "default" };
//     return <Tag color={color}>{text}</Tag>;
//   };

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
      title: "Phần trăm chia sẻ",
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
      {selectedOwnerContract && (() => {
        // Chuẩn bị dữ liệu cho component OwnerContract
        const contract = selectedOwnerContract.contract;
        const contractData = {
          ...selectedOwnerContract,
          // Đảm bảo có vehicle từ contract
          vehicle: selectedOwnerContract.vehicle || contract?.vehicle,
          // Đảm bảo có contractId
          contractId: selectedOwnerContract.contractId || selectedOwnerContract.contract_Id || contract?.contractId || contract?.id,
          // Lấy các trường phí từ ownerContract hoặc contract
          insurance: selectedOwnerContract.insurance ?? contract?.insurance,
          registration: selectedOwnerContract.registration ?? contract?.registration,
          maintenance: selectedOwnerContract.maintenance ?? contract?.maintenance,
          cleaning: selectedOwnerContract.cleaning ?? contract?.cleaning,
          operationPerMonth: selectedOwnerContract.operationPerMonth ?? contract?.operationPerMonth,
        };

        return (
          <OwnerContract
            contract={contractData}
            visible={detailModalVisible}
            onClose={handleCloseDetailModal}
            baseURL={BASE_URL}
          />
        );
      })()}


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
                  { required: true, message: 'Vui lòng chọn share percentage!' },
                  { type: 'number', min: 0, max: 100, message: 'Share percentage phải từ 0 đến 100!' }
                ]}
              >
                <Select placeholder="Chọn phần trăm chia sẻ">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(percentage => (
                    <Select.Option key={percentage} value={percentage}>
                      {percentage}%
                    </Select.Option>
                  ))}
                </Select>
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
          <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.sharePercentage !== currentValues.sharePercentage}>
            {({ getFieldValue }) => {
              const sharePercentage = getFieldValue('sharePercentage') || 0;
              const percentageMultiplier = sharePercentage / 100;
              
              return selectedContract && (
                <div style={{ marginBottom: 16 }}>
<Typography.Title level={5} style={{ marginBottom: 12 }}>
                    Thông tin chi phí {sharePercentage > 0 ? `(${sharePercentage}% sở hữu)` : 'từ Contract'}
                  </Typography.Title>
                  <Descriptions bordered column={2} size="small">
                    {selectedContract.insurance !== undefined && selectedContract.insurance !== null && (
                      <Descriptions.Item label="Bảo hiểm">
                        {sharePercentage > 0 ? (
                          <>
                            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                              {(selectedContract.insurance * percentageMultiplier).toLocaleString('vi-VN')} VND
                            </span>
                            <span style={{ color: '#999', fontSize: '12px', marginLeft: 8 }}>
                              (Gốc: {selectedContract.insurance.toLocaleString('vi-VN')} VND)
                            </span>
                          </>
                        ) : (
                          <span>{selectedContract.insurance.toLocaleString('vi-VN')} VND</span>
                        )}
                      </Descriptions.Item>
                    )}
                    {selectedContract.registration !== undefined && selectedContract.registration !== null && (
                      <Descriptions.Item label="Đăng ký">
                        {sharePercentage > 0 ? (
                          <>
                            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                              {(selectedContract.registration * percentageMultiplier).toLocaleString('vi-VN')} VND
                            </span>
                            <span style={{ color: '#999', fontSize: '12px', marginLeft: 8 }}>
                              (Gốc: {selectedContract.registration.toLocaleString('vi-VN')} VND)
                            </span>
                          </>
                        ) : (
                          <span>{selectedContract.registration.toLocaleString('vi-VN')} VND</span>
                        )}
                      </Descriptions.Item>
                    )}
                    {selectedContract.maintenance !== undefined && selectedContract.maintenance !== null && (
                      <Descriptions.Item label="Bảo trì">
                        {sharePercentage > 0 ? (
                          <>
                            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                              {(selectedContract.maintenance * percentageMultiplier).toLocaleString('vi-VN')} VND
                            </span>
                            <span style={{ color: '#999', fontSize: '12px', marginLeft: 8 }}>
                              (Gốc: {selectedContract.maintenance.toLocaleString('vi-VN')} VND)
                            </span>
                          </>
                        ) : (
<span>{selectedContract.maintenance.toLocaleString('vi-VN')} VND</span>
                        )}
                      </Descriptions.Item>
                    )}
                    {selectedContract.cleaning !== undefined && selectedContract.cleaning !== null && (
                      <Descriptions.Item label="Vệ sinh">
                        {sharePercentage > 0 ? (
                          <>
                            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                              {(selectedContract.cleaning * percentageMultiplier).toLocaleString('vi-VN')} VND
                            </span>
                            <span style={{ color: '#999', fontSize: '12px', marginLeft: 8 }}>
                              (Gốc: {selectedContract.cleaning.toLocaleString('vi-VN')} VND)
                            </span>
                          </>
                        ) : (
                          <span>{selectedContract.cleaning.toLocaleString('vi-VN')} VND</span>
                        )}
                      </Descriptions.Item>
                    )}
                    {selectedContract.operationPerMonth !== undefined && selectedContract.operationPerMonth !== null && (
                      <Descriptions.Item label="Chi phí vận hành/tháng">
                        {sharePercentage > 0 ? (
                          <>
                            <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
                              {(selectedContract.operationPerMonth * percentageMultiplier).toLocaleString('vi-VN')} VND
                            </span>
                            <span style={{ color: '#999', fontSize: '12px', marginLeft: 8 }}>
                              (Gốc: {selectedContract.operationPerMonth.toLocaleString('vi-VN')} VND)
                            </span>
                          </>
                        ) : (
                          <span>{selectedContract.operationPerMonth.toLocaleString('vi-VN')} VND</span>
                        )}
                      </Descriptions.Item>
                    )}
                  </Descriptions>
                </div>
              );
            }}
          </Form.Item>
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
                  { required: true, message: 'Vui lòng chọn share percentage!' },
                  { type: 'number', min: 0, max: 100, message: 'Share percentage phải từ 0 đến 100!' }
                ]}
              >
                <Select placeholder="Chọn phần trăm chia sẻ">
                  {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(percentage => (
                    <Select.Option key={percentage} value={percentage}>
                      {percentage}%
                    </Select.Option>
                  ))}
                </Select>
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

