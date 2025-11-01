import React from "react";

const StaffCheckingReport = ({ checking }) => {
  const BASE_URL = "https://vallate-enzootically-sterling.ngrok-free.dev";

  if (!checking || typeof checking !== "object") {
    return <p>Không có dữ liệu biên bản.</p>;
  }

  const formatTime = (timeArray) => {
    if (!Array.isArray(timeArray)) return "-";
    const [year, month, day, hour, minute, second] = timeArray;
    const mm = String(minute).padStart(2, "0");
    const ss = String(second).padStart(2, "0");
    return `${day}/${month}/${year} ${hour}:${mm}:${ss}`;
  };

  const formatNumber = (value, digits = 1) => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "number" && !Number.isNaN(value)) {
      return Number(value).toFixed(digits);
    }
    return value;
  };

  const reportTitle =
    checking.checkingType === "CheckOut"
      ? "BIÊN BẢN BÀN GIAO XE"
      : "BIÊN BẢN NHẬN XE";

  const buildUrl = (path) => {
    if (!path) return null;
    return path.startsWith("http")
      ? path
      : `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  };

  const staffSignatureUrl = buildUrl(checking.staffSignature);
  const userSignatureUrl = buildUrl(checking.userSignature);

  const handleImageError = (e, type) => {
    e.target.style.display = "none";
    const text = document.createElement("p");
    text.innerText = `Không tải được chữ ký ${type}`;
    text.style.color = "red";
    e.target.parentNode.appendChild(text);
  };

  return (
    <div style={styles.paper}>
      {/* Quốc hiệu */}
      <div style={styles.header}>
        <div style={styles.national}>
          <p style={styles.bold}>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p style={styles.italic}>Độc lập - Tự do - Hạnh phúc</p>
          <hr style={{ width: "100%", border: "1px solid #000" }} />
        </div>
      </div>

      {/* Tiêu đề */}
      <h2 style={styles.title}>{reportTitle}</h2>
      <p style={styles.subTitle}>
        (Ngày lập biên bản: {formatTime(checking.checkTime)})
      </p>

      {/* Nội dung */}
      <p style={styles.text}>
        Hôm nay, ngày <b>{formatTime(checking.checkTime)}</b>, chúng tôi gồm có:
      </p>

      <p style={styles.text}>
        <b>1. BÊN GIAO (Nhân viên):</b> {checking.staffName || "-"}
      </p>
      <p style={styles.text}>
        <b>2. BÊN NHẬN (Khách hàng):</b> {checking.userName || "-"}
      </p>

      <p style={styles.text}>
        Hai bên cùng tiến hành {checking.checkingType === "CheckOut" ? "bàn giao" : "nhận"} phương tiện
        theo thông tin sau:
      </p>

      {/* Bảng thông tin xe */}
      <table style={styles.table}>
        <tbody>
          <tr>
            <th style={styles.th}>Mã biên bản</th>
            <td style={styles.td}>{checking.checkingId || "-"}</td>
          </tr>
          <tr>
            <th style={styles.th}>Tên xe</th>
            <td style={styles.td}>{checking.vehicleModel || "-"}</td>
          </tr>
          <tr>
            <th style={styles.th}>Số Odo (km)</th>
            <td style={styles.td}>{formatNumber(checking.odometer, 1)}</td>
          </tr>
          <tr>
            <th style={styles.th}>Mức pin hiện tại (%)</th>
            <td style={styles.td}>
              {checking.batteryPercent === null || checking.batteryPercent === undefined
                ? "-"
                : `${formatNumber(checking.batteryPercent, 1)}%`}
            </td>
          </tr>

          {checking.checkingType === "CheckIn" && (
            <>
              <tr>
                <th style={styles.th}>Quãng đường đã đi (km)</th>
                <td style={styles.td}>
                  {checking.distanceTraveled === null ||
                  checking.distanceTraveled === undefined
                    ? "-"
                    : `${formatNumber(checking.distanceTraveled, 1)} km`}
                </td>
              </tr>
              <tr>
                <th style={styles.th}>Pin đã sử dụng (%)</th>
                <td style={styles.td}>
                  {checking.batteryUsedPercent === null ||
                  checking.batteryUsedPercent === undefined
                    ? "-"
                    : `${formatNumber(checking.batteryUsedPercent, 1)}%`}
                </td>
              </tr>
            </>
          )}

          <tr>
            <th style={styles.th}>Tình trạng hư hỏng</th>
            <td style={styles.td}>{checking.damageReported ? "Có" : "Không"}</td>
          </tr>
          <tr>
            <th style={styles.th}>Ghi chú</th>
            <td style={styles.td}>{checking.notes || "Không có"}</td>
          </tr>
        </tbody>
      </table>

      <p style={styles.text}>
        Hai bên đã kiểm tra thực tế phương tiện và xác nhận thông tin trên là
        chính xác. Biên bản được lập thành <b>02 bản</b>, mỗi bên giữ <b>01 bản</b>,
        có giá trị pháp lý như nhau.
      </p>

      {/* Chữ ký */}
      <div style={styles.signContainer}>
        <div style={styles.signBox}>
          <p style={styles.signLabel}>ĐẠI DIỆN BÊN GIAO</p>
          <p>(Ký, ghi rõ họ tên)</p>
          {staffSignatureUrl ? (
            <img
              src={staffSignatureUrl}
              alt="Chữ ký nhân viên"
              style={styles.signImage}
              onError={(e) => handleImageError(e, "nhân viên")}
            />
          ) : (
            <p style={styles.noSign}>Không có chữ ký</p>
          )}
          <p style={{ marginTop: 8, fontWeight: "bold" }}>
            {checking.staffName || "-"}
          </p>
        </div>

        <div style={styles.signBox}>
          <p style={styles.signLabel}>ĐẠI DIỆN BÊN NHẬN</p>
          <p>(Ký, ghi rõ họ tên)</p>
          {userSignatureUrl ? (
            <img
              src={userSignatureUrl}
              alt="Chữ ký khách hàng"
              style={styles.signImage}
              onError={(e) => handleImageError(e, "khách hàng")}
            />
          ) : (
            <p style={styles.noSign}>Không có chữ ký</p>
          )}
          <p style={{ marginTop: 8, fontWeight: "bold" }}>
            {checking.userName || "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  paper: {
    fontFamily: "Times New Roman, serif",
    padding: "40px 60px",
    background: "#fff",
    color: "#000",
    lineHeight: 1.6,
    border: "1px solid #ccc",
    borderRadius: 8,
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
  },
  national: {
    textAlign: "center",
  },
  bold: {
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  italic: {
    fontStyle: "italic",
  },
  title: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "bold",
    margin: "10px 0",
    textTransform: "uppercase",
  },
  subTitle: {
    textAlign: "center",
    marginBottom: 20,
    fontStyle: "italic",
  },
  text: {
    fontSize: 15,
    margin: "6px 0",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    margin: "20px 0",
    fontSize: 15,
  },
  th: {
    border: "1px solid #000",
    padding: "8px 10px",
    background: "#f9f9f9",
    width: "35%",
    textAlign: "left",
  },
  td: {
    border: "1px solid #000",
    padding: "8px 10px",
  },
  signContainer: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 40,
    flexWrap: "wrap",
  },
  signBox: {
    width: "45%",
    textAlign: "center",
    minWidth: 250,
  },
  signLabel: {
    fontWeight: "bold",
  },
  signImage: {
    width: 200,
    height: "auto",
    marginTop: 10,
  },
  noSign: {
    color: "#999",
    fontStyle: "italic",
  },
};

export default StaffCheckingReport;
