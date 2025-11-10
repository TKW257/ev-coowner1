import React from "react";
import {
  Modal,
  Button,
  Divider,
  Typography,
  Row,
  Col,
  Image,
  message,
} from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import "./style.scss";

const { Title, Text, Paragraph } = Typography;

const OwnerContract = ({ contract, visible, onClose, baseURL }) => {
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
    link.download = `HopDongDongSoHuu_${contract.ownerContractId}.pdf`;
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
        <Button
          key="download"
          icon={<DownloadOutlined />}
          onClick={handleDownload}
        >
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
            HỢP ĐỒNG ĐỒNG SỞ HỮU XE ĐIỆN
          </Title>
        </div>
      }
    >
      <Typography>
        {/* I. THÔNG TIN CÁC BÊN */}
        <Title level={5} className="contract-section">
          I. THÔNG TIN CÁC BÊN
        </Title>
        <Paragraph>
          <Text strong>BÊN A (Nền tảng ECVs):</Text> <br />
          Đại diện: {contract.admin?.fullName || "________________"} <br />
          Chức vụ: Quản Trị Viên <br />
          Mã hợp đồng chính: {contract.contractId || "________________"} <br />
          Email: {contract.admin?.email || "________________"} <br />
          Số điện thoại: {contract.admin?.phone || "____________________"} <br />
          CCCD: {contract.admin?.cccd || "____________________"}
        </Paragraph>

        <Paragraph>
          <Text strong>BÊN B (Thành viên đồng sở hữu):</Text> <br />
          Họ và tên: {contract.user?.fullName || "________________"} <br />
          Email: {contract.user?.email || "________________"} <br />
          Số điện thoại: {contract.user?.phone || "____________________"} <br />
          CCCD: {contract.user?.cccd || "____________________"} <br />
          Tỷ lệ cổ phần mua: {contract.sharePercentage || "____"}% <br />
          Ngày tham gia: {formatDate(contract.createdAt)}
        </Paragraph>

        {/* II. THÔNG TIN HỢP ĐỒNG CON */}
        <Title level={5} className="contract-section">
          II. THÔNG TIN HỢP ĐỒNG CON
        </Title>
        <Paragraph>
          <Text strong>1. Thông tin hành chính của hợp đồng:</Text> <br />
          Mã hợp đồng đồng sở hữu: {contract.ownerContractId || "__________"} <br />
          Tham chiếu hợp đồng chính: {contract.contractId || "__________"} <br />
          Ngày tạo: {formatDate(contract.createdAt)}
        </Paragraph>

        <Paragraph>
          <Text strong>2. Thông tin xe được đăng ký đồng sở hữu:</Text> <br />
          Hãng xe: {contract.vehicle?.brand || "__________"} <br />
          Mẫu xe: {contract.vehicle?.model || "__________"} <br />
          Biển số: {contract.vehicle?.plateNumber || "__________"} <br />
          Màu xe: {contract.vehicle?.color || "__________"} <br />
          Số chỗ: {contract.vehicle?.seat || "____"} <br />
          Năm sản xuất: {contract.vehicle?.year || "____"}
        </Paragraph>

        {/* III. QUYỀN VÀ NGHĨA VỤ */}
        <Title level={5} className="contract-section">
          III. QUYỀN VÀ NGHĨA VỤ CỦA CÁC BÊN
        </Title>
        <Paragraph>
          <Text strong>1. Bên A (Nền tảng ECVs):</Text> <br />
          - Cung cấp quyền sử dụng cổ phần xe cho Bên B theo phần trăm đã thỏa thuận. <br />
          - Hỗ trợ việc chuyển nhượng, chia lợi nhuận theo chính sách của hệ thống.
        </Paragraph>
        <Paragraph>
          <Text strong>2. Bên B (Đồng sở hữu):</Text> <br />
          - Thanh toán đủ phần vốn góp tương ứng tỷ lệ cổ phần. <br />
          - Được hưởng lợi nhuận tương ứng với tỷ lệ sở hữu sau khi trừ chi phí. <br />
          - Chấp hành quy định về bảo dưỡng, vận hành xe theo quy định hệ thống.
        </Paragraph>

        {/* IV. CHẤM DỨT HỢP ĐỒNG */}
        <Title level={5} className="contract-section">
          IV. CHẤM DỨT HỢP ĐỒNG
        </Title>
        <Paragraph>
          - Hợp đồng hết hiệu lực khi cổ phần được chuyển nhượng hoặc hợp đồng chính chấm dứt. <br />
          - Hệ thống ECVs tự động lưu lại lịch sử giao dịch trong mục <i>Ownership History</i>.
        </Paragraph>

        {/* V. CAM KẾT */}
        <Title level={5} className="contract-section">
          V. CAM KẾT
        </Title>
        <Paragraph>
          Hai bên đồng ý với toàn bộ điều khoản và cam kết tuân thủ các quy định của hệ thống. <br />
          Hợp đồng có hiệu lực kể từ ngày ký.
        </Paragraph>

        <Paragraph style={{ textAlign: "right", marginTop: 24 }}>
          <i> Ngày lập: {formatDate(contract.createdAt)} </i>
        </Paragraph>

        {/* Chữ ký */}
        <Row gutter={48} style={{ marginTop: 32, textAlign: "center" }}>
          <Col span={12}>
            <Text strong>ĐẠI DIỆN BÊN A (Chủ xe)</Text>
            <div style={{ marginTop: 60 }}>
              {contract.adminSignature ? (
                <Image
                  width={150}
                  src={`${baseURL}${contract.adminSignature}`}
                  alt="admin-sign"
                />
              ) : (
                <Text>(Ký, ghi rõ họ tên)</Text>
              )}
            </div>
          </Col>

          <Col span={12}>
            <Text strong>ĐẠI DIỆN BÊN B (Đồng sở hữu)</Text>
            <div style={{ marginTop: 60 }}>
              {contract.userSignature ? (
                <Image
                  width={150}
                  src={`${baseURL}${contract.userSignature}`}
                  alt="user-sign"
                />
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

export default OwnerContract;
