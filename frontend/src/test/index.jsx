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





// import React, { useState } from "react";
// import { App, Card, Row, Col, Badge, Calendar, Tag, DatePicker, Button, Progress, Spin } from "antd";
// import { ThunderboltOutlined } from "@ant-design/icons";
// import { useParams } from "react-router-dom";
// import useCarBooking from "../../../hooks/useCarBooking";

// const { RangePicker } = DatePicker;

// const CarBookingPage = () => {
//   const { id } = useParams();
//   const { notification } = App.useApp();
//   const [range, setRange] = useState([]);
//   const { car, loading, getDateStatus, bookCar } = useCarBooking(id, notification);

//   const handleBook = async () => {
//     const res = await bookCar(range);
//     if (res.success) {
//       notification.success({ message: "Đặt lịch thành công" });
//       setRange([]);
//     } else {
//       notification.warning({ message: res.message });
//     }
//   };

//   const dateCellRender = (value) => (
//     <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
//       <li>
//         <Badge status={getDateStatus(value)} />
//       </li>
//     </ul>
//   );

//   const cellRender = (current, info) =>
//     info.type === "date" ? dateCellRender(current) : info.originNode;

//   if (loading)
//     return (
//       <div style={{ padding: 40, textAlign: "center" }}>
//         <Spin tip="Đang tải dữ liệu..." size="large" />
//       </div>
//     );

//   if (!car)
//     return (
//       <div style={{ padding: 24 }}>
//         <Card>Không tìm thấy xe có ID {id}</Card>
//       </div>
//     );

//   return (
//     <div style={{ padding: 24 }}>
//       <Card bordered={false} style={{ borderRadius: 16, background: "#fafafa" }}>
//         <Row gutter={[24, 16]} align="middle" style={{ marginBottom: 16 }}>
//           <Col xs={24} md={8}>
//             <img
//               src={car.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"}
//               alt={car.model}
//               style={{ width: "100%", borderRadius: 12, objectFit: "cover", maxHeight: 200 }}
//             />
//           </Col>

//           <Col xs={24} md={16}>
//             <h2>{car.brand} {car.model}</h2>
//             <p>Biển số: {car.plateNumber} • Năm: {car.year}</p>

//             <Tag color={car.status === "available" ? "green" : "orange"}>
//               {car.status === "available" ? "Sẵn sàng" : "Không khả dụng"}
//             </Tag>

//             <Progress percent={car.batteryCapacityKwh} size="small" strokeColor="#52c41a" showInfo={false} />
//             <p>⚡ Dung lượng pin: <b>{car.batteryCapacityKwh}%</b></p>
//             <p>💰 Chi phí: {car.operatingCostPerDay}₫ / ngày • {car.operatingCostPerKm}₫ / km</p>

//             <div style={{ marginTop: 12 }}>
//               <RangePicker
//                 onChange={setRange}
//                 value={range}
//                 format="DD/MM/YYYY"
//                 placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
//                 disabled={car.status !== "available"}
//               />
//               <Button
//                 type="primary"
//                 icon={<ThunderboltOutlined />}
//                 onClick={handleBook}
//                 style={{ marginLeft: 8 }}
//                 disabled={car.status !== "available"}
//               >
//                 Đặt lịch
//               </Button>
//             </div>
//           </Col>
//         </Row>

//         <div style={{ marginBottom: 12 }}>
//           <Tag color="green">Ngày trống</Tag>
//           <Tag color="orange">Đang chờ xác nhận</Tag>
//           <Tag color="red">Đã được đặt</Tag>
//         </div>

//         <Calendar cellRender={cellRender} />
//       </Card>
//     </div>
//   );
// };

// export default CarBookingPage;








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







// import React, { useState } from "react";
// import { Row, Col, Typography, Tag, Button, Divider, DatePicker, message } from "antd";
// import dayjs from "dayjs";
// import { useVehicle } from "../../../../hooks/useVehicle";

// const { Title, Text } = Typography;
// const { RangePicker } = DatePicker;

// const CarInfoSection = ({ vehicleId, onBookingSuccess }) => {
//   const { vehicle, loading: vehicleLoading } = useVehicle(vehicleId);
//   const [selectedDates, setSelectedDates] = useState([]);
//   const [bookingLoading, setBookingLoading] = useState(false);

//   const handleDateChange = (dates) => {
//     if (!dates || dates.length !== 2) return setSelectedDates([]);
//     const start = dayjs(dates[0]).startOf("day");
//     const end = dayjs(dates[1]).endOf("day");
//     setSelectedDates([start, end]);
//   };

//   const handleBooking = async () => {
//     if (selectedDates.length !== 2) {
//       message.warning("Vui lòng chọn khoảng thời gian đặt xe!");
//       return;
//     }

//     setBookingLoading(true);
//     await new Promise((r) => setTimeout(r, 800)); // giả lập API
//     message.success("Đặt xe thành công!");
//     onBookingSuccess?.();
//     setBookingLoading(false);
//   };

//   if (vehicleLoading) return <Text>Đang tải thông tin xe...</Text>;
//   if (!vehicle) return null;

//   return (
//     <div style={{ padding: "16px 0" }}>
//       <Row gutter={24}>
//         <Col xs={24} sm={6}>
//           <img
//             src={vehicle.imageUrl}
//             alt={vehicle.model}
//             style={{ width: "100%", borderRadius: 12, objectFit: "cover" }}
//           />
//         </Col>
//         <Col xs={24} sm={18}>
//           <Title level={4}>
//             {vehicle.brand} {vehicle.model}
//           </Title>
//           <Text>Năm {vehicle.year} • Biển số: {vehicle.plateNumber}</Text>
//           <br />
//           <Tag color={vehicle.status === "AVAILABLE" ? "blue" : "red"}>{vehicle.status}</Tag>
//           <Divider />
//           <RangePicker format="DD/MM/YYYY" onChange={handleDateChange} value={selectedDates} />
//           <Button
//             type="primary"
//             loading={bookingLoading}
//             onClick={handleBooking}
//             style={{ marginLeft: 8 }}
//           >
//             Đặt xe
//           </Button>
//         </Col>
//       </Row>
//     </div>
//   );
// };

// export default CarInfoSection;

