import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, InputNumber, Select, message, Space, Tag, Descriptions, Tooltip, Upload } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import vehiclesApi from "../../../api/vehiclesApi";
const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

const VehicleManagement = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  const vehicleStatusOptions = [
    { value: "Available", label: "Available" },
    { value: "Unavailable", label: "Unavailable" },
    { value: "Maintenance", label: "Maintenance" },
  ];

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehiclesApi.getAllVehicles();
      
      // Xử lý response từ API
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
      
      if (vehiclesData.length === 0) {
        message.info("Danh sách xe trống");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Không xác định được lỗi";
      message.error(`Không tải được danh sách xe! ${errorMessage}`);
      console.error("Error fetching vehicles:", error);
      console.error("Error response:", error.response);
      setVehicles([]); // Đảm bảo state được set về mảng rỗng khi lỗi
    } finally {
      setLoading(false);
    }
  };

  // -------------------- CREATE --------------------
  const handleAddVehicle = () => {
    setModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();

      Object.entries(values).forEach(([key, value]) => {
        if (key !== "imageFile") formData.append(key, value);
      });

      if (values.imageFile?.[0]?.originFileObj) {
        formData.append("imageFile", values.imageFile[0].originFileObj);
      }

      await vehiclesApi.createVehicle(formData);
      message.success("Thêm xe thành công!");
      setModalVisible(false);
      fetchVehicles();
    } catch (error) {
      console.error("Error creating vehicle:", error);
      
      // Xử lý lỗi chi tiết
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          "Không xác định được lỗi";
      
      // Kiểm tra các lỗi cụ thể
      if (error.response?.status === 400) {
        message.error(`Dữ liệu không hợp lệ: ${errorMessage}`);
      } else if (error.response?.status === 401) {
        message.error("Bạn không có quyền thực hiện thao tác này!");
      } else if (error.response?.status === 403) {
        message.error("Không có quyền truy cập!");
      } else if (error.response?.status === 409) {
        message.error(`Xe đã tồn tại: ${errorMessage}`);
      } else {
        message.error(`Không thể thêm xe! ${errorMessage}`);
      }
    }
  };

  // -------------------- DETAILS --------------------
  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedVehicle(null);
  };

  // -------------------- UPDATE --------------------
  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setUpdateModalVisible(true);

    updateForm.setFieldsValue({
      brand: vehicle.brand,
      model: vehicle.model,
      plateNumber: vehicle.plateNumber,
      color: vehicle.color,
      seat: vehicle.seat,
      price: vehicle.price,
      feeChargingPer1PercentUsed: vehicle.feeChargingPer1PercentUsed,
      feeOverKm: vehicle.feeOverKm,
      operationPerMonthPerShare: vehicle.operationPerMonthPerShare,
      year: vehicle.year,
      batteryCapacityKwh: vehicle.batteryCapacityKwh,
      status: vehicle.status,
      description: vehicle.description,
      imageUrl: vehicle.imageUrl
    });
  };

  const handleCloseUpdateModal = () => {
    setUpdateModalVisible(false);
    setEditingVehicle(null);
    updateForm.resetFields();
  };

  const handleUpdateSubmit = async () => {
    try {
      const values = await updateForm.validateFields();

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value);
        }
      });

      // Nếu người dùng chọn ảnh mới (sẽ là fileList)
      if (values.imageFile?.[0]?.originFileObj) {
        formData.append("imageFile", values.imageFile[0].originFileObj);
      }

      await vehiclesApi.updateVehicle(editingVehicle.vehicleId, formData);

      message.success("Cập nhật xe thành công!");
      handleCloseUpdateModal();
      fetchVehicles();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      message.error("Không thể cập nhật xe!");
    }
  };

  // -------------------- DELETE --------------------
  const handleDeleteVehicle = (vehicle) => {
    setDeletingVehicle(vehicle);
    setDeleteModalVisible(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false);
    setDeletingVehicle(null);
  };

  const handleConfirmDelete = async () => {
    try {
      const vehicleId = deletingVehicle?.vehicleId ?? deletingVehicle?.id;
      
      if (!vehicleId) {
        message.error("Không tìm thấy ID xe để xóa!");
        return;
      }
      await vehiclesApi.deleteVehicle(deletingVehicle.vehicleId);
      message.success("Xóa xe thành công!");
      setDeleteModalVisible(false);
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      message.error("Không thể xóa xe!");
    }
  };

  // -------------------- TABLE --------------------

  const vehicleStatusColors = {
    AVAILABLE: "green",
    UNAVAILABLE: "red",
    MAINTENANCE: "orange",

  };

  const columns = [
    {
      title: "ID",
      dataIndex: "vehicleId",
      key: "vehicleId",
      width: 70,
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (imageUrl) => (
        imageUrl ? (
          <img
            src={
              imageUrl.startsWith("http")
                ? imageUrl
                : `${baseURL}/${imageUrl}`
            }
            alt="vehicle"
            style={{ width: 200, height: 120, objectFit: "cover", borderRadius: 6 }}
          />
        ) : (
          <span style={{ color: "#999" }}>Không có</span>
        )
      ),
    },
    { title: "Thương hiệu", dataIndex: "brand", key: "brand" },
    { title: "Mẫu xe", dataIndex: "model", key: "model" },
    { title: "Biển số", dataIndex: "plateNumber", key: "plateNumber" },
    {
      title: "Giá Xe",
      dataIndex: "price",
      key: "price",
      render: (v) => (v ? v.toLocaleString() + " VND" : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          status === "Available"
            ? "green"
            : status === "Unavailable"
              ? "red"
              : "orange";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditVehicle(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa xe">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteVehicle(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: "black" }}>
        <h2>Quản lý xe</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddVehicle}
        >
          Thêm xe mới
        </Button>
      </div>

      <Table
        rowKey="vehicleId"
        columns={columns}
        dataSource={vehicles}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Add Vehicle Modal */}
      <Modal
        title="Thêm xe mới"
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="Thêm xe"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="brand"
            label="Thương hiệu"
            rules={[{ required: true, message: "Vui lòng chọn thương hiệu!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="model"
            label="Mẫu xe"
            rules={[{ required: true, message: 'Vui lòng nhập mẫu xe!' }]}
          >
            <Input placeholder="Nhập mẫu xe" />
          </Form.Item>

          <Form.Item
            name="plateNumber"
            label="Biển số xe"
            rules={[{ required: true, message: 'Vui lòng nhập biển số!' }]}
          >
            <Input placeholder="Nhập biển số xe" />
          </Form.Item>

          <Form.Item
            name="color"
            label="Màu sắc"
            rules={[{ required: true, message: 'Vui lòng nhập màu sắc!' }]}
          >
            <Input placeholder="Nhập màu sắc" />
          </Form.Item>

          <Form.Item
            name="seat"
            label="Số chỗ ngồi"
            rules={[{ required: true, message: 'Vui lòng nhập số chỗ ngồi!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>

          <Form.Item
            name="price"
            label="Giá xe"
            rules={[{ required: true, message: 'Vui lòng nhập giá thuê!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>

          <Form.Item
            name="feeChargingPer1PercentUsed"
            label="Phí sạc mỗi 1% pin sử dụng"
            rules={[{ required: true, message: 'Vui lòng nhập phí sạc!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>

          <Form.Item
            name="feeOverKm"
            label="Phí vượt km"
            rules={[{ required: true, message: 'Vui lòng nhập phí vượt km!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>

          <Form.Item
            name="operationPerMonthPerShare"
            label="Chi phí vận hành/tháng/chia sẻ"
            rules={[{ required: true, message: 'Vui lòng nhập chi phí vận hành!' }]}
          >
            <InputNumber style={{ width: '100%' }} min={0} step={0.01} />
          </Form.Item>


          <Form.Item
            name="year"
            label="Năm sản xuất"
            rules={[{ required: true, message: 'Vui lòng nhập năm sản xuất!' }]}
          >
            <InputNumber
              placeholder="Nhập năm sản xuất"
              style={{ width: '100%' }}
              min={1900}
              max={new Date().getFullYear() + 1}
            />
          </Form.Item>

          <Form.Item
            name="batteryCapacityKwh"
            label="Dung lượng pin (kWh)"
            rules={[{ required: true, message: 'Vui lòng nhập dung lượng pin!' }]}
          >
            <InputNumber
              placeholder="Nhập dung lượng pin"
              style={{ width: '100%' }}
              min={0}
              step={0.1}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            initialValue="Available"
          >
            <Select placeholder="Chọn trạng thái">
              {vehicleStatusOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập mô tả về xe (tùy chọn)"
            />
          </Form.Item>

          <Form.Item
            name="imageFile"
            label="Hình ảnh xe"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
            rules={[{ required: true, message: "Vui lòng chọn hình ảnh!" }]}
          >
            <Upload
              listType="picture"
              beforeUpload={() => false} // không upload tự động
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
            </Upload>
          </Form.Item>

        </Form>
      </Modal>

      {/* Vehicle Details Modal */}
      <Modal
        title="Chi tiết xe"
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedVehicle && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="ID" span={1}>
              {selectedVehicle.vehicleId}
            </Descriptions.Item>

            <Descriptions.Item label="Trạng thái" span={1}>
              <Tag color={vehicleStatusColors[selectedVehicle.status] || "blue"}>
                {selectedVehicle.status}
              </Tag>
            </Descriptions.Item>

            <Descriptions.Item label="Thương hiệu" span={1}>
              {selectedVehicle.brand || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Mẫu xe" span={1}>
              {selectedVehicle.model || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Biển số" span={1}>
              {selectedVehicle.plateNumber || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Màu sắc" span={1}>
              {selectedVehicle.color || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Năm sản xuất" span={1}>
              {selectedVehicle.year || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Số chỗ" span={1}>
              {selectedVehicle.seat || '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Giá xe" span={1}>
              {selectedVehicle.price !== null ? `${selectedVehicle.price} VND` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Phí sạc / 1% pin" span={1}>
              {selectedVehicle.feeChargingPer1PercentUsed !== null ? `${selectedVehicle.feeChargingPer1PercentUsed} VND` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Phí vượt km" span={1}>
              {selectedVehicle.feeOverKm !== null ? `${selectedVehicle.feeOverKm} VND` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Vận hành / tháng / chia sẻ" span={1}>
              {selectedVehicle.operationPerMonthPerShare !== null ? `${selectedVehicle.operationPerMonthPerShare} VND` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Dung lượng pin (kWh)" span={1}>
              {selectedVehicle.batteryCapacityKwh !== null ? `${selectedVehicle.batteryCapacityKwh} kWh` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {selectedVehicle.description || 'Không có mô tả'}
            </Descriptions.Item>

            <Descriptions.Item label="Hình ảnh" span={2}>
              {selectedVehicle.imageUrl ? (
                <img
                  src={
                    selectedVehicle.imageUrl.startsWith("http")
                      ? selectedVehicle.imageUrl
                      : `${baseURL}/${selectedVehicle.imageUrl}`
                  }
                  alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                  style={{
                    width: "100%",
                    height: 200,
                    objectFit: "cover",
                    borderRadius: 6
                  }}
                />
              ) : (
                <span style={{ color: "#999" }}>Không có</span>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Update Vehicle Modal */}
      <Modal
        title="Cập nhật xe"
        open={updateModalVisible}
        onOk={handleUpdateSubmit}
        onCancel={handleCloseUpdateModal}
        okText="Cập nhật"
        cancelText="Hủy"
        width={600}
      >
        <Form form={updateForm} layout="vertical">
          <Form.Item
            name="brand"
            label="Thương hiệu"
            rules={[{ required: true, message: "Vui lòng chọn thương hiệu!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="model" label="Mẫu xe" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="plateNumber" label="Biển số" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="color" label="Màu sắc" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="seat" label="Số chỗ" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="price" label="Giá xe" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="feeChargingPer1PercentUsed" label="Phí sạc / 1% pin" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="feeOverKm" label="Phí vượt km" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="operationPerMonthPerShare" label="Vận hành / tháng / chia sẻ" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>

          <Form.Item name="year" label="Năm sản xuất" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={1900} max={new Date().getFullYear() + 1} />
          </Form.Item>

          <Form.Item name="batteryCapacityKwh" label="Pin (kWh)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} step={0.1} />
          </Form.Item>

          <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
            <Select>
              {vehicleStatusOptions.map(op => (
                <Select.Option key={op.value} value={op.value}>{op.label}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="imageFile"
            label="Cập nhật hình ảnh (tùy chọn)"
            valuePropName="fileList"
            getValueFromEvent={(e) => e?.fileList}
          >
            <Upload
              listType="picture"
              beforeUpload={() => false}
            >
              <Button icon={<UploadOutlined />}>Chọn ảnh mới</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Xác nhận xóa xe"
        open={deleteModalVisible}
        onOk={handleConfirmDelete}
        onCancel={handleCloseDeleteModal}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
        width={500}
      >
        <div style={{ padding: '16px 0' }}>
          <p>
            Bạn có chắc chắn muốn xóa xe này không?
          </p>
          {deletingVehicle && (
            <div style={{
              backgroundColor: '#f5f5f5',
              padding: '12px',
              borderRadius: '6px',
              marginTop: '12px'
            }}>
              <p><strong>Thông tin xe sẽ bị xóa:</strong></p>
              <p><strong>ID:</strong> {deletingVehicle.vehicleId}</p>
              <p><strong>Thương hiệu:</strong> {deletingVehicle.brand}</p>
              <p><strong>Mẫu xe:</strong> {deletingVehicle.model}</p>
              <p><strong>Biển số:</strong> {deletingVehicle.plateNumber}</p>
            </div>
          )}
          <p style={{ color: '#ff4d4f', marginTop: '16px', fontWeight: 'bold' }}>
            ⚠️ Hành động này không thể hoàn tác!
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default VehicleManagement;
