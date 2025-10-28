import axiosClient from "../api/axiosClient";

const voteApi = {
  // ADMIN
  createTopic: (data) => axiosClient.post("/votes/topics", data),
  getAllTopics: () => axiosClient.get("/votes/viewAllTopic"),
  calculateResult: (id) => axiosClient.post(`/votes/topics/${id}/calculate`),

  // USER
  getUserTopics: () => axiosClient.get("/votes/viewTopicUser"),
  castVote: (data) => axiosClient.post("/votes/castVote", data),

  // Common
  getVotesByTopic: (id) => axiosClient.get(`/votes/topics/${id}`),
};

export default voteApi;
