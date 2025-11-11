import React, { useEffect, useState } from "react";
import {
  Card,
  Tag,
  Space,
  Typography,
  Spin,
  Select,
  Row,
  Col,
  Button,
  Empty,
  Image,
} from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  SwapOutlined,
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


  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filteredContracts, setFilteredContracts] = useState([]);

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
      setFilteredContracts(contractsData);
    } catch (error) {
      console.error("❌ Error fetching co-owner contracts:", error);
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
      case "ACTIVE":
        return (
          <Tag color="green" icon={<CheckCircleOutlined />}>
            Đã duyệt
          </Tag>
        );
      case "TRANSFERRED":
        return (
          <Tag color="cyan" icon={<SwapOutlined />}>
            Hoàn tất
          </Tag>
        );
      default:
        return <Tag>Không rõ</Tag>;
    }
  };

  const handleViewDetail = (contract) => {
    setSelectedContract(contract);
    setModalVisible(true);
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setFilteredContracts(
      value === "ALL" ? contracts : contracts.filter((c) => c.status === value)
    );
  };

  return (
    <div>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginTop: 24,
          marginBottom: 16,
        }}
      >
        <Select
          value={filterStatus}
          onChange={handleFilterChange}
          style={{ width: 200 }}
        >
          <Option value="ALL">Tất cả trạng thái</Option>
          <Option value="ACTIVE">Đang sở hữu cổ phần</Option>
          <Option value="TRANSFERRED">Đã chuyển nhượng</Option>
        </Select>
      </Space>

      {loading ? (
        <Spin />
      ) : filteredContracts.length === 0 ? (
        <Empty description="Không có hợp đồng nào" />
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {filteredContracts.map((contract) => (
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
