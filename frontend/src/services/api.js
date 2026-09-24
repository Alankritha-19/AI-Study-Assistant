import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Automatically inject JWT token into requests if user is logged in
API.interceptors.request.use((config) => {
  const user = localStorage.getItem("studyUser");
  if (user) {
    try {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.error("Error reading token:", err);
    }
  }
  return config;
});

export default API;