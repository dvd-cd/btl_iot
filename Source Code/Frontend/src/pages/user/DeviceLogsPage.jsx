// src/pages/user/DeviceLogsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import deviceApi from "../../api/deviceApi";

const DeviceLogsPage = () => {
  const { deviceId } = useParams();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    deviceApi.getDeviceLogs(deviceId).then((res) => setLogs(res.data.data.logs));
  }, [deviceId]);
  console.log("Device logs:", logs);
  return (
    <div>
      <h1>Log ra vào</h1>
      <div className="table-wrapper">
        <table>
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Action</th>
            <th>Trạng thái</th>
            <th>Tên người thực hiện</th>
            <th>Ảnh</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l._id}>
              <td>{new Date(l.timestamp).toLocaleString()}</td>
              <td>{l.actionType}</td>
              <td>{l.status}</td>
              <td>{l.detectedFace ? l.detectedFace.name : ""}</td>
              <td><img src={l.snapshotURL} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "6px" }} alt="snapshot" /></td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceLogsPage;
