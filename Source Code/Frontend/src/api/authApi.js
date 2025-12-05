// src/api/authApi.js
import apiClient from "./apiClient";

const mockUser = {
  username: "hoaiT2004",
  fullname: "Trần Hoài",
  email: "hoai@example.com",
};

const authApi = {
  login: (username, password) =>
    apiClient.post("/api/auth/login", { username, password }),
  // getMe: () => apiClient.get("/auth/me"),
  getMe: () => Promise.resolve({ data: mockUser }),
  updateProfile: (data) => apiClient.put("/api/auth/me", data),
};

export default authApi;
