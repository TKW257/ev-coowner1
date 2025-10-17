import React, { useEffect, useState } from "react";
import { Card, Typography, Spin, message, Empty } from "antd";
import ownershipApi from "../api/ownerShipsApi";

const { Title, Text } = Typography;

const TestOwnership = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOwnerships = async () => {
      try {
        const res = await ownershipApi.getMyVehicles();
        console.log("🚗 Dữ liệu trả về:", res);
        setVehicles(Array.isArray(res) ? res : []); // đảm bảo luôn là mảng
      } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
        message.error("Không thể tải danh sách xe!");
      } finally {
        setLoading(false);
      }
    };
    fetchOwnerships();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: 100 }}>
        <Spin size="large" />
        <Title level={4}>Đang tải danh sách xe...</Title>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <Title level={2}>Kết quả API Ownership</Title>

      {vehicles.length === 0 ? (
        <Empty description="Bạn chưa sở hữu xe nào." />
      ) : (
        vehicles.map((vehicle) => (
          <Card
            key={vehicle.vehicleId}
            title={`${vehicle.brand} ${vehicle.model}`}
            cover={
              <img
                alt={vehicle.model}
                src={vehicle.imageUrl}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            }
            style={{
              marginBottom: 20,
              borderRadius: 12,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <p>
              <Text strong>Biển số:</Text> {vehicle.plateNumber}
            </p>
            <p>
              <Text strong>Màu sắc:</Text> {vehicle.color}
            </p>
            <p>
              <Text strong>Năm sản xuất:</Text> {vehicle.year}
            </p>
            <p>
              <Text strong>Dung lượng pin:</Text> {vehicle.batteryCapacityKwh}{" "}
              kWh
            </p>
            <p>
              <Text strong>Chi phí/ngày:</Text> ${vehicle.operatingCostPerDay}
            </p>
            <p>
              <Text strong>Chi phí/km:</Text> ${vehicle.operatingCostPerKm}
            </p>
            <p>
              <Text strong>Trạng thái:</Text> {vehicle.status}
            </p>
            <p>
              <Text strong>Mô tả:</Text> {vehicle.description}
            </p>
          </Card>
        ))
      )}
    </div>
  );
};

export default TestOwnership;



// import React from "react";
// import { Card, Row, Col, Tag, Typography, Button, Progress, Skeleton, Empty } from "antd";
// import { ThunderboltOutlined, EyeOutlined, LikeOutlined, CarOutlined } from "@ant-design/icons";
// import { useNavigate } from "react-router-dom";
// import { useEffect, useState } from "react";
// import ownerShipsApi from "../../../api/ownerShipsApi";
// import "./style.scss";

// const { Text } = Typography;

// function MyCars() {
//   const [cars, setCars] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [currentCar, setCurrentCar] = useState(null);
//   const [fade, setFade] = useState(false);
//   const navigate = useNavigate();
//   const chosenCar = cars.find((c) => c.vehicleId === currentCar);

//   useEffect(() => {
//     const fetchMyVehicles = async () => {
//       try {
//         const res = await ownerShipsApi.getMyVehicles();
//         const vehicles = res.data || [];

//         setCars(vehicles);
//         if (vehicles.length > 0) {
//           setCurrentCar(vehicles[0].vehicleId);
//         }
//       } catch (err) {
//         console.error("❌ Lỗi khi tải danh sách xe:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMyVehicles();
//   }, []);

//   const handleBook = (car) =>
//     navigate(`/owner/carbooking/${car.vehicleId}`, { state: { car } });

//   const handleViewDetail = (car) =>
//     navigate(`/dashboard/car/${car.vehicleId}`, { state: { car } });

//   const handleVote = (car) =>
//     navigate(`/dashboard/voting/${car.vehicleId}`, { state: { car } });

//   const handleExploreCars = () => navigate("/dashboard/explorecars");

//   const handleChangeCar = (vehicleId) => {
//     if (vehicleId === currentCar) return;
//     setFade(true);
//     setTimeout(() => {
//       setCurrentCar(vehicleId);
//       setFade(false);
//     }, 300);
//   };

//   // Load Skeleton
//   if (loading) {
//     return (
//       <div className="mycar-skeleton">
//         <div className="banner-skeleton">
//           <div className="banner-img shimmer" />
//         </div>
//         <Row gutter={[24, 24]} className="car-skeleton-list">
//           {Array.from({ length: 3 }).map((_, index) => (
//             <Col xs={24} sm={12} md={8} key={index}>
//               <Card className="car-skeleton-card">
//                 <div className="car-img shimmer" />
//                 <div className="car-info">
//                   <Skeleton active paragraph={{ rows: 2 }} />
//                 </div>
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       </div>
//     );
//   }

//   // None Cars 
//   if (!loading && cars.length === 0) {
//     return (
//       <div className="mycar-empty">
//         <Empty
//           image={Empty.PRESENTED_IMAGE_SIMPLE}
//           description={<span>Bạn chưa sở hữu chiếc xe nào</span>}
//         />
//         <Button
//           type="primary"
//           icon={<CarOutlined />}
//           size="large"
//           className="buy-btn"
//           onClick={handleExploreCars}
//         >
//           Mua xe ngay
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="mycar-container">

//       {/* Banner */}
//       {chosenCar && (
//         <div
//           className={`banner ${fade ? "fade-out" : "fade-in"}`}
//           style={{ backgroundImage: `url(${chosenCar.imageUrl})` }}
//         >
//           <div className="banner-overlay" />
//           <div className="banner-content">
//             <div className="banner-top">
//               <div className="banner-info">
//                 <Text strong className="banner-title">
//                   {chosenCar.brand} {chosenCar.model}
//                 </Text>
//                 <br />
//                 <Text type="secondary" className="banner-subtitle">
//                   Biển số: {chosenCar.plateNumber || "N/A"} • Năm{" "}
//                   {chosenCar.year || "Không rõ"}
//                 </Text>

//                 <div className="banner-tags">
//                   <Tag
//                     color={
//                       chosenCar.status === "available"
//                         ? "green"
//                         : chosenCar.status === "rented"
//                           ? "orange"
//                           : "red"
//                     }
//                   >
//                     {chosenCar.status || "unknown"}
//                   </Tag>
//                   <Tag color="blue">
//                     {chosenCar.totalSharePercentage || 0}% Share
//                   </Tag>
//                 </div>

//                 <div className="banner-stats">
//                   <Progress
//                     percent={Math.min(
//                       chosenCar.batteryCapacityKwh || 0,
//                       100
//                     )}
//                     strokeColor="#1890ff"
//                     size="small"
//                     showInfo={false}
//                     style={{ width: "180px" }}
//                   />
//                   <Text className="banner-text">
//                     ⚡ {chosenCar.batteryCapacityKwh || 0} kWh
//                   </Text>
//                   <br />
//                   <Text className="banner-text">
//                     💰 Chi phí vận hành:{" "}
//                     {chosenCar.operatingCostPerDay
//                       ? `${chosenCar.operatingCostPerDay}₫/ngày`
//                       : "Không rõ"}
//                   </Text>
//                 </div>
//               </div>

//               <div className="banner-actions">
//                 <Button
//                   type="primary"
//                   icon={<ThunderboltOutlined />}
//                   size="large"
//                   onClick={() => handleBook(chosenCar)}
//                   disabled={chosenCar.status !== "available"}
//                   className="booking-btn"
//                 >
//                   Booking
//                 </Button>
//                 <Button
//                   icon={<LikeOutlined />}
//                   size="large"
//                   className="vote-btn"
//                   onClick={() => handleVote(chosenCar)}
//                 >
//                   Voting
//                 </Button>
//                 <Button
//                   icon={<EyeOutlined />}
//                   size="large"
//                   onClick={() => handleViewDetail(chosenCar)}
//                 >
//                   View Detail
//                 </Button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 📜 Danh sách xe */}
//       <div className="car-list">
//         <Row gutter={[16, 16]}>
//           {cars.map((car) => (
//             <Col xs={24} sm={12} md={8} key={car.vehicleId}>
//               <Card
//                 hoverable
//                 onClick={() => handleChangeCar(car.vehicleId)}
//                 className={`car-card ${car.vehicleId === currentCar ? "active" : ""
//                   }`}
//                 cover={
//                   <img
//                     src={car.imageUrl}
//                     alt={car.model}
//                     className="car-img"
//                   />
//                 }
//               >
//                 <Text strong>
//                   {car.brand} {car.model}
//                 </Text>
//                 <br />
//                 <Text type="secondary">
//                   {car.plateNumber || "Chưa có biển số"}
//                 </Text>
//                 <div className="car-tags">
//                   <Tag
//                     color={
//                       car.status === "available"
//                         ? "green"
//                         : car.status === "rented"
//                           ? "orange"
//                           : "red"
//                     }
//                   >
//                     {car.status || "unknown"}
//                   </Tag>
//                   <Tag color="blue">
//                     {car.totalSharePercentage || 0}%
//                   </Tag>
//                   {car.vehicleId === currentCar && (
//                     <Tag color="geekblue">Đang chọn</Tag>
//                   )}
//                 </div>
//               </Card>
//             </Col>
//           ))}
//         </Row>
//       </div>
//     </div>
//   );
// }

// export default MyCars;








// import React, { useEffect, useState } from "react";
// import { Card, Row, Col, Tag, Typography, Button, Empty, Statistic } from "antd";
// import { ThunderboltOutlined, EyeOutlined, LikeOutlined, DollarOutlined, CalendarOutlined, DashboardOutlined, PercentageOutlined } from "@ant-design/icons";
// import "./style.scss";

// const { Title, Text } = Typography;

// const MyCars = () => {
//   const [cars, setCars] = useState([]);
//   const [currentCarId, setCurrentCarId] = useState(null);
//   const [fade, setFade] = useState(false);

//   const mockCars = [
//     {
//       id: 1,
//       brand: "Tesla",
//       model: "Model 3",
//       plate_number: "51A-888.88",
//       year: 2023,
//       battery_capacity_kwh: 75,
//       operating_cost_per_day: 150000,
//       operating_cost_per_km: 3000,
//       image_url:
//         "https://images.pexels.com/photos/7994431/pexels-photo-7994431.jpeg?auto=compress&cs=tinysrgb&w=1200",
//       status: "available",
//       ownership: {
//         totalSharePercentage: 25,
//         allowedKmThisMonth: 600,
//         usedKmThisMonth: 150,
//         allowedDaysThisMonth: 10,
//         usedDaysThisMonth: 4,
//       },
//     },
//     {
//       id: 2,
//       brand: "VinFast",
//       model: "VF 8",
//       plate_number: "30G-999.99",
//       year: 2024,
//       battery_capacity_kwh: 82,
//       operating_cost_per_day: 180000,
//       operating_cost_per_km: 3500,
//       image_url:
//         "https://tse1.mm.bing.net/th/id/OIP.PLj1IX0vMo-VNaDaVrES4wHaE8?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
//       status: "rented",
//       ownership: {
//         totalSharePercentage: 16,
//         allowedKmThisMonth: 600,
//         usedKmThisMonth: 600,
//         allowedDaysThisMonth: 10,
//         usedDaysThisMonth: 10,
//       },
//     },
//   ];
//   useEffect(() => {
//     const t = setTimeout(() => {
//       setCars(mockCars);
//       if (mockCars.length > 0) setCurrentCarId(mockCars[0].id);
//     }, 300);
//     return () => clearTimeout(t);
//   }, []);

//   const chosenCar = cars.find((c) => c.id === currentCarId);

//   const handleChangeCar = (id) => {
//     if (id === currentCarId) return;
//     setFade(true);
//     setTimeout(() => {
//       setCurrentCarId(id);
//       setFade(false);
//     }, 220);
//   };

//   const handleBook = (car) => {
//     alert(`Booking car id=${car.id}`);
//   };

//   if (!cars.length) { // style lại sau
//     return (
//       <div className="mycar-empty">
//         <Empty description="Bạn chưa sở hữu chiếc xe nào" />
//         <Button type="primary" className="add-btn">
//           Thêm xe ngay
//         </Button>
//       </div>
//     );
//   }

//   return (
//     <div className="mycars-root">
//       {/* chosen car */}
//       {chosenCar && (
//         <div className={`chosen-car ${fade ? "fade-out" : "fade-in"}`}>
//           <div className="image-wrap">
//             <img src={chosenCar.image_url} alt={chosenCar.model} />
//             <div className="overlay">
//               <div className="left">
//                 <Title level={3} className="car-name">
//                   {chosenCar.brand} {chosenCar.model}
//                 </Title>
//                 <Text className="plate"> Biển số xe: {chosenCar.plate_number} </Text>
//                 <div className="status-tag">
//                   <Tag
//                     color={
//                       chosenCar.status === "available"
//                         ? "green"
//                         : chosenCar.status === "rented"
//                           ? "orange"
//                           : "red"
//                     }
//                   >
//                     {chosenCar.status}
//                   </Tag>
//                 </div>
//               </div>

//               <div className="right">
//                 <div className="buttons-row">
//                   <Button
//                     type="primary"
//                     icon={<CalendarOutlined />}
//                     onClick={() => handleBook(chosenCar)}
//                     disabled={chosenCar.status !== "available"}
//                   >
//                     Booking
//                   </Button>
//                   <Button icon={<LikeOutlined />}>Voting</Button>
//                   <Button icon={<EyeOutlined />}>View Detail</Button>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* specs */}
//           <div className="specs-row">
//             <Row gutter={[16, 16]}>
//               <Col xs={12} sm={6}>
//                 <Statistic
//                   title="Năm SX"
//                   value={chosenCar.year}
//                   prefix={<CalendarOutlined />}
//                   valueStyle={{ fontSize: 20 }}
//                 />
//               </Col>
//               <Col xs={12} sm={6}>
//                 <Statistic
//                   title="Dung lượng pin"
//                   value={chosenCar.battery_capacity_kwh}
//                   suffix="kWh"
//                   prefix={<ThunderboltOutlined />}
//                   valueStyle={{ fontSize: 20 }}
//                 />
//               </Col>
//               <Col xs={12} sm={6}>
//                 <Statistic
//                   title="Chi phí / km"
//                   value={chosenCar.operating_cost_per_km}
//                   suffix="₫"
//                   prefix={<DollarOutlined />}
//                   valueStyle={{ fontSize: 20 }}
//                 />
//               </Col>
//               <Col xs={12} sm={6}>
//                 <Statistic
//                   title="Chi phí / ngày"
//                   value={chosenCar.operating_cost_per_day}
//                   suffix="₫"
//                   prefix={<DollarOutlined />}
//                   valueStyle={{ fontSize: 20 }}
//                 />
//               </Col>
//             </Row>
//           </div>

//           {/* ownership (updated to match sample) */}
//           <div className="ownership-row ownership-row--fixed">
//             <Row align="middle" gutter={[16, 16]}>

//               {/* Số km đã dùng / tháng */}
//               <Col xs={24} sm={8} md={8}>
//                 <div className="ownership-block">
//                   <div className="ownership-title">Số km đã dùng / tháng</div>
//                   <div className="ownership-value">
//                     <Statistic
//                       value={`${chosenCar.ownership.usedKmThisMonth} / ${chosenCar.ownership.allowedKmThisMonth}`}
//                       prefix={<DashboardOutlined />}
//                       valueStyle={{ fontSize: 18 }}
//                     />
//                   </div>
//                 </div>
//               </Col>

//               {/* Số ngày đã dùng / tháng */}
//               <Col xs={24} sm={8} md={8}>
//                 <div className="ownership-block">
//                   <div className="ownership-title">Số ngày đã dùng / tháng</div>
//                   <div className="ownership-value">
//                     <Statistic
//                       value={`${chosenCar.ownership.usedDaysThisMonth} / ${chosenCar.ownership.allowedDaysThisMonth}`}
//                       prefix={<CalendarOutlined />}
//                       valueStyle={{ fontSize: 18 }}
//                     />
//                   </div>
//                 </div>
//               </Col>

//               {/* Tỷ lệ sở hữu: hiển thị giống mẫu "% 25 %" */}
//               <Col xs={24} sm={8} md={8}>
//                 <div className="ownership-block">
//                   <div className="ownership-title">Tỷ lệ sở hữu</div>
//                   <div className="ownership-value percent-style">
//                     <span className="pct-number">
//                       {chosenCar.ownership.totalSharePercentage}
//                     </span>
//                     <PercentageOutlined />
//                   </div>
//                 </div>
//               </Col>
//             </Row>
//           </div>
//         </div>
//       )}

//       {/* car list */}
//       <div className="car-list">
//         <Row gutter={[16, 16]}>
//           {cars.map((car) => (
//             <Col key={car.id} xs={24} sm={12} md={8} lg={6}>
//               <Card
//                 hoverable
//                 onClick={() => handleChangeCar(car.id)}
//                 className={`mini-card ${car.id === currentCarId ? "active" : ""}`}
//                 cover={
//                   <div className="mini-card-cover">
//                     <img src={car.image_url} alt={car.model} />
//                     <div className="overlay">
//                       <div className="mini-title">
//                         {car.brand} {car.model}
//                       </div>
//                       <div className="mini-tags">
//                         <Tag
//                           color={
//                             car.status === "available"
//                               ? "green"
//                               : car.status === "rented"
//                                 ? "orange"
//                                 : "red"
//                           }
//                         >
//                           {car.status}
//                         </Tag>
//                         {car.id === currentCarId && (
//                           <Tag color="geekblue">Đang chọn</Tag>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 }
//               />
//             </Col>
//           ))}
//         </Row>
//       </div>
//     </div>
//   );
// };

// export default MyCars;
