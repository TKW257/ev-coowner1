import React, { useEffect, useState } from "react";
import {
  Card,
  Tag,
  Space,
  Typography,
  Spin,
  message,
  Row,
  Col,
  Button,
  Empty,
  Image,
  Modal,
  Descriptions,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import OwnerContractApi from "../../../api/owner-contractsApi";
import OwnerContract from "../../../components/ContractOwner";

const { Title, Text } = Typography;
const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

const MyCoOwnerContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // 🧩 Fetch contracts
  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await OwnerContractApi.getMyContracts();
      const data = response?.data || response;
      let contractsData = [];

      if (Array.isArray(data)) contractsData = data;
      else if (Array.isArray(data?.content)) contractsData = data.content;
      else if (data) contractsData = [data];

      setContracts(contractsData);

      if (contractsData.length === 0)
        message.info("Danh sách hợp đồng đồng sở hữu trống");
    } catch (error) {
      console.error("❌ Error fetching co-owner contracts:", error);
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        "Không tải được danh sách hợp đồng đồng sở hữu!";
      message.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  // 🧩 Định dạng LocalDateTime
  const formatDateTime = (arr) => {
    if (!arr || arr.length < 3) return "N/A";
    const [y, m, d, h = 0, min = 0, s = 0] = arr;
    const date = new Date(y, m - 1, d, h, min, s);
    return date.toLocaleString("vi-VN");
  };

  // 🧩 Hiển thị trạng thái
  const getStatusTag = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Đã duyệt
          </Tag>
        );
      case "COMPLETED":
        return (
          <Tag color="cyan" icon={<CheckCircleOutlined />}>
            Hoàn tất
          </Tag>
        );
      case "CANCELLED":
        return (
          <Tag color="red" icon={<CloseCircleOutlined />}>
            Đã hủy
          </Tag>
        );
      default:
        return (
          <Tag color="orange" icon={<ClockCircleOutlined />}>
            Đang chờ
          </Tag>
        );
    }
  };

  const handleViewDetail = (contract) => {
    setSelectedContract(contract);
    setModalVisible(true);
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 40 }}>
      </Title>

      {loading ? (
        <Spin tip="Đang tải dữ liệu..." />
      ) : contracts.length === 0 ? (
        <Empty description="Không có hợp đồng nào" />
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {contracts.map((contract) => (
            <Card
              key={contract.ownerContractId}
              hoverable
              style={{
                borderRadius: 12,
                boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                marginBottom: 16,
                overflow: "hidden",
              }}
            >
              <Row gutter={16} align="middle">
                {/* Ảnh xe */}
                <Col
                  xs={24}
                  md={6}
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <Image
                    preview={false}
                    width={250}
                    height={140}
                    src={`${baseURL}/${contract.vehicle?.imageUrl?.replace(/\\/g, "/")}`}
                    style={{
                      objectFit: "cover",
                      borderRadius: 10,
                      border: "1px solid #f0f0f0",
                    }}
                    fallback="https://via.placeholder.com/220x140?text=No+Image"
                  />
                </Col>

                {/* Thông tin hợp đồng */}
                <Col xs={24} md={12}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary">
                      Mã hợp đồng: #{contract.ownerContractId}
                    </Text>
                    <Title level={5} style={{ margin: 0 }}>
                      {contract.vehicle?.brand} - {contract.vehicle?.model}
                    </Title>
                    <Text>
                      Phần trăm sở hữu: {contract.sharePercentage ?? 0}%
                    </Text>
                    {getStatusTag(contract.contractStatus)}
                  </Space>
                </Col>

                {/* Ngày & nút */}
                <Col
                  xs={24}
                  md={6}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: 140,
                  }}
                >
                  <Text
                    type="secondary"
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      fontSize: 13,
                    }}
                  >
                    Ngày tạo: {formatDateTime(contract.createdAt)}
                  </Text>

                  {/* Nút xem chi tiết */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "flex-end",
                      height: "100%",
                    }}
                  >
                    <Button
                      type="primary"
                      icon={<FileTextOutlined />}
                      onClick={() => handleViewDetail(contract)}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card>
          ))}
        </Space>
      )}

      {/* Modal Chi tiết hợp đồng */}
      <OwnerContract
        contract={selectedContract}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        baseURL={baseURL}
      />
    </div>
  );
};

export default MyCoOwnerContracts;
