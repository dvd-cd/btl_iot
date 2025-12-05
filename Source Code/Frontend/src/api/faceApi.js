// src/api/faceApi.js
import apiClient from "./apiClient";
import axios from "axios";

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
        if (it && it.file) fd.append("images", it.file);
      });
      console.log("Appending images:", fd);
      // include single name for this batch if provided
      if (groupName !== undefined && groupName !== null) {
        fd.append('name', groupName);
      }

      payload = fd;
      console.log("Prepared FormData for face registration:", fd);
    }
    // Debug: log FormData keys/values (for files we only log the key and filename)
    try {
      if (payload instanceof FormData) {
        for (const pair of payload.entries()) {
          const [k, v] = pair;
          if (v instanceof File) {
            console.log(`[faceApi] FormData entry: ${k} -> file: ${v.name}`);
          } else {
            console.log(`[faceApi] FormData entry: ${k} ->`, v);
          }
        }
      }
    } catch (e) {
      console.warn('[faceApi] Failed to iterate FormData for debug:', e);
    }

    // If payload is FormData we must bypass the apiClient instance because it
    // has a default Content-Type header (application/json) which interferes
    // with multipart boundary handling. Use axios directly and include the
    // Authorization header manually so the request stays authenticated.
    if (payload instanceof FormData) {
      const url = `${apiClient.defaults.baseURL}/api/devices/${deviceId}/faces/new`;
      const token = localStorage.getItem("accessToken");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return axios.post(url, payload, { headers });
    }

    return apiClient.post(`/api/devices/${deviceId}/faces/new`, payload);
  },
  // deleteFace(deviceId, faceId, url)
  // sends DELETE /api/devices/:deviceId/faces/:faceId?url=<encodedUrl>
  deleteFace: (deviceId, faceId, url) => {
    const q = encodeURIComponent(url);
    return apiClient.delete(`/api/devices/${deviceId}/faces/${faceId}/${q}`);
  },
};

export default faceApi;
