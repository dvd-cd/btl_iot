// src/components/layout/AdminLayout.jsx
import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";

const AdminLayout = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    navigate('/login');
  };
  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Admin</h2>
        <nav>
          <Link to="/admin/users">Quản lý tài khoản</Link>
          <Link to="/admin/devices">Quản lý khóa</Link>
          <button type="button" className="btn-logout" onClick={handleLogout}>Đăng xuất</button>
        </nav>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;