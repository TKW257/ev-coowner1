import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Tag, Typography, Button, Statistic, Modal, Table, Spin } from "antd";
import { ThunderboltOutlined, DollarOutlined, CalendarOutlined, DashboardOutlined, PercentageOutlined, CarOutlined, TeamOutlined } from "@ant-design/icons";
import ownerShipsApi from "../../../api/ownerShipsApi";
import "./style.scss";

const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

const { Title, Text } = Typography;

const MyCars = () => {
  const [carsObj, setCarsObj] = useState({});
  const [currentCarId, setCurrentCarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [groupData, setGroupData] = useState([]);
  const navigate = useNavigate();
  const chosenCar = currentCarId ? carsObj[String(currentCarId)] : null;

  const totalMembers = groupData.length;
  const totalPercentage = groupData.reduce(
    (sum, item) => sum + (item.totalSharePercentage || 0),
    0
  );

  useEffect(() => {
    const fetchMyVehicles = async () => {
      try {
        const res = await ownerShipsApi.getMyVehicles();

        const vehiclesArray = Array.isArray(res) ? res : res.data || [];
        console.log("🟢 Vehicles array:", vehiclesArray);

        const vehiclesMap = {};
        vehiclesArray.forEach((v) => {
          vehiclesMap[String(v.vehicleId)] = v;
        });

        setCarsObj(vehiclesMap);

        if (vehiclesArray.length > 0) {
          setCurrentCarId(vehiclesArray[0].vehicleId);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải danh sách xe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyVehicles();
  }, []);

  const handleBook = (car) => {
    setCurrentCarId(car.vehicleId);
    navigate(`/owner/carbooking/${car.vehicleId}`);
  };

  // get group của tôi 
  const handleOpenGroupModal = async (car) => {
    setGroupModalVisible(true);
    setGroupLoading(true);
    try {
      const res = await ownerShipsApi.getMyGroupOwnership(car.vehicleId);
      const data = Array.isArray(res) ? res : res.data || [];
      setGroupData(data);
    } catch (err) {
      console.error("❌ Lỗi khi tải nhóm sở hữu:", err);
    } finally {
      setGroupLoading(false);
    }
  };

  const handleChangeCar = (id) => {
    if (id === currentCarId) return;
    setFade(true);
    setTimeout(() => {
      setCurrentCarId(id);
      setFade(false);
    }, 300);
  };

  const getCarImageUrl = (imagePath) => {
    if (!imagePath) return ""; // fallback
    return `${baseURL}/${imagePath.replaceAll("\\", "/")}`;
  };

  const columns = [
    {
      title: "Thành viên",
      dataIndex: "userName",
      key: "userName",
    },
    {
      title: "Tỷ lệ sở hữu (%)",
      dataIndex: "totalSharePercentage",
      key: "totalSharePercentage",
      render: (v) => `${v}%`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (v) => (
        <Tag
          color={
            v?.toLowerCase() === "active"
              ? "green"
              : v?.toLowerCase() === "inactive"
                ? "default"
                : "blue"
          }
        >
          {v}
        </Tag>
      ),
    },
    {
      title: "Ngày tham gia",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => {
        if (Array.isArray(v)) {
          const [year, month, day, hour = 0, minute = 0, second = 0] = v;
          const date = new Date(year, month - 1, day, hour, minute, second);
          return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });
        }
        if (typeof v === "string" || v instanceof Date) {
          return new Date(v).toLocaleDateString("vi-VN");
        }
        return "-";
      },
    }
  ];



  if (!loading && Object.keys(carsObj).length === 0) {
    return (
      <div style={{ height: "calc(100vh - 120px)", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb", padding: "24px" }}>
        <div
          style={{ background: "#fff", borderRadius: "20px", padding: "50px 60px", textAlign: "center", boxShadow: "0 8px 30px rgba(0,0,0,0.08)", maxWidth: "480px", width: "100%", transition: "all 0.3s ease" }}
          onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.12)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)"; }}
        >
          <div style={{ background: "rgba(82,196,26,0.1)", width: "100px", height: "100px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto", animation: "fadeIn 0.8s ease" }}>
            <CarOutlined style={{ fontSize: 72, color: "#52c41a" }} />
          </div>

          <p style={{ color: "#666", fontSize: "1rem", marginBottom: "24px", lineHeight: 1.6 }}>
            Hãy thêm chiếc xe đầu tiên để bắt đầu quản lý và theo dõi hành trình của bạn.
          </p>

          <Button
            type="primary"
            size="large"
            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a", borderRadius: "10px", padding: "10px 26px", fontWeight: 500, fontSize: "1rem", transition: "all 0.3s ease" }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#73d13d"; e.currentTarget.style.borderColor = "#73d13d"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(82,196,26,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#52c41a"; e.currentTarget.style.borderColor = "#52c41a"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
          >
            <i className="ri-add-line" style={{ marginRight: "6px" }} /> Thêm xe ngay
          </Button>
        </div>
      </div>
    );
  }

  console.log("🟢 currentCarId:", currentCarId, "chosenCar:", chosenCar);

  return (
    <div className="mycars-root">
      {chosenCar && (
        <div className={`chosen-car ${fade ? "fade-out" : "fade-in"}`}>

          {/* Image & overlay */}
          <div className="image-wrap">
            <img src={getCarImageUrl(chosenCar.imageUrl)} alt={chosenCar.model} />
            <div className="overlay">
              <div className="left">
                <Title level={3} className="car-name">
                  {chosenCar.brand} {chosenCar.model}
                </Title>
                <Text className="plate">
                  Biển số xe: {chosenCar.plateNumber}
                </Text>
                <Text className="plate">
                  Năm sản xuất: {chosenCar.year}
                </Text>
                <div>
                  <Tag
                    color={
                      chosenCar.vehicleStatus?.toLowerCase() === "available"
                        ? "green"
                        : chosenCar.vehicleStatus?.toLowerCase() === "rented"
                          ? "blue"
                          : chosenCar.vehicleStatus?.toLowerCase() === "maintenance"
                            ? "red"
                            : "default"
                    }
                  >
                    {chosenCar.vehicleStatus}
                  </Tag>
                </div>
              </div>

              <div className="right">
                <div className="buttons-row" style={{ marginBottom: "20px" }}>
                  <Button
                    className="btn-book"
                    type="primary"
                    icon={<CalendarOutlined />}
                    onClick={() => handleBook(chosenCar)}
                    disabled={chosenCar.vehicleStatus.toLowerCase() !== "available"}
                  >
                    Đặt Lịch
                  </Button>
                </div>

                <div className="buttons-row">
                  <Button
                    className="btn-group"
                    icon={<TeamOutlined />}
                    onClick={() => handleOpenGroupModal(chosenCar)}
                  >
                    Nhóm Của Tôi
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Modal nhóm sở hữu */}
          <Modal
            title={
              chosenCar
                ? `Nhóm sở hữu - ${chosenCar.brand} ${chosenCar.model}`
                : "Nhóm sở hữu"
            }
            open={groupModalVisible}
            onCancel={() => setGroupModalVisible(false)}
            footer={null}
            width={700}
          >
            {groupLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Spin size="large" />
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "16px",
                    padding: "12px 16px",
                    background: "#f5f5f5",
                    borderRadius: "8px",
                  }}
                >
                  <Text strong>
                    <TeamOutlined style={{ marginRight: 8 }} />
                    Tổng số thành viên:{" "}
                    <span style={{ color: "#1890ff" }}>{totalMembers}</span>
                  </Text>
                  <Text strong>
                    Tổng tỷ lệ sở hữu:{" "}
                    <span style={{ color: totalPercentage === 100 ? "#52c41a" : "#faad14" }}>
                      {totalPercentage}%
                    </span>
                  </Text>
                </div>
                <Table
                  dataSource={groupData}
                  columns={columns}
                  rowKey="ownershipId"
                  pagination={false}
                />
              </>
            )}
          </Modal>


          {/* Specs */}
          <div className="specs-row">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Dung lượng pin"
                  value={chosenCar.batteryCapacityKwh}
                  suffix="kWh"
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Phí sac mỗi kWh"
                  value={chosenCar.feeChargingPerKwh}
                  suffix="₫"
                  prefix={<DollarOutlined />}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Phí vượt quá số km giới hạn"
                  value={chosenCar.feeOverKm}
                  suffix="₫"
                  prefix={<DollarOutlined />}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Phí vận hành mỗi tháng"
                  value={chosenCar.operationPerM}
                  suffix="₫"
                  prefix={<DollarOutlined />}
                  valueStyle={{ fontSize: 20 }}
                />
              </Col>
            </Row>
          </div>

          {/* Ownership */}
          <div className="ownership-row ownership-row--fixed">
            <Row align="middle" gutter={[16, 16]}>
              <Col xs={12} sm={6} md={6}>
                <div className="ownership-block">
                  <div className="ownership-title">Số km đã dùng / tháng</div>
                  <div className="ownership-value">
                    <Statistic
                      value={`${chosenCar.usedKmThisMonth} / ${chosenCar.allowedKmThisMonth}`}
                      prefix={<DashboardOutlined />}
                      valueStyle={{ fontSize: 18 }}
                    />
                  </div>
                </div>
              </Col>

              <Col xs={12} sm={6} md={6}>
                <div className="ownership-block">
                  <div className="ownership-title">Số ngày đã dùng / tháng</div>
                  <div className="ownership-value">
                    <Statistic
                      value={`${chosenCar.usedDaysThisMonth} / ${chosenCar.allowedDaysThisMonth}`}
                      prefix={<CalendarOutlined />}
                      valueStyle={{ fontSize: 18 }}
                    />
                  </div>
                </div>
              </Col>

              <Col xs={12} sm={6} md={6}>
                <div className="ownership-block">
                  <div className="ownership-title">Tỷ lệ sở hữu của bạn</div>
                  <div className="ownership-value percent-style">
                    <span className="pct-number">
                      {chosenCar.totalSharePercentage}
                    </span>
                    / 100  <PercentageOutlined />
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      )}

      {/* Car List */}
      <div className="car-list">
        <Row gutter={[16, 16]}>

          {Object.values(carsObj).map((car) => (
            <Col key={car.vehicleId} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                onClick={() => handleChangeCar(car.vehicleId)}
                className={`mini-card ${car.vehicleId === currentCarId ? "active" : ""
                  }`}
                cover={
                  <div className="mini-card-cover">
                    <img src={getCarImageUrl(car.imageUrl)} alt={car.model} />

                    <div className="overlay">
                      <div className="mini-title">
                        {car.brand} {car.model}
                      </div>
                      <div className="mini-tags">
                        <Tag
                          color={
                            chosenCar.vehicleStatus?.toLowerCase() === "available"
                              ? "green"
                              : chosenCar.vehicleStatus?.toLowerCase() === "rented"
                                ? "blue"
                                : chosenCar.vehicleStatus?.toLowerCase() === "maintenance"
                                  ? "red"
                                  : "default"
                          }
                        >
                          {car.vehicleStatus}
                        </Tag>
                        {car.vehicleId === currentCarId && (
                          <Tag color="geekblue">Đang chọn</Tag>
                        )}
                      </div>
                    </div>
                  </div>
                }
              />
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default MyCars;
