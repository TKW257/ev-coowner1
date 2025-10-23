import React from "react";

const StaffCheckingReport = ({ checking }) => {
  if (!checking) return <p>Không có dữ liệu biên bản.</p>;

  const formatTime = (timeArray) => {
    if (!Array.isArray(timeArray)) return "-";
    const [year, month, day, hour, minute, second] = timeArray;
    return `${day}/${month}/${year} ${hour}:${minute}:${second}`;
  };
  
  const reportTitle =
    checking.checkingType === "CheckOut"
      ? "BIÊN BẢN NHẬN XE"
      : "BIÊN BẢN GIAO XE";

  return (
    <div style={{ fontFamily: "Arial", padding: 24 }}>
      <h2
        style={{
          textAlign: "center",
          color: "#1890ff",
          marginBottom: 20,
          borderBottom: "2px solid #1890ff",
          paddingBottom: 10,
          textTransform: "uppercase",
        }}
      >
        {reportTitle}
      </h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: 20,
          fontSize: 14,
        }}
      >
        <tbody>
          <tr>
            <th style={thStyle}>Mã biên bản</th>
            <td style={tdStyle}>{checking.checkingId || checking.id || "-"}</td>
          </tr>
          <tr>
            <th style={thStyle}>Loại kiểm tra</th>
            <td style={tdStyle}>
              {checking.checkingType === "CheckIn" ? "Nhận xe" : "Giao xe"}
            </td>
          </tr>
          <tr>
            <th style={thStyle}>Xe</th>
            <td style={tdStyle}>{checking.vehicleModel}</td>
          </tr>
          <tr>
            <th style={thStyle}>Khách hàng</th>
            <td style={tdStyle}>{checking.userName}</td>
          </tr>
          <tr>
            <th style={thStyle}>Nhân viên</th>
            <td style={tdStyle}>{checking.staffName}</td>
          </tr>
          <tr>
            <th style={thStyle}>Thời gian kiểm tra</th>
            <td style={tdStyle}>{formatTime(checking.checkTime)}</td>
          </tr>
          <tr>
            <th style={thStyle}>Odo (km)</th>
            <td style={tdStyle}>{checking.odometer}</td>
          </tr>
          <tr>
            <th style={thStyle}>Phần trăm pin</th>
            <td style={tdStyle}>{checking.batteryPercent}%</td>
          </tr>
          <tr>
            <th style={thStyle}>Tình trạng hư hỏng</th>
            <td style={tdStyle}>{checking.damageReported ? "Có" : "Không"}</td>
          </tr>
          <tr>
            <th style={thStyle}>Ghi chú</th>
            <td style={tdStyle}>{checking.notes || "Không có"}</td>
          </tr>
        </tbody>
      </table>

      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: 30,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p>
            <strong>Chữ ký nhân viên</strong>
          </p>
          {checking.staffSignature ? (
            <img
              src={checking.staffSignature}
              alt="Staff Signature"
              style={{
                width: 150,
                border: "1px solid #ccc",
                borderRadius: 8,
              }}
            />
          ) : (
            <p>Không có chữ ký</p>
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          <p>
            <strong>Chữ ký khách hàng</strong>
          </p>
          {checking.userSignature ? (
            <img
              src={checking.userSignature}
              alt="User Signature"
              style={{
                width: 150,
                border: "1px solid #ccc",
                borderRadius: 8,
              }}
            />
          ) : (
            <p>Không có chữ ký</p>
          )}
        </div>
      </div>
    </div>
  );
};

const thStyle = {
  border: "1px solid #ccc",
  background: "#f5f5f5",
  textAlign: "left",
  padding: "8px",
  width: "30%",
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};

export default StaffCheckingReport;
