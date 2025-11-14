// api.js
import axios from "axios";

// Ensure baseURL ends with '/api' so callers using paths like '/events' hit '/api/events'
const rawBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const baseURL = rawBase.endsWith("/api") ? rawBase : (rawBase.endsWith("/") ? rawBase + "api" : rawBase + "/api");

const API = axios.create({
  baseURL,
});

// Attach JWT token automatically if present
API.interceptors.request.use((config) => {
  try {
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("jwt");
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch {}
  return config;
});

export default API;