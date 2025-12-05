// src/pages/user/DeviceLogsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import deviceApi from "../../api/deviceApi";

const DeviceLogsPage = () => {
  const { deviceId } = useParams();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    deviceApi.getDeviceLogs(deviceId).then((res) => setLogs(res.data));
  }, [deviceId]);

  return (
    <div>
      <h1>Log ra vào</h1>
      <table>
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Action</th>
            <th>Trạng thái</th>
            <th>Người dùng</th>
            <th>Tiêu đề</th>
            <th>Mô tả</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l._id}>
              <td>{new Date(l.timestamp).toLocaleString()}</td>
              <td>{l.actionType}</td>
              <td>{l.status}</td>
              <td>{l.userId}</td>
              <td>{l.title}</td>
              <td>{l.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DeviceLogsPage;
