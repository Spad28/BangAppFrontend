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
export const createSession = (sessionStartTime, nPlayer) => api.post("", {sessionStartTime, nPlayer});
export const getSessionInfoFromId = (id) =>  api.get(`/${id}`);
export const getCumulativeSessionScore = (id) => api.get(`/${id}/scores/sum`);
export const endSession = (sessionId,sessionWinners,sessionEndTime) => api.post(`/${sessionId}/end`, { sessionWinners, sessionEndTime });
export const getAllSession = () => api.get("");