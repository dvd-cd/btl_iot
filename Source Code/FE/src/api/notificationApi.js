// src/api/notificationApi.js
import apiClient from "./apiClient";

const notificationApi = {
  getMyNotifications: () => apiClient.get("/api/users/me/notifications"),
};

export default notificationApi;
