// src/components/layout/UserLayout.jsx
import React, { useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import "../../styles/UserLayout.css";
import wsClient from "../../api/wsClient";
import ToastProvider, { useToast } from "../common/ToastProvider";

const InnerLayout = () => {
  const { addToast } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    // build ws url, include token as query param if present
    const WS_BASE = (window.location.protocol === "https:" ? "wss" : "ws") + "://api.your-iot-lock.com/ws";
    const wsUrl = token ? `${WS_BASE}?token=${encodeURIComponent(token)}` : WS_BASE;
    wsClient.connect(wsUrl);
    const unsub = wsClient.subscribe((msg) => {
      if (!msg || typeof msg !== 'object') return;
      // server expected to send deviceName and action (lock/unlock)
      if (msg.type === 'lock_request' || msg.type === 'status_update') {
        const name = msg.deviceName || msg.deviceId || 'thiết bị';
        const action = msg.action || msg.status || '';
        if (action === 'unlock' || action === 'unlocked') {
          addToast(`Đã mở khóa thiết bị ${name}`, { type: 'success' });
        } else if (action === 'lock' || action === 'locked') {
          addToast(`Đã khóa thiết bị ${name}`, { type: 'success' });
        } else {
          addToast(`${name}: ${action}`, { type: 'info' });
        }
        // notify any open pages that device status changed so they can refresh
        if (msg.deviceId) {
          window.dispatchEvent(new CustomEvent('device-status-updated', { detail: { deviceId: msg.deviceId } }));
        }
      }
    });

    return () => {
      unsub();
      wsClient.disconnect();
    };
  }, [addToast]);

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Smart Lock</h2>
        <nav>
          <Link to="/user/profile">Thông tin cá nhân</Link>
          <Link to="/user/devices">Khóa của tôi</Link>
          <Link to="/user/notifications">Thông báo</Link>
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

const UserLayout = () => (
  <ToastProvider>
    <InnerLayout />
  </ToastProvider>
);

export default UserLayout;
