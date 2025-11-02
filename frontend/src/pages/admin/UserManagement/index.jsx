import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, message, Card, Space, Tag, Tooltip, Row, Col, Divider } from "antd";
import { CrownOutlined, TeamOutlined, EditOutlined, DeleteOutlined, UserOutlined, AuditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import userApi from "../../../api/userApi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);

  const [verifyNote, setVerifyNote] = useState("");
  const [updateForm] = Form.useForm();

  const [cccdPreview, setCccdPreview] = useState(null);
  const [gplxPreview, setGplxPreview] = useState(null);

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);


  const base = "https://vallate-enzootically-sterling.ngrok-free.dev/";


  const statusOptions = [
    { value: "PENDING", label: "Chờ duyệt" },
    { value: "APPROVED", label: "Đã duyệt" },
    { value: "REJECTED", label: "Từ chối" },
  ];

  const roleOptions = [
    { value: "ADMIN", label: "Admin" },
    { value: "STAFF", label: "Staff" },
    { value: "USER", label: "User" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAll();
      setUsers(Array.isArray(response) ? response : []);
    } catch (error) {
      message.error("Không tải được danh sách người dùng!");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUpdateModalVisible(true);
    updateForm.setFieldsValue({
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
    });
  };

  const handleUpdateSubmit = async () => {
    try {
      const values = await updateForm.validateFields();
      await userApi.update(editingUser.id, values);
      message.success("Cập nhật người dùng thành công!");
      setUpdateModalVisible(false);
      updateForm.resetFields();
      fetchUsers();
    } catch (error) {
      message.error("Cập nhật người dùng thất bại!");
      console.error("Error updating user:", error);
    }
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await userApi.delete(deletingUser.id);
      message.success("Xóa người dùng thành công!");
      setDeleteModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error("Xóa người dùng thất bại!");
      console.error("Error deleting user:", error);
    }
  };

  const handleViewUser = (user) => {
    setViewingUser(user);
    setViewModalVisible(true);

    // Xử lý hiển thị ảnh CCCD và GPLX
    if (user.cccdImagePath) {
      const fixedPath = user.cccdImagePath.replace(/\\/g, "/");
      setCccdPreview(`${base}${fixedPath}`);
    } else setCccdPreview(null);

    if (user.gplxImagePath) {
      const fixedPath = user.gplxImagePath.replace(/\\/g, "/");
      setGplxPreview(`${base}${fixedPath}`);
    } else setGplxPreview(null);
  };

  const handleVerify = async (approved) => {
    if (!viewingUser) return;
    try {
      await userApi.verifyUser(viewingUser.id, approved, verifyNote);
      message.success(
        approved ? "Đã duyệt người dùng thành công!" : "Đã từ chối xác minh!"
      );
      setViewModalVisible(false);
      setVerifyNote("");
      fetchUsers();
    } catch (error) {
      message.error("Xác minh người dùng thất bại!");
      console.error("Error verifying user:", error);
    }
  };

  // --- Lọc user dựa theo role và status ---
  const filteredUsers = users.filter((user) => {
    const roleMatch = selectedRole ? user.role === selectedRole : true;
    const statusMatch = selectedStatus ? user.verifyStatus === selectedStatus : true;
    return roleMatch && statusMatch;
  });

  // --- Thống kê role ---
  const roleCounts = {
    ADMIN: users.filter((u) => u.role === "ADMIN").length,
    STAFF: users.filter((u) => u.role === "STAFF").length,
    USER: users.filter((u) => u.role === "USER").length,
  };

  const handleCardClick = (role) => {
    setSelectedRole(role === selectedRole ? null : role); 
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "red";
      case "STAFF":
        return "blue";
      case "USER":
        return "green";
      default:
        return "default";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "green";
      case "PENDING":
        return "gold";
      case "REJECTED":
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", width: 70 },
    { title: "Tên đầy đủ", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {roleOptions.find((r) => r.value === role)?.label || role}
        </Tag>
      ),
    },
    {
      title: "Trạng thái xác minh",
      dataIndex: "verifyStatus",
      key: "verifyStatus",
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status || "Chưa xác định"}
        </Tag>
      ),
    },
    {
      title: "Xác thực",
      key: "verify",
      align: "center",
      render: (_, record) => (
        <Tooltip title="Xác thực người dùng">
          <Button

            icon={<AuditOutlined />}
            onClick={() => handleViewUser(record)}
          />
        </Tooltip>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 140,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa người dùng">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteUser(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }} />

      {/* --- Thống kê theo vai trò --- */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={8}>
          <Card
            hoverable
            onClick={() => handleCardClick("ADMIN")}
            style={{
              border:
                selectedRole === "ADMIN" ? "2px solid #f5222d" : "1px solid #eee",
              textAlign: "center",
            }}
          >
            <CrownOutlined style={{ fontSize: 28, color: "#f5222d" }} />
            <h3>Admin</h3>
            <p>{roleCounts.ADMIN} người dùng</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            hoverable
            onClick={() => handleCardClick("STAFF")}
            style={{
              border:
                selectedRole === "STAFF" ? "2px solid #1890ff" : "1px solid #eee",
              textAlign: "center",
            }}
          >
            <TeamOutlined style={{ fontSize: 28, color: "#1890ff" }} />
            <h3>Nhân viên</h3>
            <p>{roleCounts.STAFF} người dùng</p>
          </Card>
        </Col>
        <Col span={8}>
          <Card
            hoverable
            onClick={() => handleCardClick("USER")}
            style={{
              border:
                selectedRole === "USER" ? "2px solid #52c41a" : "1px solid #eee",
              textAlign: "center",
            }}
          >
            <UserOutlined style={{ fontSize: 28, color: "#52c41a" }} />
            <h3>Người dùng</h3>
            <p>{roleCounts.USER} người dùng</p>
          </Card>
        </Col>
      </Row>

      {/* --- Lọc theo trạng thái --- */}
      <div style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder="Trạng thái xác minh"
          style={{ width: 170 }}
          value={selectedStatus}
          onChange={(value) => setSelectedStatus(value)}
        >
          {statusOptions.map((s) => (
            <Select.Option key={s.value} value={s.value}>
              {s.label}
            </Select.Option>
          ))}
        </Select>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={filteredUsers}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />


      {/* View (Xác thực) Modal */}
      <Modal
        title={<b>Thông tin & Xác thực người dùng</b>}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        width={700}
        footer={[
          <Input
            key="note"
            placeholder="Ghi chú xác minh (nếu có)"
            value={verifyNote}
            onChange={(e) => setVerifyNote(e.target.value)}
            style={{ width: "100%", marginBottom: 8 }}
          />,
          <Space key="actions">
            <Button
              icon={<CloseOutlined />}
              danger
              onClick={() => handleVerify(false)}
            >
              Từ chối
            </Button>
            <Button
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => handleVerify(true)}
            >
              Xác nhận
            </Button>
          </Space>,
        ]}
      >
        {viewingUser && (
          <div style={{ color: "#333" }}>
            <Row gutter={16}>
              <Col span={12}>
                <p><b>ID:</b> {viewingUser.id}</p>
                <p><b>Họ tên:</b> {viewingUser.fullName}</p>
                <p><b>Email:</b> {viewingUser.email}</p>
                <p><b>Số điện thoại:</b> {viewingUser.phone || "—"}</p>
              </Col>
              <Col span={12}>
                <p><b>Trạng thái xác minh:</b>{" "}
                  <Tag color={getStatusColor(viewingUser.verifyStatus)}>
                    {viewingUser.verifyStatus}
                  </Tag>
                </p>
                <p><b>Ghi chú xác minh:</b> {viewingUser.verifyNote || "—"}</p>
              </Col>
            </Row>

            <Divider />

            <Row gutter={24}>
              <Col span={12}>
                <p><b>Ảnh CCCD:</b></p>
                {cccdPreview ? (
                  <img
                    src={cccdPreview}
                    alt="CCCD"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                ) : (
                  <Tag color="default">Không có ảnh</Tag>
                )}
              </Col>
              <Col span={12}>
                <p><b>Ảnh GPLX:</b></p>
                {gplxPreview ? (
                  <img
                    src={gplxPreview}
                    alt="GPLX"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                    }}
                  />
                ) : (
                  <Tag color="default">Không có ảnh</Tag>
                )}
              </Col>
            </Row>
          </div>
        )}
      </Modal>

      {/* Update Modal */}
      <Modal
        title="Chỉnh sửa người dùng"
        open={updateModalVisible}
        onOk={handleUpdateSubmit}
        onCancel={() => setUpdateModalVisible(false)}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={updateForm} layout="vertical">
          <Form.Item
            name="fullName"
            label="Tên đầy đủ"
            rules={[{ required: true, message: "Vui lòng nhập tên đầy đủ!" }]}
          >
            <Input placeholder="Nhập tên đầy đủ" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò!" }]}
          >
            <Select placeholder="Chọn vai trò">
              {roleOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>
          Bạn có chắc chắn muốn xóa người dùng{" "}
          <strong>{deletingUser?.fullName}</strong>?
        </p>
      </Modal>
    </div>
  );
};

export default UserManagement;
