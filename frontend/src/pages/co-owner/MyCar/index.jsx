import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Row, Col, Tag, Typography, Button, Empty, Statistic } from "antd";
import { ThunderboltOutlined, EyeOutlined, LikeOutlined, DollarOutlined, CalendarOutlined, DashboardOutlined, PercentageOutlined, CarOutlined } from "@ant-design/icons";
import ownerShipsApi from "../../../api/ownerShipsApi";
import "./style.scss";

const { Title, Text } = Typography;

const MyCars = () => {
  const [carsObj, setCarsObj] = useState({}); // vehicleId (string) => car
  const [currentCarId, setCurrentCarId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fade, setFade] = useState(false);
  const navigate = useNavigate();

  // Convert currentCarId to string to match key
  const chosenCar = currentCarId ? carsObj[String(currentCarId)] : null;

  useEffect(() => {
    const fetchMyVehicles = async () => {
      try {
        console.log("🟢 Fetching my vehicles...");
        const res = await ownerShipsApi.getMyVehicles();
        console.log("🟢 Axios res:", res);

        // Axios trả data dạng array trực tiếp hoặc trong res.data
        const vehiclesArray = Array.isArray(res) ? res : res.data || [];
        console.log("🟢 Vehicles array:", vehiclesArray);

        // Chuyển sang object với key = string vehicleId
        const vehiclesMap = {};
        vehiclesArray.forEach(v => {
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

  const handleChangeCar = (id) => {
    if (id === currentCarId) return;
    setFade(true);
    setTimeout(() => {
      setCurrentCarId(id);
      setFade(false);
    }, 300);
  };

  if (!loading && Object.keys(carsObj).length === 0) {
    return (
      <div className="mycar-empty">
        <Empty description="Bạn chưa sở hữu chiếc xe nào" />
        <Button type="primary" className="add-btn">
          Thêm xe ngay
        </Button>
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
            <img src={chosenCar.imageUrl} alt={chosenCar.model} />
            <div className="overlay">
              <div className="left">
                <Title level={3} className="car-name">
                  {chosenCar.brand} {chosenCar.model}
                </Title>
                <Text className="plate">Biển số xe: {chosenCar.plateNumber}</Text>
                <div className="status-tag">
                  <Tag
                    color={chosenCar.vehicleStatus?.toLowerCase() === "available" ? "green" : "orange"}
                  >
                    {chosenCar.vehicleStatus}
                  </Tag>
                </div>
              </div>

              <div className="right">
                <div className="buttons-row">
                  <Button
                    type="primary"
                    icon={<CalendarOutlined />}
                    onClick={() => handleBook(chosenCar)}
                    disabled={chosenCar.vehicleStatus.toLowerCase() !== "available"}
                  >
                    Booking
                  </Button>

                  <Button icon={<LikeOutlined />}>Voting</Button>
                  <Button icon={<EyeOutlined />}>View Detail</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="specs-row">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Statistic title="Năm SX" value={chosenCar.year} prefix={<CalendarOutlined />} valueStyle={{ fontSize: 20 }} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="Dung lượng pin" value={chosenCar.batteryCapacityKwh} suffix="kWh" prefix={<ThunderboltOutlined />} valueStyle={{ fontSize: 20 }} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="Chi phí / km" value={chosenCar.operatingCostPerKm} suffix="₫" prefix={<DollarOutlined />} valueStyle={{ fontSize: 20 }} />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic title="Chi phí / ngày" value={chosenCar.operatingCostPerDay} suffix="₫" prefix={<DollarOutlined />} valueStyle={{ fontSize: 20 }} />
              </Col>
            </Row>
          </div>

          {/* Ownership */}
          <div className="ownership-row ownership-row--fixed">
            <Row align="middle" gutter={[16, 16]}>
              <Col xs={24} sm={8} md={8}>
                <div className="ownership-block">
                  <div className="ownership-title">Số km đã dùng / tháng</div>
                  <div className="ownership-value">
                    <Statistic value={`${chosenCar.usedKmThisMonth} / ${chosenCar.allowedKmThisMonth}`} prefix={<DashboardOutlined />} valueStyle={{ fontSize: 18 }} />
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={8} md={8}>
                <div className="ownership-block">
                  <div className="ownership-title">Số ngày đã dùng / tháng</div>
                  <div className="ownership-value">
                    <Statistic value={`${chosenCar.usedDaysThisMonth} / ${chosenCar.allowedDaysThisMonth}`} prefix={<CalendarOutlined />} valueStyle={{ fontSize: 18 }} />
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={8} md={8}>
                <div className="ownership-block">
                  <div className="ownership-title">Tỷ lệ sở hữu của bạn</div>
                  <div className="ownership-value percent-style">
                    <span className="pct-number">{chosenCar.totalSharePercentage}</span>
                    <PercentageOutlined /> / 100
                  </div>
                </div>
              </Col>

              <Col xs={24} sm={6} md={6}>
                <div className="ownership-block">
                  <div className="ownership-title">Tổng số xe của bạn</div>
                  <div className="ownership-value">
                    <Statistic value={Object.keys(carsObj).length} prefix={<CarOutlined />} valueStyle={{ fontSize: 18 }} />
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
                className={`mini-card ${car.vehicleId === currentCarId ? "active" : ""}`}
                cover={
                  <div className="mini-card-cover">
                    <img src={car.imageUrl} alt={car.model} />
                    <div className="overlay">
                      <div className="mini-title">{car.brand} {car.model}</div>
                      <div className="mini-tags">
                        <Tag color={car.vehicleStatus?.toLowerCase() === "available" ? "green" : "orange"}>{car.vehicleStatus}</Tag>
                        {car.vehicleId === currentCarId && <Tag color="geekblue">Đang chọn</Tag>}
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