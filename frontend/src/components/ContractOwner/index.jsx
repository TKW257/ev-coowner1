import { Modal, Button, Divider, Typography, Row, Col, Image } from "antd";
import "./style.scss";

const { Title, Text, Paragraph } = Typography;

const OwnerContract = ({ contract, visible, onClose, baseURL }) => {
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
        <Button key="print" onClick={() => window.print()}>
          In hợp đồng
        </Button>,
        <Button key="close" type="primary" onClick={onClose}>
          Đóng
        </Button>,
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
          <Title level={4} className="contract-title">
            HỢP ĐỒNG ĐỒNG SỞ HỮU XE ĐIỆN
          </Title>
          <Text type="secondary">Số: {contract.ownerContractId || "_____/HĐDSH"}</Text>
        </div>
      }
    >
      <Typography style={{ textAlign: "justify" }}>
        <Paragraph>
          Căn cứ Bộ luật Dân sự năm 2015 và các quy định pháp luật hiện hành;<br />
          Căn cứ nhu cầu và thỏa thuận giữa các bên, hôm nay, chúng tôi gồm:
        </Paragraph>

        {/* Điều 1 */}
        <Title level={5}>Điều 1. Thông tin các bên</Title>
        <Paragraph>
          <Text strong>Bên A (Nền tảng CoEV):</Text><br />
          Đại diện: {contract.admin?.fullName || "________________"}<br />
          Chức vụ: Quản Trị Viên<br />
          Mã hợp đồng chính: {contract.contractId || "________________"}<br />
          Email: {contract.admin?.email || "________________"}<br />
          Số điện thoại: {contract.admin?.phone || "________________"}<br />
          CCCD: {contract.admin?.cccd || "________________"}
        </Paragraph>

        <Paragraph>
          <Text strong>Bên B (Thành viên đồng sở hữu):</Text><br />
          Họ và tên: {contract.user?.fullName || "________________"}<br />
          Email: {contract.user?.email || "________________"}<br />
          Số điện thoại: {contract.user?.phone || "________________"}<br />
          CCCD: {contract.user?.cccd || "________________"}<br />
          Tỷ lệ cổ phần mua: {contract.sharePercentage || "____"}%<br />
          Ngày tham gia: {formatDate(contract.createdAt)}
        </Paragraph>

        {/* Điều 2 */}
        <Title level={5}>Điều 2. Thông tin hợp đồng đồng sở hữu</Title>
        <Paragraph>
          <Text strong>1. Thông tin hành chính:</Text><br />
          - Mã hợp đồng đồng sở hữu: {contract.ownerContractId || "__________"}<br />
          - Tham chiếu hợp đồng chính: {contract.contractId || "__________"}<br />
          - Ngày tạo hợp đồng: {formatDate(contract.createdAt)}
        </Paragraph>

        <Paragraph>
          <Text strong>2. Thông tin phương tiện đồng sở hữu:</Text><br />
          - Hãng xe: {contract.vehicle?.brand || "__________"}<br />
          - Mẫu xe: {contract.vehicle?.model || "__________"}<br />
          - Biển số: {contract.vehicle?.plateNumber || "__________"}<br />
          - Màu xe: {contract.vehicle?.color || "__________"}<br />
          - Số chỗ: {contract.vehicle?.seat || "____"}<br />
          - Năm sản xuất: {contract.vehicle?.year || "____"}
        </Paragraph>

        {/* Điều 3 */}
        <Title level={5}>Điều 3. Phí, chi phí và phân chia doanh thu</Title>
        <Paragraph>
          - Phí cố định:
          <ul style={{ marginLeft: 24 }}>
            <li>Bảo hiểm: {formatCurrency(contract.insurance)} VNĐ</li>
            <li>Đăng ký xe: {formatCurrency(contract.registration)} VNĐ</li>
            <li>Bảo dưỡng định kỳ: {formatCurrency(contract.maintenance)} VNĐ</li>
            <li>Vệ sinh xe: {formatCurrency(contract.cleaning)} VNĐ</li>
            <li>Chi phí vận hành hàng tháng: {formatCurrency(contract.operationPerMonth)} VNĐ</li>
          </ul>
          - Phí biến đổi: Theo dữ liệu phát sinh thực tế.<br />
          - Doanh thu được chia cho các bên theo tỷ lệ cổ phần sau khi trừ toàn bộ chi phí vận hành.
        </Paragraph>

        {/* Điều 4 */}
        <Title level={5}>Điều 4. Quyền và nghĩa vụ của các bên</Title>
        <Paragraph>
          <Text underline>Bên A (Nền tảng CoEV):</Text><br />
          - Quản lý, vận hành hệ thống và dữ liệu cổ phần.<br />
          - Cung cấp quyền sử dụng cổ phần xe cho Bên B theo tỷ lệ đã thỏa thuận.<br />
          - Hỗ trợ việc chuyển nhượng, chia lợi nhuận, và đảm bảo tính minh bạch trong hoạt động.
        </Paragraph>

        <Paragraph>
          <Text underline>Bên B (Đồng sở hữu):</Text><br />
          - Thanh toán đủ phần vốn góp tương ứng tỷ lệ cổ phần.<br />
          - Được hưởng lợi nhuận tương ứng tỷ lệ sở hữu sau khi trừ chi phí.<br />
          - Tuân thủ các quy định về bảo dưỡng, vận hành, và chính sách nội bộ của CoEV.
        </Paragraph>

        {/* Điều 5 */}
        <Title level={5}>Điều 5. Chấm dứt hợp đồng</Title>
        <Paragraph>
          - Hợp đồng chấm dứt khi cổ phần được chuyển nhượng hoặc hợp đồng chính hết hiệu lực.<br />
          - Trong trường hợp chấm dứt sớm, các quyền và nghĩa vụ phát sinh đến thời điểm chấm dứt vẫn được thực hiện đầy đủ.<br />
          - Hệ thống CoEV sẽ lưu trữ toàn bộ dữ liệu giao dịch trong mục <i>Ownership History</i>.
        </Paragraph>

        {/* Điều 6 */}
        <Title level={5}>Điều 6. Giải quyết tranh chấp</Title>
        <Paragraph>
          Mọi tranh chấp phát sinh trong quá trình thực hiện hợp đồng sẽ được hai bên ưu tiên giải quyết bằng thương lượng. 
          Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại <b>Tòa án có thẩm quyền tại TP. Hồ Chí Minh</b>.
        </Paragraph>

        {/* Điều 7 */}
        <Title level={5}>Điều 7. Hiệu lực hợp đồng</Title>
        <Paragraph>
          Hợp đồng có hiệu lực kể từ ngày {formatDate(contract.createdAt)} 
          và chấm dứt khi hợp đồng chính hết hiệu lực hoặc khi các bên thống nhất chấm dứt bằng văn bản.<br />
          Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản, có giá trị pháp lý như nhau.
        </Paragraph>

        {/* Chữ ký */}
        <Paragraph style={{ textAlign: "right", marginTop: 24 }}>
          Lập tại: TP. Hồ Chí Minh, ngày {formatDate(contract.createdAt)}
        </Paragraph>

        <Row gutter={48} style={{ marginTop: 32, textAlign: "center" }}>
          <Col span={12}>
            <Text strong>ĐẠI DIỆN BÊN A (Nền tảng CoEV)</Text>
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
