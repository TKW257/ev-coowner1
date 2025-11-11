import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Skeleton,
  Slider,
  Select,
  Pagination,
  Space,
  message,
} from "antd";
import { ThunderboltOutlined, FilterOutlined } from "@ant-design/icons";
import vehiclesApi from "../../../api/vehiclesApi";
import "./style.scss";

const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

const { Title, Text } = Typography;
const { Option } = Select;

const StockCarsPage = () => {
  const [cars, setCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);

  // filter state
  const [priceRange, setPriceRange] = useState([0, 2000000000]);
  const [status, setStatus] = useState(null);
  const [color, setColor] = useState(null);
  const [seat, setSeat] = useState(null);
  const [brand, setBrand] = useState(null);
  const [year, setYear] = useState(null);

  // pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);

    const getCarImageUrl = (imagePath) => {
    if (!imagePath) return "";
    return `${baseURL}/${imagePath.replaceAll("\\", "/")}`;
  };

  // 🔹 Lấy danh sách xe ban đầu
  const fetchVehicles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await vehiclesApi.getAllVehicles();
      const data = response?.data || response; // tuỳ backend trả về
      setCars(data);
      setFilteredCars(data);
    } catch (error) {
      console.error(error);
      message.error("Không thể tải danh sách xe 🚫");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Hàm filter (dùng useCallback để tránh cảnh báo)
  const handleFilter = useCallback(() => {
    let result = [...cars];
    result = result.filter((v) => {
      const matchPrice = v.price >= priceRange[0] && v.price <= priceRange[1];
      const matchStatus = status ? v.status === status : true;
      const matchColor = color
        ? v.color?.toLowerCase() === color.toLowerCase()
        : true;
      const matchSeat = seat ? v.seat === seat : true;
      const matchBrand = brand
        ? v.brand?.toLowerCase() === brand.toLowerCase()
        : true;
      const matchYear = year ? v.year === year : true;
      return (
        matchPrice &&
        matchStatus &&
        matchColor &&
        matchSeat &&
        matchBrand &&
        matchYear
      );
    });
    setFilteredCars(result);
    setCurrentPage(1);
  }, [cars, priceRange, status, color, seat, brand, year]);

  // 🔹 Chạy khi component mount
  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // 🔹 Chạy lại khi filter thay đổi
  useEffect(() => {
    handleFilter();
  }, [handleFilter]);

  // Skeleton loader
  const renderSkeletons = Array.from({ length: 8 }, (_, index) => (
    <Col xs={24} sm={12} md={8} lg={6} key={`skeleton-${index}`}>
      <Card className="car-card">
        <Skeleton.Image
          active
          style={{ width: "100%", height: 200, borderRadius: 12 }}
        />
        <Skeleton active paragraph={{ rows: 3 }} />
      </Card>
    </Col>
  ));

  // Render danh sách xe
  const renderCars = filteredCars
    .slice((currentPage - 1) * pageSize, currentPage * pageSize)
    .map((car) => {
      const statusText = car.status || "Unknown";
      const statusLower = statusText.toLowerCase();
      const statusClass =
        statusLower.includes("available") || statusLower.includes("active")
          ? "status-active"
          : "status-inactive";

      return (
        <Col xs={24} sm={12} md={8} lg={6} key={car.vehicleId}>
          <Card
            hoverable
            cover={
              <img
                src={getCarImageUrl(car.imageUrl) || "https://placehold.co/400x250?text=No+Image"}
                alt={`${car.brand} ${car.model}`}
                className="car-img"
              />
            }
            className="car-card"
          >
            <div className="car-info">
              <Title level={4} className="car-name">
                {car.brand} {car.model} ({car.year})
              </Title>
              <div className="car-details">
                <Text className="car-battery">
                  <ThunderboltOutlined /> {car.batteryCapacityKwh} kWh
                </Text>
                <Text className={`car-status ${statusClass}`}>
                  ● {statusText}
                </Text>
              </div>
              <div className="car-actions">
                <Button type="default">Xem chi tiết</Button>
                <Button type="primary" style={{ marginLeft: 8 }}>
                  Góp vốn ngay
                </Button>
              </div>
            </div>
          </Card>
        </Col>
      );
    });

  return (
    <div className="stockcars-page">

      {/* FILTER BAR */}
      <Card className="filter-bar" style={{ marginBottom: 24 }}>
        <Space wrap align="center" size="middle" style={{ width: "100%" }}>
          <span style={{ fontWeight: 500 }}>
            <FilterOutlined /> Bộ lọc:
          </span>

          {/* Hãng xe */}
          <Select
            placeholder="Hãng xe"
            style={{ width: 140 }}
            allowClear
            onChange={setBrand}
          >
            {Array.from(new Set(cars.map((v) => v.brand))).map((b) => (
              <Option key={b} value={b}>
                {b}
              </Option>
            ))}
          </Select>

          {/* Năm sản xuất */}
          <Select
            placeholder="Năm"
            style={{ width: 100 }}
            allowClear
            onChange={setYear}
          >
            {Array.from(new Set(cars.map((v) => v.year)))
              .sort((a, b) => b - a)
              .map((y) => (
                <Option key={y} value={y}>
                  {y}
                </Option>
              ))}
          </Select>

                  {/* Tình trạng */}
                  <Select
                      placeholder="Tình trạng"
                      style={{ width: 150 }}
                      allowClear
                      onChange={setStatus}
                  >
                      <Option value="AVAILABLE">Đang hoạt động</Option>
                      <Option value="INACTIVE">Ngừng hoạt động</Option>
                      <Option value="MAINTENANCE">Bảo trì</Option>
                  </Select>

                  {/* Màu xe */}
                  <Select
                      placeholder="Màu xe"
                      style={{ width: 120 }}
                      allowClear
                      onChange={setColor}
                  >
                      {Array.from(new Set(cars.map((v) => v.color))).map((c) => (
                          <Option key={c} value={c}>
                              {c}
                          </Option>
                      ))}
                  </Select>

                  {/* Số chỗ */}
                  <Select
                      placeholder="Số chỗ"
                      style={{ width: 100 }}
                      allowClear
                      onChange={setSeat}
                  >
                      {Array.from(new Set(cars.map((v) => v.seat))).map((s) => (
                          <Option key={s} value={s}>
                              {s}
                          </Option>
                      ))}
                  </Select>

                  <Button
                      onClick={() => {
                          setPriceRange([0, 2000000000]);
                          setStatus(null);
                          setColor(null);
                          setSeat(null);
                          setBrand(null);
                          setYear(null);
                      }}
                  >
                      Reset
                  </Button>
              </Space>
          </Card>

      {/* GRID */}
      <Row gutter={[24, 24]}>{loading ? renderSkeletons : renderCars}</Row>

      <Pagination
        current={currentPage}
        total={filteredCars.length}
        pageSize={pageSize}
        onChange={(page) => setCurrentPage(page)}
        style={{ marginTop: 24, textAlign: "center" }}
      />
    </div>
  );
};

export default StockCarsPage;
