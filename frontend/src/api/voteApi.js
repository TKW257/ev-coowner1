import axiosClient from "./axiosClient";

// voteApi: API cho cả STAFF và USER
const voteApi = {
  // ===== STAFF =====
  createTopic: (data) => axiosClient.post("/votes/topics", data),
  getAllTopics: () => axiosClient.get("/votes/viewAllTopic"),
  calculateResult: (id) => axiosClient.post(`/votes/topics/${id}/calculate`),

  // ===== USER =====
  getUserTopics: async () => {
    // trả về danh sách topic mà user được phép vote
    try {
      const res = await axiosClient.get("/votes/viewTopicUser");
      // backend có thể trả array hoặc { data: [...] }
      return Array.isArray(res) ? res : res?.data ?? res?.content ?? [];
    } catch (err) {
      console.error("voteApi.getUserTopics failed:", err);
      return [];
    }
  },

  castVote: async (data) => {
    // data = { topicId, agree }
    try {
      const res = await axiosClient.post("/votes/castVote", data);
      return res;
    } catch (err) {
      console.error("voteApi.castVote failed:", err);
      throw err; // re-throw để component xử lý
    }
  },

  // ===== COMMON =====
  getVotesByTopic: (id) => axiosClient.get(`/votes/topics/${id}`),
};

export default voteApi;
