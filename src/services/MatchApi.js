import axios from "axios";
import { BASE_API_URL } from "../config.js";

// Crea istanza axios per Match
const api = axios.create({
  baseURL: `${BASE_API_URL}/matches`, // usa la variabile globale
  headers: {
    "Content-Type": "application/json"
  }
});

// Funzioni helper
export const addNewMatch = (matchData) => api.post("", JSON.stringify(matchData));

export const getMatchesNumber = () => api.get("/count");