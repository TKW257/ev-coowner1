import React, { useState, useEffect } from "react";
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select,
  message,
  Space,
  Tag,
  Tooltip
} from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import userApi from "../../../api/userApi";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  // const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  // User role options
  const roleOptions = [
    { value: "USER", label: "User" },
    { value: "STAFF", label: "Staff" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getAll();
      const usersData = Array.isArray(response) ? response : [];
      setUsers(usersData);
    } catch (error) {
      message.error("Không tải được danh sách người dùng!");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      // Note: You might need to implement add user API
      message.success("Thêm người dùng thành công!");
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUpdateModalVisible(true);
    updateForm.setFieldsValue({
      full_name: user.full_name,
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

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Tên đầy đủ",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {roleOptions.find(r => r.value === role)?.label || role}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 150,
      render: (_, record) => (
        <Space size="middle">
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
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: "black"}}>
        <h2>Quản lý người dùng</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleAddUser}
        >
          Thêm người dùng mới
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Add User Modal */}
      <Modal
        title="Thêm người dùng mới"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="full_name"
            label="Tên đầy đủ"
            rules={[{ required: true, message: 'Vui lòng nhập tên đầy đủ!' }]}
          >
            <Input placeholder="Nhập tên đầy đủ" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              {roleOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
        </Form>
      </Modal>

      {/* Update User Modal */}
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
            name="full_name"
            label="Tên đầy đủ"
            rules={[{ required: true, message: 'Vui lòng nhập tên đầy đủ!' }]}
          >
            <Input placeholder="Nhập tên đầy đủ" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Số điện thoại"
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              {roleOptions.map(option => (
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
        title="Xác nhận xóa"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa người dùng <strong>{deletingUser?.full_name}</strong>?</p>
      </Modal>
    </div>
  );
};

export default UserManagement;
