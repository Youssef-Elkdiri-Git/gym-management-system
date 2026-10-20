
import axios from "axios";

export const api = axios.create({
  baseURL: "https://localhost:7247/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gym_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
