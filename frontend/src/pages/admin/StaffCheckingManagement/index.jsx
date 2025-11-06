import React, { useState, useEffect, useCallback } from "react";
import { Table, Tag, Space, Button, Select, Card, Statistic, Row, Col, Modal } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined, CarOutlined, CalendarOutlined, EyeOutlined, DownloadOutlined } from "@ant-design/icons";
import bookingApi from "../../../api/bookingApi";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import StaffCheckingReport from "../../../components/StaffCheckingReport";

const StaffCheckingManagement = () => {
  const [checkings, setCheckings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [stats, setStats] = useState({
    totalCheckings: 0,
    checkIns: 0,
    checkOuts: 0,
    todayCheckings: 0,
  });

  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedChecking, setSelectedChecking] = useState(null);

  const fetchStaffCheckings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await bookingApi.viewAllStaffCheckings();
      let checkingsData = [];
      if (Array.isArray(response)) {
        checkingsData = response;
      } else if (response?.data) {
        checkingsData = Array.isArray(response.data)
          ? response.data
          : [response.data];
      }

      setCheckings(checkingsData);
      calculateStats(checkingsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  const calculateStats = (data) => {
    const today = new Date().toDateString();
    const checkIns = data.filter((i) => i.checkingType === "CheckIn");
    const checkOuts = data.filter((i) => i.checkingType === "CheckOut");
    const todayCheckings = data.filter((item) => {
      if (item.checkTime && Array.isArray(item.checkTime)) {
        const [y, m, d] = item.checkTime;
        return new Date(y, m - 1, d).toDateString() === today;
      }
      return false;
    });

    setStats({
      totalCheckings: data.length,
      checkIns: checkIns.length,
      checkOuts: checkOuts.length,
      todayCheckings: todayCheckings.length,
    });
  };

  useEffect(() => {
    fetchStaffCheckings();
  }, [fetchStaffCheckings]);

  const handleOpenReportModal = (checking) => {
    setSelectedChecking(checking);
    setReportModalVisible(true);
  };

  const handleCloseReportModal = () => {
    setReportModalVisible(false);
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("checking-report-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save(
        `StaffChecking_${selectedChecking.checkingId || selectedChecking.id}.pdf`
      );
    } catch (err) {
      console.error("PDF generation error:", err);
    }
  };

  const columns = [
    {
      title: "Checking ID",
      dataIndex: "checkingId",
      key: "checkingId",
      width: 120,
      render: (text, record) => record.checkingId || record.id,
    },
    {
      title: "Loại",
      dataIndex: "checkingType",
      key: "checkingType",
      width: 120,
      render: (type) => (
        <Tag color={type === "CheckIn" ? "green" : "blue"}>
          {type === "CheckIn" ? "Check-in" : "Check-out"}
        </Tag>
      ),
    },
    {
      title: "Tên User",
      dataIndex: "userName",
      key: "userName",
      width: 150,
    },
    {
      title: "Tên Staff",
      dataIndex: "staffName",
      key: "staffName",
      width: 150,
    },
    {
      title: "Hành động",
      key: "action",
      width: 160,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleOpenReportModal(record)}
          >
            Xem biên bản
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      
      {/* Thống kê */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng Checking"
              value={stats.totalCheckings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Check-in"
              value={stats.checkIns}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Check-out"
              value={stats.checkOuts}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Hôm nay"
              value={stats.todayCheckings}
              prefix={<CarOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc */}
      <div style={{ marginBottom: 16 }}>
        <Select
          style={{ width: 200 }}
          placeholder="Lọc theo loại"
          value={filterType}
          onChange={setFilterType}
        >
          <Select.Option value="all">Tất cả</Select.Option>
          <Select.Option value="CheckIn">Check-in</Select.Option>
          <Select.Option value="CheckOut">Check-out</Select.Option>
        </Select>
      </div>

      {/* Bảng */}
      <Table
        rowKey={(record) => record.checkingId || record.id}
        columns={columns}
        dataSource={
          filterType === "all"
            ? checkings
            : checkings.filter((item) => item.checkingType === filterType)
        }
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 600 }}
      />

      {/* 🔹 Modal Biên bản PDF */}
      <Modal
        open={reportModalVisible}
        onCancel={handleCloseReportModal}
        footer={[
          <Button key="close" onClick={handleCloseReportModal}>
            Đóng
          </Button>,
          <Button
            key="pdf"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPDF}
          >
            Xuất file PDF
          </Button>,
        ]}
        width={850}
      >
        {selectedChecking && (
          <div id="checking-report-content">
            <StaffCheckingReport checking={selectedChecking} />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StaffCheckingManagement;
