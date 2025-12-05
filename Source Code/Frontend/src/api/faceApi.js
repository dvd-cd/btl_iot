// src/api/faceApi.js
import apiClient from "./apiClient";

const faceApi = {
  // registerFace accepts:
  // - a FormData already prepared, OR
  // - an array of file entries ( [{ file }, ...] ) plus an optional single name string
  // When given array + name, payload will be: images: <file> (repeated), name: <string>
  registerFace: (deviceId, filesOrFormData, groupName) => {
    let payload = filesOrFormData;
    if (!filesOrFormData) return Promise.reject(new Error('No files provided'));
    if (!(filesOrFormData instanceof FormData)) {
      // expect array
      const fd = new FormData();
      const arr = Array.isArray(filesOrFormData) ? filesOrFormData : [];
      arr.forEach((it) => {
        // it: { file, ... }
        if (it && it.file) fd.append('images', it.file);
      });
      // include single name for this batch if provided
      if (groupName !== undefined && groupName !== null) {
        fd.append('name', groupName);
      }
      payload = fd;
    }
    return apiClient.post(`/api/users/me/devices/${deviceId}/faces`, payload, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  deleteFace: (deviceId, faceId) => apiClient.delete(`/api/users/me/devices/${deviceId}/faces/${faceId}`),
};

export default faceApi;
