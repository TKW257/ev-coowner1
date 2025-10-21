import React from "react";
import { Typography } from "antd";
import "./style.scss";

const { Title } = Typography;

const terms = [
  {
    title: "Khoản Góp Ban Đầu",
    desc: "Mỗi thành viên đồng sở hữu đóng góp một phần chi phí để sử dụng xe điện do công ty cung cấp. Tỷ lệ góp vốn xác định quyền sử dụng xe tương ứng.",
  },
  {
    title: "Lịch Sử Dụng Xe",
    desc: "Xe được đặt lịch thông qua ứng dụng của chúng tôi. Mỗi thành viên được phân bổ thời gian sử dụng công bằng mỗi tuần, dựa trên tỷ lệ sở hữu.",
  },
  {
    title: "Bảo Dưỡng & Bảo Hiểm",
    desc: "Toàn bộ xe đều được công ty bảo hiểm và bảo dưỡng định kỳ bởi đội ngũ kỹ thuật viên chuyên nghiệp, đảm bảo an toàn và chất lượng vận hành tốt nhất.",
  },
  {
    title: "Quản Lý & Vận Hành",
    desc: "Công ty chịu trách nhiệm quản lý, lưu trữ dữ liệu sử dụng và hỗ trợ kỹ thuật. Mọi thông tin đều minh bạch và có thể theo dõi qua ứng dụng.",
  },
  {
    title: "Chính Sách Thành Viên",
    desc: "Các thành viên đồng sở hữu cần tuân thủ quy định sử dụng xe, đảm bảo công bằng và tôn trọng lịch đặt xe của những người khác.",
  },
  {
    title: "An Toàn & Trách Nhiệm",
    desc: "Người sử dụng phải tuân thủ luật giao thông và quy định vận hành xe điện. Mọi thiệt hại do vi phạm hoặc bất cẩn sẽ do người sử dụng chịu trách nhiệm.",
  },
];


const OurTerms = () => {
  return (
    <section className="our-terms">
      <div className="container">
        <Title level={2} className="title">
          Điều Khoản Của Chúng Tôi
        </Title>

        <div className="terms-grid">
          {terms.map((term, index) => (
            <div key={index} className="term-card">
              <h3>{term.title}</h3>
              <p>{term.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurTerms;
