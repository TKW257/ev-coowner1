import React, { useState } from "react";
import { App, Card, Row, Col, Badge, Calendar, Tag, DatePicker, Button, Progress, Spin } from "antd";
import { ThunderboltOutlined } from "@ant-design/icons";
import { useParams } from "react-router-dom";
import useCarBooking from "../../../hooks/useCarBooking.js";

const { RangePicker } = DatePicker;

const CarBookingPage = () => {
  const { id } = useParams();
  const { notification } = App.useApp();
  const [range, setRange] = useState([]);
  const { car, loading, getDateStatus, bookCar } = useCarBooking(id, notification);

  const handleBook = async () => {
    const res = await bookCar(range);
    if (res.success) {
      notification.success({ message: "Đặt lịch thành công" });
      setRange([]);
    } else {
      notification.warning({ message: res.message });
    }
  };

const VehicleBookingPage = () => {
  const handleBookingSuccess = (res) => {
    console.log("🎉 Booking success callback:", res);
    message.success("Đặt xe thành công!");
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 20px" }}>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <CarInfoSection onBookingSuccess={handleBookingSuccess} />
      </Card>



      <Card style={{ borderRadius: 16 }}>
        <BookingHistorySection />
      </Card>
    </div>
  );
};

export default VehicleBookingPage;





// import React, { useState } from "react";
// import { Card } from "antd";
// import { useParams } from "react-router-dom";
// import CarInfoSection from "./CurentCarSection";
// //import CalendarSection from "./Calendar";
// import BookingHistorySection from "./BookingHistorySection";

// const VehicleBookingPage = () => {

//   const { vehicleId } = useParams();
//   const [refreshKey, setRefreshKey] = useState(0);

//   return (
//     <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 20px" }}>
      
//       <Card style={{ borderRadius: 16, marginBottom: 24 }}>
//         <CarInfoSection
//           vehicleId={vehicleId}
//           onBookingSuccess={() => setRefreshKey((k) => k + 1)}
//         />
//       </Card>

//       {/* <Card style={{ borderRadius: 16, marginBottom: 24 }}>
//         <CalendarSection key={refreshKey} vehicleId={vehicleId} />
//       </Card> */}

//       <Card style={{ borderRadius: 16 }}>
//         <BookingHistorySection key={refreshKey} vehicleId={vehicleId} />
//       </Card>

//     </div>
//   );
// };

// export default VehicleBookingPage;
