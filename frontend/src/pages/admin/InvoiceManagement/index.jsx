import React, { useEffect, useState, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Statistic,
  Table,
  Tag,
  Button,
  Modal,
  message,
  Spin,
  Empty,
  Checkbox,
  Space,
  Form,
  Input,
  InputNumber,
  Select,
} from "antd";
import {
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  PlusOutlined,
  FileAddOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import invoiceApi from "../../../api/invoiceApi";
import userApi from "../../../api/userApi";
import feeApi from "../../../api/feeApi";
import ownerShipsApi from "../../../api/ownerShipsApi";
import vehiclesApi from "../../../api/vehiclesApi";
import MonthInvoice from "../../../components/MonthInvoice";

const VARIABLE_FEE_TYPES = [
  "Charging",
  "Overused",
  "OverOdometer",
  "Damage",
];

const VARIABLE_FEE_TYPE_LABELS = {
  Charging: "Phí sạc",
  Overused: "Sử dụng vượt mức",
  OverOdometer: "Vượt số KM",
  Damage: "Hư hỏng",
};

const AdminInvoiceDashboard = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const pdfRef = useRef();

  // === Bulk Create ===
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [openBulkCreate, setOpenBulkCreate] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);

  // === Variable Fee Invoice ===
  const [variableFeeModalVisible, setVariableFeeModalVisible] = useState(false);
  const [variableFeeForm] = Form.useForm();
  const [variableFeeLoading, setVariableFeeLoading] = useState(false);
  const [emailOptions, setEmailOptions] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);
  const [vehicles, setVehicles] = useState([]);

  // === Filter states ===
  const [searchText, setSearchText] = useState({
    sumaInvoiceId: "",
    status: [],
  });

  // Dịch trạng thái sang tiếng Việt
  const getStatusLabel = (status) => {
    switch (status) {
      case "SETTLED":
      case "PAID":
        return "Đã thanh toán";
      case "OPEN":
        return "Đang mở";
      case "OVERDUE":
        return "Quá hạn";
      default:
        return status;
    }
  };

  // === Fetch users ===
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await userApi.getAll();
      const usersData = Array.isArray(response) ? response : [];
      // Chỉ lấy những users có role là "USER"
      const filteredUsers = usersData.filter(user => 
        user.role === "USER" || user.role === "user"
      );
      setUsers(filteredUsers);
    } catch (error) {
      message.error("Không thể tải danh sách người dùng!");
      console.error("❌ [InvoiceDashboard] Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await vehiclesApi.getAllVehicles();
      const data = Array.isArray(res) ? res : res?.data ?? res?.content;
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      message.error("Không thể tải danh sách xe!");
      setVehicles([]);
    }
  };

  // === Fetch invoices ===
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const res = await invoiceApi.getAllSumaInvoices();
        if (Array.isArray(res)) {
          const formatted = res.map((sumaInv) => ({
            sumaInvoiceId: sumaInv.sumaInvoiceId,
            userName: sumaInv.userName,
            month: sumaInv.month,
            totalAmount: sumaInv.totalAmount,
            status: sumaInv.status,
            invoices: sumaInv.invoices || [],
            invoiceId: sumaInv.sumaInvoiceId,
            invoiceMonth: sumaInv.month,
            email: sumaInv.invoices?.[0]?.email || "",
            phone: sumaInv.invoices?.[0]?.phone || "",
            vehicleName: sumaInv.invoices?.[0]?.vehicleName || "",
            plateNumber: sumaInv.invoices?.[0]?.plateNumber || "",
            issuedDate: sumaInv.invoices?.[0]?.issuedDate
              ? new Date(...sumaInv.invoices[0].issuedDate.slice(0, 6))
              : new Date(),
            dueDate: sumaInv.invoices?.[0]?.dueDate
              ? new Date(...sumaInv.invoices[0].dueDate.slice(0, 6))
              : new Date(),
            note: `Tổng hợp hóa đơn tháng ${sumaInv.month}`,
            details:
              sumaInv.invoices?.map((inv, invIndex) => ({
                detailId: inv.invoiceId || invIndex,
                feeType: "Tổng hợp",
                sourceType: "Suma Invoice",
                description: `Hóa đơn ${inv.invoiceId || invIndex + 1}`,
                amount: inv.totalAmount || 0,
              })) || [],
          }));
          setInvoices(formatted);
        }
      } catch (err) {
        console.error("❌ [InvoiceManagement] Fetch suma invoices failed:", err);
        message.error("Không thể tải danh sách hóa đơn!");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  // const handleView = (record) => setSelectedInvoice(record);

  const handleDownloadPDF = async () => {
    try {
      const element = pdfRef.current;
      if (!element) {
        message.warning("Không tìm thấy nội dung để tải xuống!");
        return;
      }
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(`Invoice_SUMA-${selectedInvoice.sumaInvoiceId}.pdf`);
      message.success("Tải PDF thành công!");
    } catch (error) {
      console.error("Error downloading PDF:", error);
      message.error("Không thể tải PDF. Vui lòng thử lại!");
    }
  };

  // === Bulk invoice logic ===
  const handleUserSelection = (userId, checked) => {
    if (checked) setSelectedUserIds((prev) => [...prev, userId]);
    else setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleBulkCreateInvoice = async () => {
    if (selectedUserIds.length === 0) {
      message.warning("Vui lòng chọn ít nhất một người dùng!");
      return;
    }

    try {
      setCreating(true);
      const promises = selectedUserIds.map((userId) => {
        const user = users.find((u) => u.id === userId);
        return invoiceApi.createAutoInvoiceByEmail(user.email);
      });

      await Promise.all(promises);
      message.success(`Tạo hóa đơn thành công cho ${selectedUserIds.length} người dùng!`);
      setOpenBulkCreate(false);
      setSelectedUserIds([]);

      // refresh invoices
      try {
        const updated = await invoiceApi.getAllSumaInvoices();
        if (Array.isArray(updated)) {
          const formatted = updated.map((sumaInv) => ({
            sumaInvoiceId: sumaInv.sumaInvoiceId,
            userName: sumaInv.userName,
            month: sumaInv.month,
            totalAmount: sumaInv.totalAmount,
            status: sumaInv.status,
            invoices: sumaInv.invoices || [],
            invoiceId: sumaInv.sumaInvoiceId,
            invoiceMonth: sumaInv.month,
            email: sumaInv.invoices?.[0]?.email || "",
            phone: sumaInv.invoices?.[0]?.phone || "",
            vehicleName: sumaInv.invoices?.[0]?.vehicleName || "",
            plateNumber: sumaInv.invoices?.[0]?.plateNumber || "",
            issuedDate: sumaInv.invoices?.[0]?.issuedDate
              ? new Date(...sumaInv.invoices[0].issuedDate.slice(0, 6))
              : new Date(),
            dueDate: sumaInv.invoices?.[0]?.dueDate
              ? new Date(...sumaInv.invoices[0].dueDate.slice(0, 6))
              : new Date(),
            note: `Tổng hợp hóa đơn tháng ${sumaInv.month}`,
            details:
              sumaInv.invoices?.map((inv, invIndex) => ({
                detailId: inv.invoiceId || invIndex,
                feeType: "Tổng hợp",
                sourceType: "Suma Invoice",
                description: `Hóa đơn ${inv.invoiceId || invIndex + 1}`,
                amount: inv.totalAmount || 0,
              })) || [],
          }));
          setInvoices(formatted);
          message.success("Đã cập nhật danh sách hóa đơn!");
        }
      } catch (refreshError) {
        console.error("Error refreshing invoices:", refreshError);
        message.warning("Tạo hóa đơn thành công nhưng không thể cập nhật danh sách!");
      }
    } catch (error) {
      console.error("❌ [InvoiceDashboard] Bulk invoice creation failed:", error);
      message.error("Tạo hóa đơn hàng loạt thất bại!");
    } finally {
      setCreating(false);
    }
  };

  // === Variable Fee Invoice logic ===
  const handleCreateVariableFee = () => {
    variableFeeForm.resetFields();
    setVariableFeeModalVisible(true);
    setEmailOptions([]);
  };

  const handleVehicleChange = async (vehicleId) => {
    if (!vehicleId) {
      setEmailOptions([]);
      variableFeeForm.setFieldsValue({ email: undefined });
      return;
    }

    setLoadingEmails(true);
    try {
      const res = await ownerShipsApi.getMyGroupOwnership(vehicleId);
      const data = Array.isArray(res) ? res : res?.data || [];
      
      // Trích xuất userName từ danh sách ownership
      const userNames = data
        .map((item) => {
          const userName = item.userName || item.user?.userName;
          return userName;
        })
        .filter(userName => userName && userName.trim());
      
      // Tạo options cho Select
      const emailList = userNames.map(userName => ({
        label: userName,
        value: userName,
      }));
      
      setEmailOptions(emailList);
      
      // Tự động set email đầu tiên nếu có
      if (userNames.length > 0) {
        variableFeeForm.setFieldsValue({ email: userNames });
        message.success(`Đã tải ${userNames.length} người dùng sở hữu xe!`);
      } else {
        message.warning("Không tìm thấy người dùng nào sở hữu xe này!");
      }
    } catch (err) {
      console.error("Error fetching group ownership:", err);
      message.error("Không thể tải danh sách email!");
      setEmailOptions([]);
    } finally {
      setLoadingEmails(false);
    }
  };

  const handleCreateVariableFeeSubmit = async () => {
    try {
      const values = await variableFeeForm.validateFields();
      setVariableFeeLoading(true);

      const vehicleId = typeof values.vehicleId === 'string' ? parseInt(values.vehicleId, 10) : values.vehicleId;
      const emails = Array.isArray(values.email)
        ? values.email
        : [values.email.trim()];

      // Gửi song song tất cả email bằng Promise.all
      await Promise.all(
        emails.map(email => {
          const payload = {
            vehicleId,
            email,
            type: values.type,
            amount: Number(values.amount),
            description: values.description.trim(),
          };
          return feeApi.createVariableFee(payload);
        })
      );

      message.success(`Đã tạo hóa đơn phát sinh cho ${emails.length} người dùng!`);
      variableFeeForm.resetFields();
      setVariableFeeModalVisible(false);
      setEmailOptions([]);

      // Refresh invoices
      try {
        const updated = await invoiceApi.getAllSumaInvoices();
        if (Array.isArray(updated)) {
          const formatted = updated.map((sumaInv) => ({
            sumaInvoiceId: sumaInv.sumaInvoiceId,
            userName: sumaInv.userName,
            month: sumaInv.month,
            totalAmount: sumaInv.totalAmount,
            status: sumaInv.status,
            invoices: sumaInv.invoices || [],
            invoiceId: sumaInv.sumaInvoiceId,
            invoiceMonth: sumaInv.month,
            email: sumaInv.invoices?.[0]?.email || "",
            phone: sumaInv.invoices?.[0]?.phone || "",
            vehicleName: sumaInv.invoices?.[0]?.vehicleName || "",
            plateNumber: sumaInv.invoices?.[0]?.plateNumber || "",
            issuedDate: sumaInv.invoices?.[0]?.issuedDate
              ? new Date(...sumaInv.invoices[0].issuedDate.slice(0, 6))
              : new Date(),
            dueDate: sumaInv.invoices?.[0]?.dueDate
              ? new Date(...sumaInv.invoices[0].dueDate.slice(0, 6))
              : new Date(),
            note: `Tổng hợp hóa đơn tháng ${sumaInv.month}`,
            details:
              sumaInv.invoices?.map((inv, invIndex) => ({
                detailId: inv.invoiceId || invIndex,
                feeType: "Tổng hợp",
                sourceType: "Suma Invoice",
                description: `Hóa đơn ${inv.invoiceId || invIndex + 1}`,
                amount: inv.totalAmount || 0,
              })) || [],
          }));
          setInvoices(formatted);
          message.success("Đã cập nhật danh sách hóa đơn!");
        }
      } catch (refreshError) {
        console.error("Error refreshing invoices:", refreshError);
        message.warning("Tạo hóa đơn thành công nhưng không thể cập nhật danh sách!");
      }
    } catch (err) {
      if (err?.response?.status === 403) {
        message.error("Bạn không có quyền thực hiện thao tác này. Vui lòng đăng nhập lại với tài khoản ADMIN.");
      } else if (err?.response?.status === 401) {
        message.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        const serverMsg = err?.response?.data?.message ?? err?.message ?? "Không thể tạo hóa đơn phát sinh";
        message.error(serverMsg);
      }
    } finally {
      setVariableFeeLoading(false);
    }
  };

  // === Filter handlers ===
  const handleSearch = (key, value) => {
    setSearchText((prev) => ({ ...prev, [key]: value }));
  };

  // === Table columns ===
  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "sumaInvoiceId",
      key: "sumaInvoiceId",
      sorter: (a, b) => {
        const aId = String(a.sumaInvoiceId || "");
        const bId = String(b.sumaInvoiceId || "");
        return aId.localeCompare(bId, 'en', { numeric: true, sensitivity: 'base' });
      },
      render: (id) => `#SUMA-${id}`,
    },
    { title: "Người dùng", dataIndex: "userName" },
    { title: "Tháng", dataIndex: "invoiceMonth" },
    {
      title: "Tổng (₫)",
      dataIndex: "totalAmount",
      render: (val) => val.toLocaleString("vi-VN", { style: "currency", currency: "VND" }),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      filterDropdown: ({ setSelectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <div style={{ marginBottom: 8 }}>
            <Checkbox.Group
              options={[
                { label: "Đang mở", value: "OPEN" },
                { label: "Đã thanh toán", value: "SETTLED" },
                { label: "Quá hạn", value: "OVERDUE" },
              ]}
              value={searchText.status}
              onChange={(values) => {
                setSearchText((prev) => ({ ...prev, status: values }));
                setSelectedKeys(values);
              }}
            />
          </div>
          <Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <Button
              size="small"
              onClick={() => {
                clearFilters();
                handleSearch("status", []);
              }}
            >
              Reset
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => confirm()}
              icon={<SearchOutlined />}
            >
              Tìm
            </Button>
          </Space>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered || searchText.status?.length > 0 ? "#1890ff" : undefined }} />
      ),
      onFilter: (value, record) => {
        // Tính toán trạng thái thực tế của record (có thể là OVERDUE nếu OPEN và quá hạn)
        const isOverdue = record.status === "OPEN" && record.dueDate && dayjs(record.dueDate).isBefore(dayjs(), 'day');
        const isPaid = record.status === "SETTLED" || record.status === "PAID";
        
        // Xử lý filter theo giá trị được chọn
        if (value === "OVERDUE") {
          return isOverdue;
        } else if (value === "SETTLED") {
          return isPaid && !isOverdue;
        } else if (value === "OPEN") {
          return record.status === "OPEN" && !isOverdue;
        }
        
        return false;
      },
      filteredValue: searchText.status?.length > 0 ? searchText.status : null,
      render: (status, record) => {
        const isOverdue = status === "OPEN" && dayjs(record.dueDate).isBefore(dayjs());
        let color = "orange";
        let displayStatus = status;

        if (status === "SETTLED" || status === "PAID") {
          color = "green";
          displayStatus = "SETTLED";
        } else if (isOverdue) {
          color = "red";
          displayStatus = "OVERDUE";
        } else if (status === "OPEN") {
          displayStatus = "OPEN";
        }

        return <Tag color={color}>{getStatusLabel(displayStatus)}</Tag>;
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Button type="link" onClick={() => { setSelectedInvoice(record); setOpen(true); }}>
          Xem
        </Button>
      ),
    },
  ];

  const totalInvoices = invoices.length;
  const openInvoices = invoices.filter((i) => i.status === "OPEN").length;
  const paidInvoices = invoices.filter(
    (i) => i.status === "SETTLED" || i.status === "PAID"
  ).length;
  const totalAmount = invoices.reduce((sum, i) => sum + i.totalAmount, 0);

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Tổng hóa đơn" value={totalInvoices} prefix={<FileTextOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Đang mở" value={openInvoices} valueStyle={{ color: "#faad14" }} prefix={<ClockCircleOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Đã thanh toán" value={paidInvoices} valueStyle={{ color: "#3f8600" }} prefix={<CheckCircleOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card><Statistic title="Tổng tiền" value={totalAmount.toLocaleString("vi-VN")} valueStyle={{ color: "#1677ff" }} prefix={<DollarOutlined />} /></Card>
        </Col>
      </Row>

      <Card>
        <Row justify="end" style={{ marginBottom: 12 }}>
          <Space>
            <Button
              type="primary"
              icon={<FileAddOutlined />}
              loading={variableFeeLoading}
              onClick={handleCreateVariableFee}
            >
              Tạo hóa đơn phát sinh
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              loading={creating}
              onClick={() => setOpenBulkCreate(true)}
            >
              Tạo hóa đơn
            </Button>
          </Space>
        </Row>

        {loading ? (
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" tip="Đang tải danh sách hóa đơn..." />
          </div>
        ) : invoices.length === 0 ? (
          <Empty description="Không có hóa đơn nào" />
        ) : (
          <Table
            columns={columns}
            dataSource={invoices}
            rowKey="sumaInvoiceId"
            pagination={{ pageSize: 6 }}
          />
        )}
      </Card>

      {/* === Modal xem chi tiết === */}
      <Modal
        open={open}
        title={`Hóa đơn #SUMA-${selectedInvoice?.sumaInvoiceId || ""}`}
        onCancel={() => setOpen(false)}
        width={1000}
        footer={[
          <Button key="close" onClick={() => setOpen(false)}>Đóng</Button>,
          <Button key="download" type="primary" icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
            Tải PDF
          </Button>,
        ]}
      >
        {selectedInvoice && (
          <MonthInvoice ref={pdfRef} selectedMonth={selectedInvoice} />
        )}
      </Modal>


      {/* === Modal tạo hóa đơn hàng loạt === */}
      <Modal
        title="Tạo hóa đơn hàng loạt"
        open={openBulkCreate}
        onCancel={() => { setOpenBulkCreate(false); setSelectedUserIds([]); }}
        onOk={handleBulkCreateInvoice}
        okText="Tạo hóa đơn"
        cancelText="Hủy"
        confirmLoading={creating}
        width={800}
      >
        {loadingUsers ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <Spin tip="Đang tải danh sách người dùng..." />
          </div>
        ) : users.length === 0 ? (
          <Empty description="Không có người dùng nào" />
        ) : (
          <>
            <p><strong>Chọn người dùng để tạo hóa đơn:</strong></p>
            <p style={{ color: "#666" }}>Đã chọn {selectedUserIds.length} người dùng</p>
            <div style={{ maxHeight: 400, overflowY: "auto", border: "1px solid #ddd", borderRadius: 6, padding: 8 }}>
              {users.map((user) => (
                <div key={user.id} style={{ display: "flex", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <Checkbox
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                    style={{ marginRight: 12 }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{user.fullName || user.full_name}</div>
                    <div style={{ color: "#666", fontSize: 12 }}>{user.email} | {user.phone}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, textAlign: "right" }}>
              <Button onClick={() => setSelectedUserIds(users.map((u) => u.id))} style={{ marginRight: 8 }}>
                Chọn tất cả
              </Button>
              <Button onClick={() => setSelectedUserIds([])}>Bỏ chọn tất cả</Button>
            </div>
          </>
        )}
      </Modal>

      {/* === Modal tạo hóa đơn phát sinh === */}
      <Modal
        open={variableFeeModalVisible}
        title="Tạo Hóa Đơn Phát Sinh"
        onOk={handleCreateVariableFeeSubmit}
        onCancel={() => {
          setVariableFeeModalVisible(false);
          variableFeeForm.resetFields();
          setEmailOptions([]);
        }}
        okText="Tạo"
        cancelText="Hủy"
        confirmLoading={variableFeeLoading}
        destroyOnClose
        width={600}
      >
        <Form form={variableFeeForm} layout="vertical">
          <Form.Item
            name="vehicleId"
            label="Chọn Xe"
            rules={[{ required: true, message: "Vui lòng chọn xe!" }]}
          >
            <Select
              placeholder="Chọn xe"
              showSearch
              onChange={handleVehicleChange}
              optionFilterProp="children"
            >
              {vehicles.map((v) => (
                <Select.Option key={v.vehicleId || v.id} value={v.vehicleId || v.id}>
                  {v.brand} {v.model} ({v.licensePlate || v.plateNumber || v.plate || "N/A"})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng chọn ít nhất một email!" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder={loadingEmails ? "Đang tải danh sách email..." : "Chọn email người dùng"}
              options={emailOptions}
              loading={loadingEmails}
              notFoundContent={loadingEmails ? "Đang tải..." : "Không có email nào"}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="type"
            label="Loại phí phát sinh"
            initialValue={VARIABLE_FEE_TYPES[0]}
            rules={[{ required: true, message: "Vui lòng chọn loại phí!" }]}
          >
            <Select placeholder="Chọn loại phí phát sinh">
              {VARIABLE_FEE_TYPES.map((feeType) => (
                <Select.Option key={feeType} value={feeType}>
                  {VARIABLE_FEE_TYPE_LABELS[feeType] || feeType}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền"
            rules={[
              { required: true, message: "Vui lòng nhập số tiền!" },
              { type: 'number', min: 0, message: "Số tiền phải lớn hơn 0!" }
            ]}
          >
            <InputNumber
              min={0}
              placeholder="Nhập số tiền"
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả!" }]}
          >
            <Input.TextArea rows={3} placeholder="Nhập mô tả hóa đơn phát sinh" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminInvoiceDashboard;