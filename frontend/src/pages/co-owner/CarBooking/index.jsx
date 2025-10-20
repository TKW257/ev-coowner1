import React, { useState } from "react";
import { Card } from "antd";
import CarInfoSection from "./CurentCarSection";
import CalendarSection from "./Calendar";
import BookingHistorySection from "./BookingHistorySection";

const VehicleBookingPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBookingSuccess = (res) => {
    console.log("🎉 Booking success callback:", res);
    setRefreshKey(prev => prev + 1); // trigger refresh for Calendar & BookingHistory
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "30px 20px" }}>
      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <CarInfoSection onBookingSuccess={handleBookingSuccess} />
      </Card>

      <Card style={{ borderRadius: 16, marginBottom: 24 }}>
        <CalendarSection refreshKey={refreshKey} />
      </Card>

      <Card style={{ borderRadius: 16 }}>
        <BookingHistorySection refreshKey={refreshKey} />
      </Card>
    </div>
  );
};

export default VehicleBookingPage;
