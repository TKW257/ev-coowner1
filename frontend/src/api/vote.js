import axiosClient from "./axiosClient";
const voteApi = {
  createVote: (data) => axiosClient.post("/votes", data),
};
