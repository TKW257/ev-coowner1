import React from "react";
import { Typography } from "antd";
import "./style.scss";

const { Title } = Typography;

const terms = [
  {
    title: "Initial Contribution",
    desc: "Each co-owner contributes a defined share of the EV’s total cost. The contribution determines ownership and revenue proportion.",
  },
  {
    title: "Usage Scheduling",
    desc: "Shared vehicles are booked via our app. Each owner gets fair usage hours per week, based on their ownership share.",
  },
  {
    title: "Maintenance & Insurance",
    desc: "All vehicles are insured and serviced regularly by certified EV specialists. Costs are shared proportionally.",
  },
  {
    title: "Revenue Sharing",
    desc: "When the EV is rented to third parties, profits are divided fairly based on your ownership share.",
  },
  {
    title: "Exit Policy",
    desc: "Owners can sell their share after a minimum lock-in period through our secure transfer system.",
  },
  {
    title: "Safety & Responsibility",
    desc: "All users must follow local EV laws and drive responsibly. Damages caused by negligence may affect your profit share.",
  },
];

const OurTerms = () => {
  return (
    <section className="our-terms">
      <div className="container">
        <Title level={2} className="title">
          Our Terms
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
