import axios from "axios";
import { BASE_API_URL } from "../config.js";

const api = axios.create({
  baseURL: `${BASE_API_URL}/players`,
  headers: {
    "Content-Type": "application/json"
  }
});

// Funzioni API
export const getAllPlayers = () => api.get("");

export const addNewPlayer = (name) => api.post("", { name });
