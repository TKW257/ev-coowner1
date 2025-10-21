import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Row, Col, Typography, Button, Divider, DatePicker, message } from "antd";
import dayjs from "dayjs";
import bookingApi from "../../../../api/bookingApi";
import { useBooking } from "../../../../hooks/useBooking";

const { Title, Text } = Typography;

const CurentCarSection = ({ onBookingSuccess }) => {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const { createBooking, loading } = useBooking(onBookingSuccess);

  useEffect(() => {
    const fetchVehicle = async () => {
      if (!vehicleId) return;
      try {
        const res = await bookingApi.getBookingsByVehicle(vehicleId);
        console.log("%c✅ Booking API response:", "color:green", res);
        if (Array.isArray(res) && res.length > 0) {
          setVehicle(res[0]);
        } else {
          setVehicle(res?.vehicle || {});
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải thông tin xe:", err);
        message.error("Không thể tải thông tin xe!");
      }
    };
    fetchVehicle();
  }, [vehicleId]);

  const handleDateChange = (date) => {
    setSelectedDate(date ? dayjs(date).startOf("day") : null);
  };

  const handleBooking = async () => {
    if (!selectedDate) {
      message.warning("Vui lòng chọn ngày bắt đầu!");
      return;
    }

    if (!vehicleId) {
      message.error("Không có vehicleId hợp lệ!");
      return;
    }

    const payload = {
      vehicleId: Number(vehicleId),
      startTime: dayjs(selectedDate).format("YYYY-MM-DD HH:mm:ss"),
    };

    console.log("%c🚀 Sending booking request:", "color:#ff9800", payload);
    await createBooking(payload);
  };

  if (!vehicle)
    return (
      <div style={{ textAlign: "center", padding: 40 }}>
        <Text>Đang tải thông tin xe...</Text>
      </div>
    );

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={24} align="middle">
        <Col xs={24} sm={6}>
          <img
            src={vehicle.imageUrl}
            alt={vehicle.model}
            style={{ width: "100%", borderRadius: 12, objectFit: "cover" }}
          />
        </Col>
        <Col xs={24} sm={18}>
          <Title level={4}>
            {vehicle.brand} {vehicle.model}
          </Title>
          <Text>
            Năm {vehicle.year} • Biển số: {vehicle.plateNumber}
          </Text>
          <Divider />
          <Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
            Chọn ngày bắt đầu để đặt xe.
          </Text>
          <Row gutter={12} align="middle">
            <Col>
              <DatePicker
                format="DD/MM/YYYY"
                onChange={handleDateChange}
                value={selectedDate}
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </Col>
            <Col>
              <Button
                type="primary"
                loading={loading}
                onClick={handleBooking}
                disabled={!selectedDate}
              >
                Đặt xe
              </Button>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default CurentCarSection;
