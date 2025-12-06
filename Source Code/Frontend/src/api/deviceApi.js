// src/api/deviceApi.js
import apiClient from "./apiClient";

const deviceApi = {
  // Admin
  getAllDevices: () => apiClient.get("/api/devices"),
  // updateDeviceByAdmin: (id, data) => {
  //   return apiClient.put(`/api/devices/${id}`, data);
  // },
  deleteDeviceByAdmin: (deviceId) => {
    return apiClient.delete(`/api/devices/${deviceId}`);
  },

  // User
  getMyDevices: () => {
    return apiClient.get("/api/devices")
  },
  createDevice: (data) => apiClient.post("/api/devices/new", data),
  // getDeviceDetail: return device summary including faces (mock implementation)
  getDeviceDetail: (id) => {
    return apiClient.get(`/api/devices/${id}`);
  },
  // (faces are returned as part of getDeviceDetail)
  updateMyDevice: (id, data) =>
    apiClient.put(`/api/devices/${id}`, data),
  getDeviceLogs: (id, params) =>
    apiClient.get(`/api/devices/${id}/access-logs`, { params }),
  // send a command to device (e.g., lock/unlock)
  sendDeviceCommand: (id, action) =>
    // action: 'unlock' | 'lock'
    // try calling backend; if backend not available, resolve mock
    apiClient.post(`/api/devices/${id}/commands`, { action }),
};

export default deviceApi;
