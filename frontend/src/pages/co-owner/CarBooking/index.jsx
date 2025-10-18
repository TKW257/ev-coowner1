import React from "react";
import { Card, message } from "antd";
import CarInfoSection from "./CurentCarSection";
import BookingHistorySection from "./BookingHistorySection";

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
       <BookingHistorySection/>      
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
