import React, { useEffect, useState } from "react";
import { Table, Modal, Button, Tag, Image, Typography } from "antd";
import dayjs from "dayjs";
import bookingApi from "../../../api/bookingApi";
import vehiclesApi from "../../../api/vehiclesApi";
const baseURL = "https://vallate-enzootically-sterling.ngrok-free.dev";

const { Title } = Typography;

const VehicleDisputePage = () => {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [disputedBookings, setDisputedBookings] = useState([]);
    const [loadingDisputes, setLoadingDisputes] = useState(false);

    // Lấy danh sách xe
    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                setLoading(true);
                const res = await vehiclesApi.getAllVehicles();
                const data = res?.data || res;
                setVehicles(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách xe:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVehicles();
    }, []);

    const handleViewDisputes = async (vehicle) => {
        setSelectedVehicle(vehicle);
        setModalVisible(true);
        try {
            setLoadingDisputes(true);
            const res = await bookingApi.getDisputedBookingsByVehicle(vehicle.vehicleId);
            const rawData = res?.data || res;

            // Hàm chuyển đổi mảng thời gian sang đối tượng Date
            const parseDateArray = (arr) => {
                if (!Array.isArray(arr) || arr.length < 5) return null;
                // month - 1 vì JS tính tháng từ 0
                return new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4]);
            };

            const formattedData = (rawData || []).map((item) => ({
                id: item.bookingId,
                vehicleId: item.vehicleId,
                vehicleName: item.vehicleName,
                userName: item.userName,
                userEmail: item.userEmail,
                status: item.bookingStatus,
                startDate: parseDateArray(item.startTime),
                endDate: parseDateArray(item.endTime),
                createdAt: parseDateArray(item.createdAt),
                disputed: item.disputed,
                disputeWinner: item.disputeWinner,
            }));

            setDisputedBookings(formattedData);
        } catch (error) {
            console.error("Lỗi khi tải danh sách tranh chấp:", error);
        } finally {
            setLoadingDisputes(false);
        }
    };

    // Cột table xe
    const vehicleColumns = [
        {
            title: "Hình ảnh",
            dataIndex: "imageUrl",
            key: "imageUrl",
            render: (url) => (
                <Image
                    src={`${baseURL}/${url.replace("\\", "/")}`}
                    alt="vehicle"
                    width={100}
                    height={60}
                    style={{ objectFit: "cover", borderRadius: 8 }}
                    preview={false}
                />
            ),
        },
        { title: "Thương hiệu", dataIndex: "brand", key: "brand" },
        { title: "Mẫu xe", dataIndex: "model", key: "model" },
        { title: "Biển số", dataIndex: "plateNumber", key: "plateNumber" },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "Available" ? "green" : "volcano"}>{status}</Tag>
            ),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Button type="primary" onClick={() => handleViewDisputes(record)}>
                    Xem tranh chấp
                </Button>
            ),
        },
    ];

    const statusColors = {
        Pending: "orange",
        Completed: "green",
        Cancelled: "red",
        Confirmed: "blue",
        InProgress: "volcano",
    };

    const disputeColumns = [
        { title: "Mã Booking", dataIndex: "id", key: "id" },
        { title: "Tên xe", dataIndex: "vehicleName", key: "vehicleName" },
        { title: "Khách hàng", dataIndex: "userName", key: "userName" },
        { title: "Email", dataIndex: "userEmail", key: "userEmail" },
        {
            title: "Ngày bắt đầu",
            dataIndex: "startDate",
            key: "startDate",
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
        },
        {
            title: "Ngày kết thúc",
            dataIndex: "endDate",
            key: "endDate",
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-"),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const color = statusColors[status] || "default";
                return <Tag color={color}>{status || "Không xác định"}</Tag>;
            },
        },
        {
            title: "Kết quả tranh chấp",
            dataIndex: "disputeWinner",
            key: "disputeWinner",
            render: (winner) =>
                winner === true ? (
                    <Tag color="green">Chấp nhận</Tag>
                ) : winner === false ? (
                    <Tag color="red">Thất bại</Tag>
                ) : (
                    <Tag color="orange">Đang tranh chấp</Tag>
                ),
        },
    ];


    return (
        <div>
            <Title level={3} style={{ marginBottom: 20, marginTop: 24 }}>
                Theo dõi tranh chấp theo xe
            </Title>

            <Table
                columns={vehicleColumns}
                dataSource={vehicles}
                rowKey="vehicleId"
                loading={loading}
                bordered
                pagination={{ pageSize: 5 }}
            />

            <Modal
                open={modalVisible}
                title={`Danh sách tranh chấp của xe: ${selectedVehicle?.brand || ""} ${selectedVehicle?.model || ""}`}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={850}
            >
                <Table
                    columns={disputeColumns}
                    dataSource={disputedBookings}
                    rowKey="id"
                    loading={loadingDisputes}
                    bordered
                    pagination={false}
                />
            </Modal>
        </div>
    );
};

export default VehicleDisputePage;
