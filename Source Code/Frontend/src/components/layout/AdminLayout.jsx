// src/components/layout/AdminLayout.jsx
import React from "react";
import { Link, Outlet } from "react-router-dom";

const AdminLayout = () => (
  <div className="layout">
    <aside className="sidebar">
      <h2>Admin</h2>
      <nav>
        <Link to="/admin/users">Quản lý tài khoản</Link>
        <Link to="/admin/devices">Quản lý khóa</Link>
      </nav>
    </aside>
    <main className="content">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;