import axios from "axios";
import { BASE_API_URL } from "../config.js";

// Crea istanza axios per Match
const api = axios.create({
  baseURL: `${BASE_API_URL}/sessions`, // usa la variabile globale
  headers: {
    "Content-Type": "application/json"
  }
});

// Funzioni helper
export const createSession = (sessionStartTime, nPlayer, playersList) => api.post("", {sessionStartTime, nPlayer, playersList});
export const getSessionInfoFromId = (id) =>  api.get(`/${id}`);
export const getCumulativeSessionScore = (id) => api.get(`/${id}/scores/sum`);
export const endSession = (id,sessionWinners,sessionEndTime) => api.post(`/${id}/end`, { sessionWinners, sessionEndTime });
export const getAllSession = () => api.get("");

export const getPlayersList = (id) => api.get(`/${id}/playersList`);