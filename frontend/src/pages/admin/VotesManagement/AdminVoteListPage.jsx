import { useEffect, useState } from "react";
import { Breadcrumb, Card, Row, Col, Spin, Button, message } from "antd";
import { HomeOutlined, CarOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import vehiclesApi from "../../../api/vehiclesApi";

export default function AdminVoteListPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await vehiclesApi.getAllVehicles();
        console.log("✅ API trả về:", res);

        // trường hợp backend trả về dạng array
        const data = Array.isArray(res?.data) ? res.data : res;
        setVehicles(data || []);
      } catch (err) {
        console.error(err);
        message.error("Không thể tải danh sách xe");
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading)
    return <Spin className="flex justify-center mt-10" size="large" />;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Breadcrumb
        items={[
          { title: <HomeOutlined /> },
          { title: <CarOutlined /> },
          { title: "Danh sách xe" },
        ]}
      />

      <div className="flex justify-between items-center mt-3 mb-5">
        <h1 className="text-xl font-semibold text-gray-700 colour text  black">
          Chọn xe để tạo chủ đề bình chọn
        </h1>
      </div>

      <Row gutter={[16, 16]}>
        {Array.isArray(vehicles) && vehicles.length > 0 ? (
          vehicles.map((v) => (
            <Col xs={24} sm={12} md={8} lg={6} key={v.vehicleId}>
              <Card
                title={v.model || v.name || `Xe #${v.vehicleId}`}
                className="shadow-md hover:shadow-lg transition-all bg-white"
                actions={[
                  <Button
                    type="primary"
                    onClick={() =>
                      navigate(`/admin/vote/create?vehicleId=${v.vehicleId}`)
                    }
                  >
                    Tạo bình chọn
                  </Button>,
                ]}
              >
                <p>Màu: {v.color}</p>
                <p>Trạng thái: {v.status}</p>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <p className="text-gray-500 text-center mt-10">
              Không có xe nào để hiển thị.
            </p>
          </Col>
        )}
      </Row>
    </div>
  );
}
