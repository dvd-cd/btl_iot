// src/pages/auth/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authApi.login(username, password);
      const { accessToken, refreshToken, role } = res.data || {};
      if (accessToken) localStorage.setItem("accessToken", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      if (role) localStorage.setItem("role", role);
      navigate(role === "admin" ? "/admin" : "/user");
    } catch (err) {
      console.error(err);
      setError("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="page">
      <h1>Đăng nhập</h1>
      <form onSubmit={handleSubmit} className="form">
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <div className="error">{error}</div>}
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
};

export default LoginPage;
