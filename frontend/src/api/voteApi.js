import axiosClient from "../api/axiosClient";

const voteApi = {
  // STAFF
  createTopic(data) {
    return axiosClient.post("/votes/topics", data);
  },

  getAllTopics() {
    return axiosClient.get("/votes/viewAllTopic");
  },

  calculateResult(id) {
    return axiosClient.post(`/votes/topics/${id}/calculate`);
  },

  // USER
  getUserTopics() {
    return axiosClient.get("/votes/viewTopicUser");
  },

  castVote(data) {
    return axiosClient.post("/votes/castVote", data);
  },

  // COMMON
  getVotesByTopic(id) {
    return axiosClient.get(`/votes/topics/${id}`);
  },
};

export default voteApi;
