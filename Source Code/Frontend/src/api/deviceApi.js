// src/api/deviceApi.js
import apiClient from "./apiClient";

const deviceApi = {
  // Admin
  getAllDevices: () => apiClient.get("/api/admin/devices"),
  updateDeviceByAdmin: (id, data) => {
    return apiClient.put(`/api/admin/devices/${id}`, data);
  },
  deleteDeviceByAdmin: (id) => {
    return apiClient.delete(`/api/admin/devices/${id}`);
  },

  // User
  getMyDevices: () => {
    return apiClient.get("/api/users/me/devices")},
  createDevice: (data) => apiClient.post("/api/users/me/devices", data),
  // getDeviceDetail: return device summary including faces (mock implementation)
  getDeviceDetail: (id) => {
    return apiClient.get(`/api/users/me/devices/${id}`);
  },
  // (faces are returned as part of getDeviceDetail)
  updateMyDevice: (id, data) =>
    apiClient.put(`/api/users/me/devices/${id}`, data),
  getDeviceLogs: (id, params) =>
    apiClient.get(`/api/users/me/devices/${id}/logs`, { params }),
  // send a command to device (e.g., lock/unlock)
  sendDeviceCommand: (id, action) =>
    // action: 'unlock' | 'lock'
    // try calling backend; if backend not available, resolve mock
    apiClient.post(`/api/users/me/devices/${id}/commands`, { action }),
};

export default deviceApi;
