import axios from "axios";
import { BASE_API_URL } from "../config.js";

// Crea istanza axios per Match
const api = axios.create({
  baseURL: `${BASE_API_URL}/statistics`, // usa la variabile globale
  headers: {
    "Content-Type": "application/json"
  }
});

// Funzioni helper
export const getClassification = () => api.get("/classification");