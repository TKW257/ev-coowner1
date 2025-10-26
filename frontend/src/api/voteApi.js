// src/api/voteApi.js
import axiosClient from "./axiosClient";

const voteApi = {
  getAllTopics: () => axiosClient.get("/votes/viewAllTopic"),
  getUserTopics: () => axiosClient.get("/votes/viewTopicUser"),
  createTopic: (data) => axiosClient.post("/votes/topics", data),
  calculateResult: (topicId) =>
    axiosClient.post(`/votes/topics/${topicId}/calculate`),
  getVotesByTopic: (topicId) => axiosClient.get(`/votes/topic/${topicId}/find`),
};

export default voteApi;
