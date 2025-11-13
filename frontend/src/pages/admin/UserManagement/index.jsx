import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Card, Space, Tag, Tooltip, Row, message, Col, Divider } from "antd";
import { CrownOutlined, TeamOutlined, UpCircleOutlined, EditOutlined, DeleteOutlined, UserOutlined, AuditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import userApi from "../../../api/userApi";
import { App } from "antd";


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

  const { notification } = App.useApp();


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

  const handleLevelUpSubmit = async () => {
    try {
      const email = editingUser.email;
      await userApi.levelUpToStaff(email);

      notification.success({
        message: "Thành công",
        description: `Đã thăng cấp ${email} lên STAFF thành công!`,
        placement: "topRight",
      });

      setUpdateModalVisible(false);
      fetchUsers();
    } catch (error) {
      notification.error({
        message: "Thất bại",
        description: "Không thể thăng cấp người dùng này!",
        placement: "topRight",
      });
      console.error("Error upgrading user:", error);
    }
  };

  const handleDeleteUser = (user) => {
    setDeletingUser(user);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    try {
      await userApi.delete(deletingUser.id);

      notification.success({
        message: "Xóa thành công",
        description: `Người dùng ${deletingUser.email} đã được xóa khỏi hệ thống.`,
        placement: "topRight",
      });

      setDeleteModalVisible(false);
      fetchUsers();
    } catch (error) {
      notification.error({
        message: "Xóa thất bại",
        description: "Không thể xóa người dùng. Vui lòng thử lại sau!",
        placement: "topRight",
      });
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

  // Xác thực USER
  const handleVerify = async (approved) => {
    if (!viewingUser) return;

    try {
      await userApi.verifyUser(viewingUser.id, approved, verifyNote);

      notification.success({
        message: approved ? "Duyệt thành công" : "Từ chối thành công",
        description: approved
          ? `Người dùng ${viewingUser.email} đã được xác minh thành công!`
          : `Đã từ chối xác minh người dùng ${viewingUser.email}.`,
        placement: "topRight",
      });

      setViewModalVisible(false);
      setVerifyNote("");
      fetchUsers();
    } catch (error) {
      notification.error({
        message: "Lỗi xác minh",
        description: "Không thể xác minh người dùng, vui lòng thử lại!",
        placement: "topRight",
      });
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
          <Tooltip title="Thăng Cấp Staff">
            <Button
              type="link"
              icon={<UpCircleOutlined />}
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
                <p><b>CCCD:</b> {viewingUser.cccd || "—"}</p>
                <p><b>GPLX:</b> {viewingUser.gplx || "—"}</p>
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

      {/* Xác nhận thăng cấp Staff */}
      <Modal
        title="Xác nhận thăng cấp nhân viên"
        open={updateModalVisible}
        onOk={handleLevelUpSubmit}
        onCancel={() => setUpdateModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <p>
          Bạn có chắc chắn muốn thăng cấp người dùng{" "}
          <strong>{editingUser?.email}</strong> lên <b>STAFF</b> không?
        </p>
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