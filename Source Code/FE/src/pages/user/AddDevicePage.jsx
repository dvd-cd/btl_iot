// src/pages/user/AddDevicePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import deviceApi from "../../api/deviceApi";
import "../../styles/AddDevicePage.css";

const AddDevicePage = () => {
  const [deviceName, setDeviceName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!deviceName.trim()) {
      setError("Vui lòng nhập tên khóa");
      return;
    }

    // no mqtt token required from UI

    try {
      setLoading(true);
      await deviceApi.createDevice({
        deviceName: deviceName.trim(),
        mqttToken: mqttToken.trim(),
      });
      navigate("/user/devices");
    } catch (err) {
      setError("Có lỗi xảy ra khi thêm khóa. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/user/devices");
  };

  return (
    <div className="device-list-container">
      <div className="device-list-header">
        <h1>Thêm khóa mới</h1>
        <div>
          <button
            type="button"
            className="btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            ← Quay lại
          </button>
        </div>
      </div>

      <div className="add-device-card">
        <p className="subtitle">Nhập thông tin khóa bạn muốn thêm</p>

        <form onSubmit={handleSubmit} className="add-device-form">
          <div className="form-group">
            <label htmlFor="deviceName">Tên khóa *</label>
            <input
              id="deviceName"
              type="text"
              placeholder="Ví dụ: Khóa phòng khách"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* MQTT Token removed from UI - provided by device or backend */}

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={handleCancel}
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
            >
              {loading ? "Đang thêm..." : "Thêm khóa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDevicePage;
