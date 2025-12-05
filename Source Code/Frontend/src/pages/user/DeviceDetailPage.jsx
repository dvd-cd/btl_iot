// src/pages/user/DeviceDetailPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import deviceApi from "../../api/deviceApi";
import "../../styles/DeviceDetailPage.css";

const DeviceDetailPage = () => {
  const { deviceId } = useParams();
  const [device, setDevice] = useState(null);
  const [form, setForm] = useState({ deviceName: "" });
  const [faces, setFaces] = useState([]);
  const [initialName, setInitialName] = useState("");

  useEffect(() => {
    // Always fetch device detail (includes faces) by id
    deviceApi.getDeviceDetail(deviceId).then((res) => {
      const d = res.data.data.device || {};
      setDevice(d);
      setForm({ deviceName: d.displayName || "" });
      setInitialName(d.displayName || "");
      setFaces(d.faces || []);
    }).catch((err) => {
      console.error('Failed to load device detail', err);
    });
  }, [deviceId]);

  console.log("Device detail:", device);  
  const handleSave = async (e) => {
    e?.preventDefault?.();

    if (form.deviceName === initialName) return;

    const ok = window.confirm("Bạn có chắc muốn lưu thay đổi?");
    if (!ok) return;

    try {
      await deviceApi.updateMyDevice(deviceId, form);
      // update local state so UI reflects new name without reloading
      setDevice((d) => ({ ...(d || {}), deviceName: form.deviceName }));
      setInitialName(form.deviceName);
      // optionally show a small alert
      window.alert("Đã lưu thay đổi");
    } catch (err) {
      console.error(err);
      window.alert("Có lỗi khi lưu, vui lòng thử lại");
    }
  };

  if (!device)
    return (
      <div className="device-detail-container">
        <div className="device-detail-header">
          <h2>Không tìm thấy thông tin thiết bị</h2>
        </div>
        <p>Vui lòng mở trang chi tiết bằng nút "Xem chi tiết" từ danh sách khóa.</p>
        <Link to="/user/devices" className="btn-small">Quay lại danh sách</Link>
      </div>
    );

  return (
    <div className="device-detail-container">
      <div className="device-detail-header">
        <h2>Thông tin khóa</h2>
        <div className="header-actions">
          <Link to={`/user/devices/${deviceId}/logs`} className="btn-small">
            Xem log
          </Link>
          <Link
            to={`/user/devices/${deviceId}/faces`}
            state={{ device, faces: device.faces || [], id: device.id }}
            className="btn-small btn-primary"
          >
            Quản lý khuôn mặt
          </Link>
        </div>
      </div>

      <div className="device-info-list">
        <div className="info-row">
          <div className="info-label">Tên khóa</div>
          <div className="info-value">
            <input
              placeholder="Tên khóa"
              value={form.deviceName}
              onChange={(e) => setForm((f) => ({ ...f, deviceName: e.target.value }))}
            />
          </div>
        </div>

        <div className="info-row">
          <div className="info-label">Phiên bản</div>
          <div className="info-value">{device.currentFWVersion || 'N/A'}</div>
        </div>

        <div className="info-row">
          <div className="info-label">Trạng thái</div>
          <div className="info-value">{device.status}</div>
        </div>

        <div className="info-row">
          <div className="info-label">Ảnh khuôn mặt</div>
          <div className="info-value faces-list">
            {faces && faces.length > 0 ? (
              // For each face entry, render all image URLs (some entries may contain an array)
              faces.map((f, idx) => {
                const name = f.name;
                const urls = f.imageURL;
                
                console.log("Face entry:", urls.length, name);

                return urls.map((url, i) => (
                  <a key={`${idx}-${i}`} href={url} target="_blank" rel="noreferrer">
                    <img src={url} className="face-thumb" />
                    <div className="face-name-hidden">{name}</div>
                  </a>
                ));
              })
            ) : (
              <span className="muted">Chưa có ảnh khuôn mặt</span>
            )}
          </div>
        </div>
      </div>

      <div className="save-actions">
        {form.deviceName !== initialName && (
          <button className="btn-submit" onClick={handleSave}>Lưu thay đổi</button>
        )}
      </div>
    </div>
  );
};

export default DeviceDetailPage;
