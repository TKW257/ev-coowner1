import { useEffect, useState } from "react";
import { App } from "antd";
import { Form, Input, Button, Upload, Row, Col, Typography, Card, Divider, Alert } from "antd";
import { UploadOutlined, UserOutlined } from "@ant-design/icons";
import userApi from "../../api/userApi";

const { Title, Text } = Typography;

const ProfileForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [cccdPreview, setCccdPreview] = useState(null);
  const [gplxPreview, setGplxPreview] = useState(null);
  const [cccdFile, setCccdFile] = useState(null);
  const [gplxFile, setGplxFile] = useState(null);
  const { notification } = App.useApp();

  const [cccdOldUrl, setCccdOldUrl] = useState(null);
  const [gplxOldUrl, setGplxOldUrl] = useState(null);

  const [verifyStatus, setVerifyStatus] = useState(null);
  const [verifyNote, setVerifyNote] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await userApi.getProfile();
        console.log("🔹 Profile API response:", res);

        form.setFieldsValue({
          id: res.id,
          fullName: res.fullName,
          email: res.email,
          phone: res.phone,
          cccd: res.cccd,
          gplx: res.gplx,
        });

        const base = "https://vallate-enzootically-sterling.ngrok-free.dev/";

        if (res.cccdImagePath) {
          const fixedPath = res.cccdImagePath.replace(/\\/g, "/");
          const fullCccdUrl = `${base}${fixedPath}`;
          setCccdPreview(fullCccdUrl);
          setCccdOldUrl(fullCccdUrl);
        }

        if (res.gplxImagePath) {
          const fixedPath = res.gplxImagePath.replace(/\\/g, "/");
          const fullGplxUrl = `${base}${fixedPath}`;
          setGplxPreview(fullGplxUrl);
          setGplxOldUrl(fullGplxUrl);
        }

        setVerifyStatus(res.verifyStatus);
        setVerifyNote(res.verifyNote);
      } catch (err) {
        console.error("❌ Lỗi khi lấy profile:", err);
      }
    };

    fetchProfile();
  }, [form]);

  const handleUpdate = async (values) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("fullName", values.fullName || "");
      formData.append("phone", values.phone || "");
      formData.append("cccd", values.cccd || "");
      formData.append("gplx", values.gplx || "");

      if (cccdFile) formData.append("cccdFile", cccdFile);
      else if (cccdOldUrl) formData.append("cccdUrl", cccdOldUrl);

      if (gplxFile) formData.append("gplxFile", gplxFile);
      else if (gplxOldUrl) formData.append("gplxUrl", gplxOldUrl);

      await userApi.uploadDocuments(values.id, formData);

      notification.success({
        message: "🎉 Cập nhật thành công",
        description: "Thông tin cá nhân và tài liệu của bạn đã được cập nhật.",
        placement: "topRight",
      });
    } catch (err) {
      console.error("Upload tài liệu thất bại:", err);

      notification.error({
        message: "❌ Cập nhật thất bại",
        description: "Không thể tải lên thông tin hoặc tài liệu. Vui lòng thử lại sau.",
        placement: "topRight",
      });
    } finally {
      setLoading(false);
    }
  };


  const handlePreview = (file, setPreview, setFile) => {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
    setFile(file);
  };

  const getAlertType = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "REJECTED":
        return "error";
      case "PENDING":
        return "warning";
      default:
        return "info";
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "24px",
      }}
    >
      <Card
        style={{
          width: "100%",
          maxWidth: 900,
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          padding: "32px",
        }}
      >
        <Row gutter={32} align="middle">
          <Col span={8} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                backgroundColor: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
                marginBottom: 16,
              }}
            >
              <UserOutlined style={{ fontSize: 50, color: "#52c41a" }} />
            </div>
            <Title level={4} style={{ marginBottom: 4 }}>
              {form.getFieldValue("fullName") || "Họ tên người dùng"}
            </Title>
            <Text type="secondary">
              {form.getFieldValue("email") || "email@example.com"}
            </Text>
          </Col>

          <Col span={16}>
            <Title level={4}>Thông tin cá nhân</Title>
            <Divider />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              initialValues={{ remember: true }}
            >
              <Form.Item name="id" hidden>
                <Input />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Họ và Tên"
                    name="fullName"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                  >
                    <Input size="large" placeholder="Nhập họ tên" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Email" name="email">
                    <Input
                      size="large"
                      readOnly
                      style={{
                        background: "#f1f3f5",
                        cursor: "not-allowed",
                      }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  {/* Số điện thoại */}
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      { required: true, message: "Vui lòng nhập số điện thoại!" },
                      {
                        pattern: /^(0[3|5|7|8|9])[0-9]{8}$/,
                        message: "Số điện thoại không hợp lệ! (VD: 0981234567)",
                      },
                    ]}
                  >
                    <Input size="large" placeholder="Nhập số điện thoại (VD: 0981234567)" />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  {/* CCCD */}
                  <Form.Item
                    label="Căn cước công dân"
                    name="cccd"
                    rules={[
                      { required: true, message: "Vui lòng nhập số CCCD!" },
                      {
                        pattern: /^[0-9]{12}$/,
                        message: "CCCD phải gồm đúng 12 chữ số!",
                      },
                    ]}
                  >
                    <Input size="large" placeholder="Nhập số CCCD (12 số)" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  {/* GPLX */}
                  <Form.Item
                    label="Bằng lái xe"
                    name="gplx"
                    rules={[
                      { required: true, message: "Vui lòng nhập số GPLX!" },
                      {
                        pattern: /^[A-Z0-9]{10,12}$/,
                        message: "GPLX phải gồm 10–12 ký tự chữ và số (VD: 790123456789)",
                      },
                    ]}
                  >
                    <Input size="large" placeholder="Nhập số GPLX (10–12 ký tự)" />
                  </Form.Item>
                </Col>
              </Row>


              <div style={{ textAlign: "right", marginTop: 16 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  style={{
                    backgroundColor: "#52c41a",
                    borderColor: "#52c41a",
                    borderRadius: "8px",
                    padding: "0 40px",
                  }}
                >
                  Cập Nhật
                </Button>
              </div>
            </Form>
          </Col>
        </Row>
      </Card>

      <Card
        style={{
          width: "100%",
          maxWidth: 900,
          borderRadius: 16,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          padding: "32px",
        }}
      >
        <Title level={4} style={{ marginBottom: 24 }}>
          Upload Hình Ảnh CCCD & GPLX
        </Title>

        {verifyStatus && (
          <Row style={{ marginBottom: 24 }}>
            <Col span={24}>
              <Alert
                type={getAlertType(verifyStatus)} 
                showIcon
                style={{ borderRadius: 8, padding: 12 }}
                message={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      justifyContent: "space-between",
                      width: "100%",
                      flexWrap: "nowrap",
                    }}
                  >

                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <strong>Trạng thái xác minh:</strong>
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            verifyStatus === "APPROVED"
                              ? "#237804"
                              : verifyStatus === "REJECTED"
                                ? "#cf1322"
                                : verifyStatus === "PENDING"
                                  ? "#faad14"
                                  : "#8c8c8c",
                        }}
                      >
                        {verifyStatus}
                      </span>
                    </div>


                    <div style={{ marginLeft: 16, textAlign: "right", flex: 1 }}>
                      <strong>Ghi chú:</strong>{" "}
                      <span style={{ color: "#595959", marginLeft: 8 }}>
                        {verifyNote || "Không có ghi chú từ quản trị viên"}
                      </span>
                    </div>
                  </div>
                }
              />
            </Col>
          </Row>
        )}

        <Row gutter={32}>
          <Col span={12} style={{ textAlign: "center" }}>
            <div
              style={{
                border: "2px dashed #d9d9d9",
                borderRadius: 12,
                padding: 16,
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {cccdPreview ? (
                <img
                  src={cccdPreview}
                  alt="CCCD Preview"
                  style={{
                    width: "100%",
                    maxHeight: 180,
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <Text type="secondary">Chưa có ảnh CCCD</Text>
              )}
            </div>
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                handlePreview(file, setCccdPreview, setCccdFile);
                return false;
              }}
            >
              <Button
                icon={<UploadOutlined />}
                style={{
                  marginTop: 12,
                  background: "#52c41a",
                  color: "#fff",
                  borderRadius: 8,
                }}
              >
                Upload CCCD
              </Button>
            </Upload>
          </Col>

          <Col span={12} style={{ textAlign: "center" }}>
            <div
              style={{
                border: "2px dashed #d9d9d9",
                borderRadius: 12,
                padding: 16,
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {gplxPreview ? (
                <img
                  src={gplxPreview}
                  alt="GPLX Preview"
                  style={{
                    width: "100%",
                    maxHeight: 180,
                    objectFit: "contain",
                    borderRadius: 8,
                  }}
                />
              ) : (
                <Text type="secondary">Chưa có ảnh GPLX</Text>
              )}
            </div>
            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                handlePreview(file, setGplxPreview, setGplxFile);
                return false;
              }}
            >
              <Button
                icon={<UploadOutlined />}
                style={{
                  marginTop: 12,
                  background: "#52c41a",
                  color: "#fff",
                  borderRadius: 8,
                }}
              >
                Upload GPLX
              </Button>
            </Upload>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default ProfileForm;