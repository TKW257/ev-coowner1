import React from "react";
import { Modal, Button, Divider, Typography, Row, Col, Image, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import "./style.scss";

const { Title, Text, Paragraph } = Typography;

const VehicleContract = ({ contract, visible, onClose, baseURL }) => {
  if (!contract) return null;

  const formatDate = (arr) => {
    if (!arr || arr.length < 3) return "N/A";
    const [y, m, d] = arr;
    return `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y}`;
  };

  const handleDownload = () => {
    if (!contract.fileUrl) {
      message.warning("Không có file hợp đồng để tải xuống.");
      return;
    }
    const fileLink = `${baseURL}/${contract.fileUrl.replace(/\\/g, "/")}`;
    const link = document.createElement("a");
    link.href = fileLink;
    link.download = `HopDong_${contract.contractId}.pdf`;
    link.click();
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={850}
      centered
      rootClassName="contract-modal"
      footer={[
        <Button key="download" icon={<DownloadOutlined />} onClick={handleDownload}>
          Tải xuống
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
      ]}
      title={
        <div className="contract-header">
          <Text strong className="contract-national">
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </Text>
          <br />
          <Text className="contract-motto">Độc lập - Tự do - Hạnh phúc</Text>
          <Divider className="contract-divider" />
          <Title level={4} className="contract-title">
            HỢP ĐỒNG HỢP TÁC KINH DOANH XE ĐIỆN
          </Title>
        </div>
      }
    >
      <Typography>
        <Title level={5} className="contract-section">
          I. Thông tin các bên
        </Title>

        <Paragraph>
          <Text strong>BÊN A (Chủ xe):</Text> <br />
          Họ và tên: {contract.user?.fullName || "____________________"} <br />
          Email: {contract.user?.email || "____________________"} <br />
          Số điện thoại: {contract.user?.phone || "____________________"} <br />
          CCCD: {contract.user?.cccd || "____________________"}
        </Paragraph>

        <Paragraph>
          <Text strong>BÊN B (Nền tảng CoEv):</Text> <br />
          Đại diện: {contract.admin?.fullName || "____________________"} <br />
          Chức vụ: Quản Trị Viên <br />
          Email: {contract.admin?.email || "____________________"} <br />
          Số điện thoại: {contract.admin?.phone || "____________________"} <br />
          CCCD: {contract.admin?.cccd || "____________________"}
        </Paragraph>

        <Title level={5} className="contract-section">
          II. Nội dung hợp đồng
        </Title>

        <Paragraph>
          <Text underline>Thông tin xe được đăng ký đồng sở hữu:</Text> <br />
          Hãng xe: {contract.vehicle?.brand || "__________"} <br />
          Mẫu xe: {contract.vehicle?.model || "__________"} <br />
          Biển số: {contract.vehicle?.plateNumber || "__________"} <br />
          Màu xe: {contract.vehicle?.color || "__________"} <br />
          Số chỗ: {contract.vehicle?.seat || "____"} <br />
          Năm sản xuất: {contract.vehicle?.year || "____"}
        </Paragraph>

        <Paragraph>
          <Text underline>Tỷ lệ cổ phần đồng sở hữu:</Text> <br />
          Tỷ lệ chào bán: {contract.salePercentage || "____"}% <br />
          Tỷ lệ chủ xe giữ lại: {100 - (contract.salePercentage || 0)}%
        </Paragraph>

        <Paragraph>
          <Text underline>Thời hạn hợp đồng:</Text> <br />
          Ngày lập: {formatDate(contract.createdAt)} <br />
          Ngày hiệu lực: {formatDate(contract.startDate)} <br />
          Ngày kết thúc: {formatDate(contract.endDate)}
        </Paragraph>

        <Paragraph>
          <Text underline>Quyền và nghĩa vụ của các bên:</Text> <br />
          <Text strong>Bên A (Chủ xe):</Text> <br />
          - Cung cấp thông tin và giấy tờ xe chính xác. <br />
          - Cho phép hệ thống đăng tải thông tin xe để kêu gọi đồng sở hữu. <br />
          - Đảm bảo việc bảo dưỡng, sửa chữa định kỳ. <br />
          <br />
          <Text strong>Bên B (ECVs):</Text> <br />
          - Hỗ trợ quản lý cổ phần, hợp đồng và thanh toán. <br />
          - Đảm bảo an toàn dữ liệu, minh bạch trong chia sẻ lợi nhuận.
        </Paragraph>

        <Paragraph>
          <Text underline>Điều khoản về phí và doanh thu:</Text> <br />
          - Phí cố định: Theo bảng phí hệ thống. <br />
          - Phí biến đổi: Theo dữ liệu phát sinh thực tế. <br />
          - Doanh thu chia theo tỷ lệ cổ phần sau khi trừ phí vận hành.
        </Paragraph>

        <Paragraph>
          <Text underline>Điều khoản chấm dứt hợp đồng:</Text> <br />
          - Hợp đồng kết thúc khi hết hạn hoặc hai bên đồng ý. <br />
          - Bên A có quyền chấm dứt sớm nếu không vi phạm điều khoản. <br />
          - Tất cả dữ liệu cổ phần, thanh toán được lưu trữ theo quy định.
        </Paragraph>

        <Title level={5} className="contract-section">
          III. Cam kết và xác nhận
        </Title>
        <Paragraph>
          Hai bên cam kết thực hiện đúng các điều khoản trên. <br />
          Hợp đồng gồm 02 bản, mỗi bên giữ 01 bản có giá trị pháp lý như nhau.
        </Paragraph>

        <Paragraph style={{ textAlign: "right", marginTop: 24 }}>

          <i> Ngày lập: {formatDate(contract.createdAt)} </i>
        </Paragraph>

        <Row gutter={48} style={{ marginTop: 24, textAlign: "center" }}>
          <Col span={12}>
            <Text strong>ĐẠI DIỆN BÊN A (Chủ xe)</Text>
            <div style={{ marginTop: 60 }}>
              {contract.userSignature ? (
                <Image width={150} src={`${baseURL}${contract.userSignature}`} alt="user-sign" />
              ) : (
                <Text>(Ký, ghi rõ họ tên)</Text>
              )}
            </div>
          </Col>
          <Col span={12}>
            <Text strong>ĐẠI DIỆN BÊN B (Nền tảng ECVs)</Text>
            <div style={{ marginTop: 60 }}>
              {contract.adminSignature ? (
                <Image width={150} src={`${baseURL}${contract.adminSignature}`} alt="admin-sign" />
              ) : (
                <Text>(Ký, ghi rõ họ tên)</Text>
              )}
            </div>
          </Col>
        </Row>
      </Typography>
    </Modal>
  );
};

export default VehicleContract;
