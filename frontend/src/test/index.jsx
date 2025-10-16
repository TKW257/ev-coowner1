import React, { useEffect, useState } from "react";
import vehiclesApi from "../api/vehiclesApi";


const TestVehicles = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testApi = async () => {
      try {
        const res = await vehiclesApi.getAllVehicles();
        console.log("Kết quả API:", res);
        setData(res);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setError(err.message || "Không thể kết nối API");
      } finally {
        setLoading(false);
      }
    };
    testApi();
  }, []);

  if (loading) return <h3>⏳ Đang tải dữ liệu...</h3>;
  if (error) return <h3 style={{ color: "red" }}>❌ Lỗi: {error}</h3>;

  return (
    <div style={{ padding: 20 }}>
      <h2>🚘 Dữ liệu xe trả về từ API:</h2>
      <pre
        style={{
          background: "#f6f8fa",
          padding: 16,
          borderRadius: 8,
          overflowX: "auto",
        }}
      >
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};

export default TestVehicles;
