import axios from "axios";
import { BASE_API_URL } from "../config.js";

// Crea istanza axios per Match
const api = axios.create({
  baseURL: `${BASE_API_URL}/match`, // usa la variabile globale
  headers: {
    "Content-Type": "application/json"
  }
});

// Funzioni helper
export const addMatch = (matchData) => api.post("/addMatch", JSON.stringify(matchData));

export const getMatchNumber = () => api.get("/getMatchNumber");