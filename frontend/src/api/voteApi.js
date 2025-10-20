import axiosClient from "./axiosClient";

const voteApi = {
  createTopic: (data) => axiosClient.post("/votes/topics", data),
  getAllTopics: () => axiosClient.get("/votes/viewAllTopic"),
  calculateResult: (id) => axiosClient.post(`/votes/topics/${id}/calculate`),

  getUserTopics: () => axiosClient.get("/votes/viewTopicUser"),
  castVote: (data) => axiosClient.post("/votes/castVote", data),

  getVotesByTopic: (id) => axiosClient.get(`/votes/topics/${id}`),
};

export default voteApi;
