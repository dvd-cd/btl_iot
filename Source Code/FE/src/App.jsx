// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./styles/App.css";
import LoginPage from "./pages/auth/LoginPage";
import PrivateRoute from "./components/common/PrivateRoute";
import AdminLayout from "./components/layout/AdminLayout";
import UserLayout from "./components/layout/UserLayout";

import UserProfilePage from "./pages/user/UserProfilePage";
import UserDeviceListPage from "./pages/user/UserDeviceListPage";
import AddDevicePage from "./pages/user/AddDevicePage";
import DeviceDetailPage from "./pages/user/DeviceDetailPage";
import DeviceLogsPage from "./pages/user/DeviceLogsPage";
import DeviceFacePage from "./pages/user/DeviceFacePage";
import UserNotificationsPage from "./pages/user/UserNotificationsPage";

import UserManagementPage from "./pages/admin/UserManagementPage";
import AdminDeviceListPage from "./pages/admin/AdminDeviceListPage";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/admin"
        element={
          <PrivateRoute roles={["admin"]}>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route path="users" element={<UserManagementPage />} />
        <Route path="devices" element={<AdminDeviceListPage />} />
        <Route index element={<AdminDeviceListPage />} />
      </Route>

      <Route
        path="/user"
        element={
          <PrivateRoute roles={["user", "admin"]}>
            <UserLayout />
          </PrivateRoute>
        }
      >
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="devices" element={<UserDeviceListPage />} />
        <Route path="devices/add" element={<AddDevicePage />} />
        <Route path="devices/:deviceId" element={<DeviceDetailPage />} />
        <Route path="devices/:deviceId/logs" element={<DeviceLogsPage />} />
        <Route path="devices/:deviceId/faces" element={<DeviceFacePage />} />
        <Route path="notifications" element={<UserNotificationsPage />} />
        <Route index element={<UserDeviceListPage />} />
      </Route>

      <Route path="*" element={<LoginPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
