import axios from "axios";
import { BASE_API_URL } from "../config.js";

// Crea istanza axios per Match
const api = axios.create({
  baseURL: `${BASE_API_URL}/session`, // usa la variabile globale
  headers: {
    "Content-Type": "application/json"
  }
});

// Funzioni helper
export const createSession = (sessionStartTime, nPlayer) => api.post("/start", {sessionStartTime, nPlayer});
export const getSessionInfoFromId = (id) =>  api.get(`/getSessionInfo/${id}`);
export const getSumSessionScore = (id) => api.get(`/getSumSessionScore/${id}`);
export const endSession = (sessionId,sessionWinners,sessionEndTime) => api.post("/endSession", { sessionId, sessionWinners, sessionEndTime });
export const getAllSession = () => api.get("/getAllSession");