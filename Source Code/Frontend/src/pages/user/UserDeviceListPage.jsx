// src/pages/user/UserDeviceListPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import deviceApi from "../../api/deviceApi";
import "../../styles/UserDeviceListPage.css";

const UserDeviceListPage = () => {
  const [devices, setDevices] = useState([]);
  const navigate = useNavigate();

  const loadDevices = () => {
    deviceApi.getMyDevices().then((res) => setDevices(res.data));
  };

  useEffect(loadDevices, []);

  // listen for device status updates dispatched globally (from WebSocket in layout)
  useEffect(() => {
    const handler = (e) => {
      const deviceId = e?.detail?.deviceId;
      if (!deviceId) return;
      // reload devices list (so status updated from backend is fetched)
      loadDevices();
    };
    window.addEventListener('device-status-updated', handler);
    return () => window.removeEventListener('device-status-updated', handler);
  }, []);

  // const getStatusBadge = (status) => {
  //   return (
  //     <span className={`status-badge status-${status}`}>
  //       {status === "online" ? "Online" : "Offline"}
  //     </span>
  //   );
  // };

  return (
    <div className="device-list-container">
      <div className="device-list-header">
        <h1>Danh sách khóa của tôi</h1>
        <button
          className="btn-add-device"
          onClick={() => navigate("/user/devices/add")}
        >
          + Thêm khóa mới
        </button>
      </div>

      <div className="device-table">
        <div className="table-header">
          <div className="col-id">ID</div>
          <div className="col-name">Tên khóa</div>
          <div className="col-status">Trạng thái</div>
          <div className="col-version">Phiên bản</div>
          <div className="col-actions">Hành động</div>
        </div>
        {devices.length > 0 ? (
          devices.map((device) => (
            <div key={device._id} className="table-row">
              <div className="col-id">{device._id}</div>
              <div className="col-name">{device.deviceName}</div>
              {/* <div className="col-status">{getStatusBadge(device.status)}</div> */}
              <div className="col-status">{device.status}</div>
              <div className="col-version">{device.version}</div>
              <div className="col-actions">
                <Link
                  to={`/user/devices/${device._id}`}
                  state={{ device }}
                  className="btn-view"
                >
                  Xem chi tiết
                </Link>
                {device.status === "locked" && (
                  <button
                    className="btn-unlock"
                    onClick={async () => {
                      try {
                        await deviceApi.sendDeviceCommand(device._id, "unlock");
                        setDevices((prev) => prev.map((d) => (d._id === device._id ? { ...d, status: "unlocked" } : d)));
                        window.alert("Gửi lệnh mở khóa thành công");
                      } catch (err) {
                        console.error(err);
                        window.alert("Không thể gửi lệnh mở khóa");
                      }
                    }}
                  >
                    Mở khóa
                  </button>
                )}
                {device.status === "unlocked" && (
                  <button
                    className="btn-lock"
                    onClick={async () => {
                      try {
                        await deviceApi.sendDeviceCommand(device._id, "lock");
                        setDevices((prev) => prev.map((d) => (d._id === device._id ? { ...d, status: "locked" } : d)));
                        window.alert("Gửi lệnh đóng khóa thành công");
                      } catch (err) {
                        console.error(err);
                        window.alert("Không thể gửi lệnh đóng khóa");
                      }
                    }}
                  >
                    Đóng khóa
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>Chưa có khóa nào. Hãy thêm khóa mới để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDeviceListPage;
