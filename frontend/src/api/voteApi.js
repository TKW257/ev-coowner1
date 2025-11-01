import axiosClient from "../api/axiosClient";

const voteApi = {
  // STAFF
  createTopic: (data) => {
    console.log("[VOTE API] REQUEST - createTopic:", data);
    return axiosClient.post("/votes/topics", data).then(res => {
      console.log("[VOTE API] RESPONSE - createTopic:", res);
      return res;
    });
  },
  getAllTopics: () => {
    console.log("[VOTE API] REQUEST - getAllTopics");
    return axiosClient.get("/votes/viewAllTopic").then(res => {
      console.log("[VOTE API] RESPONSE - getAllTopics:", res);
      return res;
    });
  },
  calculateResult: (id) => {
    console.log("[VOTE API] REQUEST - calculateResult, topicId:", id);
    return axiosClient.post(`/votes/topics/${id}/calculate`).then(res => {
      console.log("[VOTE API] RESPONSE - calculateResult:", res);
      return res;
    });
  },

  // USER
  getUserTopics: () => {
    console.log("[VOTE API] REQUEST - getUserTopics");
    return axiosClient.get("/votes/viewTopicUser").then(res => {
      console.log("[VOTE API] RESPONSE - getUserTopics:", res);
      return res;
    });
  },
  castVote: (data) => {
    console.log("[VOTE API] REQUEST - castVote:", data);
    return axiosClient.post("/votes/castVote", data).then(res => {
      console.log("[VOTE API] RESPONSE - castVote:", res);
      return res;
    });
  },

  // Common
  getVotesByTopic: (id) => {
    console.log("[VOTE API] REQUEST - getVotesByTopic, topicId:", id);
    return axiosClient.get(`/votes/topics/${id}`).then(res => {
      console.log("[VOTE API] RESPONSE - getVotesByTopic:", res);
      return res;
    });
  },
};

export default voteApi;
