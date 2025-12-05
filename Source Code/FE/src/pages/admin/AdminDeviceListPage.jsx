// src/pages/admin/AdminDeviceListPage.jsx
import React, { useEffect, useState } from "react";
import deviceApi from "../../api/deviceApi";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import "../../styles/AdminDeviceListPage.css";

const AdminDeviceListPage = () => {
  const [devices, setDevices] = useState([]);
  const [confirm, setConfirm] = useState({ isOpen: false, deviceId: null, deviceName: "" });

  const load = () => {
    deviceApi.getAllDevices().then((res) => setDevices(res.data));
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpdateVersion = async (device) => {
    const newVersion = window.prompt("Nhập phiên bản mới:", device.version || "");
    if (!newVersion) return;
    try {
      await deviceApi.updateDeviceByAdmin(device._id, { version: newVersion });
      load();
    } catch (err) {
      console.error("Update version failed", err);
      window.alert("Cập nhật phiên bản thất bại");
    }
  };

  const handleDeleteClick = (device) => {
    setConfirm({ isOpen: true, deviceId: device._id, deviceName: device.deviceName });
  };

  const handleConfirmDelete = async () => {
    try {
      await deviceApi.deleteDeviceByAdmin(confirm.deviceId);
      setConfirm({ isOpen: false, deviceId: null, deviceName: "" });
      load();
    } catch (err) {
      console.error("Delete device failed", err);
      window.alert("Xóa thiết bị thất bại");
      setConfirm({ isOpen: false, deviceId: null, deviceName: "" });
    }
  };

  const handleCancelDelete = () => setConfirm({ isOpen: false, deviceId: null, deviceName: "" });

  return (
    <div className="admin-devices-container">
      <div className="admin-devices-header">
        <h1>Quản lý khóa hệ thống</h1>
      </div>

      <div className="admin-device-table-wrapper">
        <table className="admin-device-table">
          <thead>
            <tr>
              <th>Tên khóa</th>
              <th>Chủ sở hữu</th>
              <th>Phiên bản</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((d) => (
              <tr key={d._id}>
                <td>{d.deviceName}</td>
                <td>{d.owner?.username || "-"}</td>
                <td>{d.version || "-"}</td>
                <td>
                  <div className="table-actions">
                    <button className="btn-update" onClick={() => handleUpdateVersion(d)}>Cập nhật phiên bản</button>
                    <button className="btn-delete" onClick={() => handleDeleteClick(d)}>Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={confirm.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa thiết bị "${confirm.deviceName}" không?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default AdminDeviceListPage;
