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
  Tooltip
} from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import vehiclesApi from "../../../api/vehiclesApi";

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
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedBrandUpdate, setSelectedBrandUpdate] = useState(null);
  const [form] = Form.useForm();
  const [updateForm] = Form.useForm();

  // Vehicle status options
  const vehicleStatusOptions = [
    { value: "Available", label: "Available" },
    { value: "Unavailable", label: "Unavailable" },
    { value: "Maintenance", label: "Maintenance" },
  ];

  // Vehicle brand options
  const brandOptions = [
    { value: "Audi", label: "Audi" },
    { value: "BMW", label: "BMW" },
    { value: "BYD", label: "BYD" },
    { value: "Chery", label: "Chery" },
    { value: "Honda", label: "Honda" },
    { value: "Hyundai", label: "Hyundai" },
    { value: "Kia", label: "Kia" },
    { value: "Leapmotor", label: "Leapmotor" },
    { value: "MG", label: "MG" },
    { value: "Mercedes-Benz", label: "Mercedes-Benz" },
    { value: "Nissan", label: "Nissan" },
    { value: "Ora", label: "Ora" },
    { value: "Porche", label: "Porche" },
    { value: "Tesla", label: "Tesla" },
    { value: "VinFast", label: "VinFast" },
    { value: "Xpeng", label: "Xpeng" },
    { value: "Zeekr", label: "Zeekr" },
  ];

  // Brand to models mapping
  const brandModelsMap = {
    "VinFast": ["VF 3", "VF 5 Plus", "VF 6", "VF 7", "VF 8", "VF 9", "VF e34"],
    "BYD": ["Dolphin", "Seal", "Atto 3"],
    "Ora": ["Good Cat"],
    "Chery": ["Omoda E5"],
    "Leapmotor": ["T03", "C10"],
    "Zeekr": ["X"],
    "Xpeng": ["G6"],
    "Hyundai": ["Ioniq 5", "Ioniq 6"],
    "Kia": ["EV6", "EV9"],
    "Mercedes-Benz": ["EQB", "EQE", "EQS"],
    "BMW": ["iX3", "i4", "i7"],
    "Audi": ["e-tron GT", "Q8 e-tron"],
    "Porche": ["Taycan", "Macan Electric (2025)"],
    "Nissan": ["Leaf"],
    "Toyota": ["bZ4X"],
    "Honda": ["e:Ny1"],
    "Tesla": ["Model 3", "Model Y", "Model S", "Model X"],
    "MG": ["ZS EV", "EHS", "Marvel R"]
  };

  // Get model options based on selected brand
  const getModelOptions = (brand) => {
    return brandModelsMap[brand] || [];
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await vehiclesApi.getAllVehicles();
      const vehiclesData = Array.isArray(response) ? response : [];
      setVehicles(vehiclesData);
    } catch (error) {
      message.error("Không tải được danh sách xe!");
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = () => {
    setModalVisible(true);
    setSelectedBrand(null);
    form.resetFields();
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedBrand(null);
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    // Reset model when brand changes
    form.setFieldsValue({ model: undefined });
  };

  const handleBrandChangeUpdate = (brand) => {
    setSelectedBrandUpdate(brand);
    // Reset model when brand changes
    updateForm.setFieldsValue({ model: undefined });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await vehiclesApi.createVehicle(values);
      message.success("Thêm xe thành công!");
      setModalVisible(false);
      setSelectedBrand(null);
      form.resetFields();
      fetchVehicles(); // Refresh danh sách
    } catch (error) {
      console.error("Error creating vehicle:", error);
      message.error("Không thể thêm xe!");
    }
  };

  const handleViewDetails = (vehicle) => {
    setSelectedVehicle(vehicle);
    setDetailModalVisible(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedVehicle(null);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setUpdateModalVisible(true);
    setSelectedBrandUpdate(vehicle.brand);
    
    // Điền dữ liệu vào form update (chỉ các trường cần thiết theo API)
    updateForm.setFieldsValue({
      brand: vehicle.brand,
      model: vehicle.model,
      color: vehicle.color,
      year: vehicle.year,
      operatingCostPerDay: vehicle.operatingCostPerDay,
      operatingCostPerKm: vehicle.operatingCostPerKm,
      description: vehicle.description,
      status: vehicle.status,
    });
  };
  //update ở đây nha
  const handleCloseUpdateModal = () => {
    setUpdateModalVisible(false);
    setEditingVehicle(null);
    setSelectedBrandUpdate(null);
    updateForm.resetFields();
  };

  const handleUpdateSubmit = async () => {
    try {
      const values = await updateForm.validateFields();
      
      if (!editingVehicle.vehicleId) {
        message.error("Không tìm thấy ID xe để cập nhật!");
        return;
      }
      
      const updateData = {
        brand: values.brand,
        model: values.model,
        color: values.color,
        year: values.year,
        operatingCostPerDay: values.operatingCostPerDay,
        operatingCostPerKm: values.operatingCostPerKm,
        description: values.description || "",
        status: values.status,
      };
      
      await vehiclesApi.updateVehicle(editingVehicle.vehicleId, updateData);
      
      message.success("Cập nhật xe thành công!");
      setUpdateModalVisible(false);
      setEditingVehicle(null);
      setSelectedBrandUpdate(null);
      updateForm.resetFields();
      fetchVehicles(); 
    } catch (error) {
      console.error("Error updating vehicle:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      message.error(`Không thể cập nhật xe! ${errorMessage}`);
    }
  };

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
      if (!deletingVehicle.vehicleId) {
        message.error("Không tìm thấy ID xe để xóa!");
        return;
      }

      await vehiclesApi.deleteVehicle(deletingVehicle.vehicleId);
      message.success("Xóa xe thành công!");
      setDeleteModalVisible(false);
      setDeletingVehicle(null);
      fetchVehicles();
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error";
      message.error(`Không thể xóa xe! ${errorMessage}`);
    }
  };
//table ở đây nè
  const columns = [
    {
      title: "ID",
      dataIndex: "vehicleId",
      key: "vehicleId",
      width: 80,
    },
    {
      title: "Thương hiệu",
      dataIndex: "brand",
      key: "brand",
    },
    {
      title: "Mẫu xe",
      dataIndex: "model", 
      key: "model",
    },
    {
      title: "Biển số",
      dataIndex: "plateNumber",
      key: "plateNumber",
    },
    {
      title: "Màu sắc",
      dataIndex: "color",
      key: "color",
    },
    {
      title: "Năm sản xuất",
      dataIndex: "year",
      key: "year",
    },
    {
      title: "Dung lượng pin (kWh)",
      dataIndex: "batteryCapacityKwh",
      key: "batteryCapacityKwh",
      render: (value) => value ? `${value} kWh` : '-',
    },
    {
      title: "Trạng thái",  
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color = status === "Available" ? "green" : 
                     status === "Unavailable" ? "red" : "orange";
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        onCancel={handleCloseModal}
        okText="Thêm xe"
        cancelText="Hủy"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="brand"
            label="Thương hiệu"
            rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}
          >
            <Select 
              placeholder="Chọn thương hiệu xe"
              onChange={handleBrandChange}
            >
              {brandOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="model"
            label="Mẫu xe"
            rules={[{ required: true, message: 'Vui lòng chọn mẫu xe!' }]}
          >
            <Select 
              placeholder="Chọn mẫu xe"
              disabled={!selectedBrand}
            >
              {getModelOptions(selectedBrand).map(model => (
                <Select.Option key={model} value={model}>
                  {model}
                </Select.Option>
              ))}
            </Select>
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
            name="operatingCostPerDay"
            label="Chi phí vận hành/ngày"
            rules={[{ required: true, message: 'Vui lòng nhập chi phí vận hành/ngày!' }]}
          >
            <InputNumber 
              placeholder="Nhập chi phí vận hành/ngày"
              style={{ width: '100%' }}
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="operatingCostPerKm"
            label="Chi phí vận hành/km"
            rules={[{ required: true, message: 'Vui lòng nhập chi phí vận hành/km!' }]}
          >
            <InputNumber 
              placeholder="Nhập chi phí vận hành/km"
              style={{ width: '100%' }}
              min={0}
              step={0.01}
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
            name="imageUrl"
            label="URL hình ảnh"
          >
            <Input placeholder="Nhập URL hình ảnh (tùy chọn)" />
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
              <Tag color={
                selectedVehicle.status === "Available" ? "green" : 
                selectedVehicle.status === "Unavailable" ? "red" : "orange"
              }>
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
            <Descriptions.Item label="Dung lượng pin (kWh)" span={1}>
              {selectedVehicle.batteryCapacityKwh ? `${selectedVehicle.batteryCapacityKwh} kWh` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí vận hành/ngày" span={1}>
              {selectedVehicle.operatingCostPerDay ? `${selectedVehicle.operatingCostPerDay.toLocaleString()} VND` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Chi phí vận hành/km" span={1}>
              {selectedVehicle.operatingCostPerKm ? `${selectedVehicle.operatingCostPerKm.toLocaleString()} VND` : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả" span={2}>
              {selectedVehicle.description || 'Không có mô tả'}
            </Descriptions.Item>
            {selectedVehicle.imageUrl && (
              <Descriptions.Item label="Hình ảnh" span={2}>
                <img 
                  src={selectedVehicle.imageUrl} 
                  alt={`${selectedVehicle.brand} ${selectedVehicle.model}`}
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '200px' }}
                />
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Ngày tạo" span={1}>
              {selectedVehicle.createdAt ? new Date(selectedVehicle.createdAt).toLocaleString('vi-VN') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lần cuối" span={1}>
              {selectedVehicle.updatedAt ? new Date(selectedVehicle.updatedAt).toLocaleString('vi-VN') : '-'}
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
            rules={[{ required: true, message: 'Vui lòng chọn thương hiệu!' }]}
          >
            <Select 
              placeholder="Chọn thương hiệu xe"
              onChange={handleBrandChangeUpdate}
            >
              {brandOptions.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="model"
            label="Mẫu xe"
            rules={[{ required: true, message: 'Vui lòng chọn mẫu xe!' }]}
          >
            <Select 
              placeholder="Chọn mẫu xe"
              disabled={!selectedBrandUpdate}
            >
              {getModelOptions(selectedBrandUpdate).map(model => (
                <Select.Option key={model} value={model}>
                  {model}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="color"
            label="Màu sắc"
            rules={[{ required: true, message: 'Vui lòng nhập màu sắc!' }]}
          >
            <Input placeholder="Nhập màu sắc" />
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
            name="operatingCostPerDay"
            label="Chi phí vận hành/ngày"
            rules={[{ required: true, message: 'Vui lòng nhập chi phí vận hành/ngày!' }]}
          >
            <InputNumber 
              placeholder="Nhập chi phí vận hành/ngày"
              style={{ width: '100%' }}
              min={0}
              step={0.01}
            />
          </Form.Item>

          <Form.Item
            name="operatingCostPerKm"
            label="Chi phí vận hành/km"
            rules={[{ required: true, message: 'Vui lòng nhập chi phí vận hành/km!' }]}
          >
            <InputNumber 
              placeholder="Nhập chi phí vận hành/km"
              style={{ width: '100%' }}
              min={0}
              step={0.01}
            />
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
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              {vehicleStatusOptions.map(option => (
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
