import axiosClient from "./axiosClient";

const voteApi = {
  // Lấy danh sách votes
  getAll: () => axiosClient.get("/votes"),

  // Lấy chi tiết 1 vote (kèm voters nếu cần)
  getDetail: (id) => axiosClient.get(`/votes/${id}?_embed=voters`),

  // ✅ Hàm tạo topic mới (sửa lỗi createTopic)
  createTopic: (data) => axiosClient.post("/votes", data),

  // Xóa, cập nhật
  update: (id, data) => axiosClient.put(`/votes/${id}`, data),
  delete: (id) => axiosClient.delete(`/votes/${id}`),
};

export default voteApi;
