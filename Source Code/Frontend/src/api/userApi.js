// src/api/userApi.js (dùng cho admin tạo chủ khóa)
import apiClient from "./apiClient";

// Temporary mock for getAllUsers: return 5 users for local/dev UI
const mockUsers = [
  { _id: "user_001", username: "admin", fullname: "Nguyễn Văn A", role: "admin" },
  { _id: "user_002", username: "hoai", fullname: "Hoài T", role: "user" },
  { _id: "user_003", username: "linh", fullname: "Linh P.", role: "user" },
  { _id: "user_004", username: "viet", fullname: "Việt Q.", role: "user" },
  { _id: "user_005", username: "thao", fullname: "Thảo N.", role: "user" },
];

const userApi = {
  // getAllUsers: () => apiClient.get("/api/admin/users"),
  getAllUsers: () => Promise.resolve({ data: mockUsers }),
  createUser: (data) => apiClient.post("/api/admin/users/new", data),
  deleteUser: (id) => apiClient.delete(`/api/admin/users/${id}`),
};

export default userApi;
