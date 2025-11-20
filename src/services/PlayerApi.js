import axios from "axios";
import { BASE_API_URL } from "../config.js";

const api = axios.create({
  baseURL: `${BASE_API_URL}/player`,
  headers: {
    "Content-Type": "application/json"
  }
});

// Funzioni API
export const getPlayers = () => api.get("/getPlayersList");

export const addPlayer = (name) => api.post("/addPlayer", { name });
