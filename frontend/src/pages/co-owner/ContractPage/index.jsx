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
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import contractApi from "../../../api/contractApi";
import Contract from "../../../components/Contract";

const { Title, Text } = Typography;
const { Option } = Select;
const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

const MyContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [filteredContracts, setFilteredContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedContract, setSelectedContract] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const response = await contractApi.getMyContracts();
      let contractsData = [];
      if (Array.isArray(response)) contractsData = response;
      else if (response?.data && Array.isArray(response.data))
        contractsData = response.data;
      else if (response?.content && Array.isArray(response.content))
        contractsData = response.content;

      setContracts(contractsData);
      setFilteredContracts(contractsData);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const formatDate = (arr) => {
    if (!arr || arr.length < 3) return "N/A";
    const [y, m, d] = arr;
    return `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y}`;
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "APPROVED":
        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>;
      case "COMPLETED":
        return <Tag color="cyan" icon={<CheckCircleOutlined />}>Hoàn tất</Tag>;
      case "PENDING":
        return <Tag color="orange" icon={<ClockCircleOutlined />}>Đang chờ</Tag>;
      case "EXPIRED":
        return <Tag color="red" icon={<ExclamationCircleOutlined />}>Hết hạn</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const handleFilterChange = (value) => {
    setFilterStatus(value);
    setFilteredContracts(
      value === "ALL" ? contracts : contracts.filter((c) => c.status === value)
    );
  };

  const handleViewDetail = (contract) => {
    setSelectedContract(contract);
    setModalVisible(true);
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
          <Option value="PENDING">Đang chờ duyệt</Option>
          <Option value="APPROVED">Đã duyệt</Option>
          <Option value="COMPLETED">Hoàn tất</Option>
          <Option value="EXPIRED">Hết hạn</Option>
        </Select>
      </Space>

      {loading ? (
        <Spin/>
      ) : filteredContracts.length === 0 ? (
        <Empty description="Không có hợp đồng nào" />
      ) : (
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          {filteredContracts.map((contract) => (
            <Card
              key={contract.contractId}
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
                    <Text type="secondary">Mã hợp đồng: #{contract.contractId}</Text>
                    <Title level={5} style={{ margin: 0 }}>
                      {contract.vehicle?.brand} - {contract.vehicle?.model}
                    </Title>
                    <Text>
                      {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                    </Text>
                    {getStatusTag(contract.status)}
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
                    Ngày lập: {formatDate(contract.createdAt)}
                  </Text>

                  {/* Nút xem chi tiết - góc phải dưới */}
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
      <Contract
        contract={selectedContract}
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        baseURL={baseURL}
      />
    </div>
  );
};

export default MyContracts;
