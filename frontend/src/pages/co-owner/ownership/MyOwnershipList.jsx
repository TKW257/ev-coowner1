import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOwnerships } from "../../../features/ownership/ownershipSlice";

const MyOwnershipList = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.ownership);

  useEffect(() => {
    dispatch(fetchMyOwnerships());
  }, [dispatch]);

  if (loading) return <p>Đang tải dữ liệu...</p>;
  if (error) return <p style={{ color: "red" }}>Lỗi: {error}</p>;

  // ✅ Chống lỗi map is not a function
  if (!Array.isArray(list)) {
    console.warn("⚠️ ownership list không phải mảng:", list);
    return <p>Dữ liệu không hợp lệ hoặc rỗng.</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        🚗 Danh sách xe bạn đồng sở hữu
      </h2>

      {list.length === 0 ? (
        <p>Chưa có quyền sở hữu nào.</p>
      ) : (
        <table className="min-w-full border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2">Xe</th>
              <th className="border px-3 py-2">% Cổ phần</th>
              <th className="border px-3 py-2">Trạng thái</th>
              <th className="border px-3 py-2">Ngày tạo</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.ownershipId}>
                <td className="border px-3 py-2">{o.vehicleName}</td>
                <td className="border px-3 py-2">{o.totalSharePercentage}%</td>
                <td className="border px-3 py-2">{o.status}</td>
                <td className="border px-3 py-2">
                  {new Date(o.createdAt).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyOwnershipList;
