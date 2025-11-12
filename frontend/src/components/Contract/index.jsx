import { Modal, Button, Divider, Typography, Row, Col, Image } from "antd";
import "./style.scss";

const { Title, Text, Paragraph } = Typography;

const VehicleContract = ({ contract, visible, onClose, baseURL }) => {
  if (!contract) return null;

  const formatDate = (arr) => {
    if (!arr || arr.length < 3) return "N/A";
    const [y, m, d] = arr;
    return `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y}`;
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "____") return "____";
    const numValue = typeof value === "string" ? parseFloat(value.replace(/,/g, "")) : value;
    if (isNaN(numValue)) return "____";
    return numValue.toLocaleString("vi-VN");
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width={900}
      centered
      rootClassName="contract-modal"
      footer={[
        <Button key="print" onClick={() => window.print()}>In hợp đồng</Button>,
        <Button key="close" type="primary" onClick={onClose}>Đóng</Button>,
      ]}
      title={
        <div className="contract-header" style={{ textAlign: "center" }}>
          <Image
            preview={false}
            src="/assets/vn_emblem.png"
            width={60}
            style={{ marginBottom: 8 }}
          />
          <Text strong className="contract-national" style={{ display: "block" }}>
            CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
          </Text>
          <Text className="contract-motto">Độc lập - Tự do - Hạnh phúc</Text>
          <Divider className="contract-divider" />
          <Title level={4} style={{ marginBottom: 0 }}>
            HỢP ĐỒNG HỢP TÁC KINH DOANH XE ĐIỆN
          </Title>
          <Text type="secondary">
            Số: {contract.contractId || "_____/HĐHTKD"}
          </Text>
        </div>
      }
    >
      <Typography style={{ textAlign: "justify" }}>
        <Paragraph>
          Căn cứ Bộ luật Dân sự năm 2015 và các quy định pháp luật hiện hành;
          Căn cứ nhu cầu và khả năng của hai bên, hôm nay chúng tôi gồm có:
        </Paragraph>

        {/* Điều 1 */}
        <Title level={5} className="contract-section">Điều 1. Thông tin các bên</Title>
        <Paragraph>
          <Text strong>Bên A (Chủ xe):</Text><br />
          Họ và tên: {contract.user?.fullName || "____________________"}<br />
          Email: {contract.user?.email || "____________________"}<br />
          Số điện thoại: {contract.user?.phone || "____________________"}<br />
          CCCD: {contract.user?.cccd || "____________________"}<br />
        </Paragraph>

        <Paragraph>
          <Text strong>Bên B (Nền tảng CoEv):</Text><br />
          Đại diện: {contract.admin?.fullName || "____________________"}<br />
          Chức vụ: Quản Trị Viên<br />
          Email: {contract.admin?.email || "____________________"}<br />
          Số điện thoại: {contract.admin?.phone || "____________________"}<br />
          CCCD: {contract.admin?.cccd || "____________________"}<br />
        </Paragraph>

        {/* Điều 2 */}
        <Title level={5}>Điều 2. Đối tượng hợp đồng</Title>
        <Paragraph>
          Hai bên thống nhất hợp tác kinh doanh đối với phương tiện xe điện có thông tin như sau:
          <ul style={{ marginLeft: 24 }}>
            <li>Hãng xe: {contract.vehicle?.brand || "__________"}</li>
            <li>Mẫu xe: {contract.vehicle?.model || "__________"}</li>
            <li>Biển số: {contract.vehicle?.plateNumber || "__________"}</li>
            <li>Màu xe: {contract.vehicle?.color || "__________"}</li>
            <li>Số chỗ: {contract.vehicle?.seat || "____"}</li>
            <li>Năm sản xuất: {contract.vehicle?.year || "____"}</li>
          </ul>
        </Paragraph>

        {/* Điều 3 */}
        <Title level={5}>Điều 3. Tỷ lệ sở hữu và chia sẻ lợi nhuận</Title>
        <Paragraph>
          - Tỷ lệ chào bán: {contract.salePercentage || "____"}%<br />
          - Tỷ lệ chủ xe giữ lại: {100 - (contract.salePercentage || 0)}%<br />
          Doanh thu từ hoạt động kinh doanh xe được phân chia theo tỷ lệ cổ phần sau khi trừ các chi phí vận hành.
        </Paragraph>

        {/* Điều 4 */}
        <Title level={5}>Điều 4. Thời hạn và hiệu lực hợp đồng</Title>
        <Paragraph>
          - Ngày lập hợp đồng: {formatDate(contract.createdAt)}<br />
          - Ngày bắt đầu hiệu lực: {formatDate(contract.startDate)}<br />
          - Ngày kết thúc: {formatDate(contract.endDate)}<br />
          Sau khi hết hạn, hai bên có thể gia hạn bằng phụ lục hợp đồng mới.
        </Paragraph>

        {/* Điều 5 */}
        <Title level={5}>Điều 5. Phí và chi phí liên quan</Title>
        <Paragraph>
          <ul style={{ marginLeft: 24 }}>
            <li>Bảo hiểm: {formatCurrency(contract.insurance)} VNĐ</li>
            <li>Đăng ký xe: {formatCurrency(contract.registration)} VNĐ</li>
            <li>Bảo dưỡng định kỳ: {formatCurrency(contract.maintenance)} VNĐ</li>
            <li>Vệ sinh xe: {formatCurrency(contract.cleaning)} VNĐ</li>
            <li>Chi phí vận hành hàng tháng: {formatCurrency(contract.operationPerMonth)} VNĐ</li>
          </ul>
          Các khoản phí biến đổi sẽ được tính theo dữ liệu thực tế phát sinh trong quá trình sử dụng.
        </Paragraph>

        {/* Điều 6 */}
        <Title level={5}>Điều 6. Quyền và nghĩa vụ của các bên</Title>
        <Paragraph>
          <Text underline>Bên A (Chủ xe):</Text><br />
          - Cung cấp giấy tờ và thông tin chính xác về xe.<br />
          - Duy trì tình trạng kỹ thuật và bảo dưỡng xe theo quy định.<br />
          - Phối hợp với Bên B trong việc quản lý, khai thác xe.<br /><br />

          <Text underline>Bên B (CoEv):</Text><br />
          - Quản lý, vận hành hệ thống chia sẻ cổ phần minh bạch.<br />
          - Bảo đảm quyền lợi của các nhà đồng sở hữu và chủ xe.<br />
          - Cung cấp dữ liệu, báo cáo doanh thu định kỳ.
        </Paragraph>

        {/* Điều 7 */}
        <Title level={5}>Điều 7. Chấm dứt hợp đồng</Title>
        <Paragraph>
          - Hợp đồng tự động chấm dứt khi hết hạn hoặc theo thỏa thuận bằng văn bản của hai bên.<br />
          - Bên A có quyền yêu cầu chấm dứt sớm nếu Bên B vi phạm điều khoản.<br />
          - Các nghĩa vụ tài chính phát sinh trước thời điểm chấm dứt vẫn phải hoàn tất.
        </Paragraph>

        {/* Điều 8 */}
        <Title level={5}>Điều 8. Giải quyết tranh chấp</Title>
        <Paragraph>
          Mọi tranh chấp phát sinh trong quá trình thực hiện hợp đồng sẽ được hai bên ưu tiên giải quyết bằng thương lượng. 
          Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại <b>Tòa án có thẩm quyền tại TP. Hồ Chí Minh</b>.
        </Paragraph>

        {/* Điều 9 */}
        <Title level={5}>Điều 9. Hiệu lực hợp đồng</Title>
        <Paragraph>
          Hợp đồng có hiệu lực kể từ ngày {formatDate(contract.startDate)} đến ngày {formatDate(contract.endDate)}. 
          Hợp đồng gồm 02 bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản.
        </Paragraph>

        {/* Ngày lập và chữ ký */}
        <Paragraph style={{ textAlign: "right", marginTop: 24 }}>
          Lập tại: TP. Hồ Chí Minh, ngày {formatDate(contract.createdAt)}
        </Paragraph>

        <Row gutter={48} style={{ marginTop: 32, textAlign: "center" }}>
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
            <Text strong>ĐẠI DIỆN BÊN B (Nền tảng CoEv)</Text>
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
