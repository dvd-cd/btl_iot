// src/components/admin/AddUserModal.jsx
import React, { useState } from "react";
import userApi from "../../api/userApi";
import "../../styles/AddUserModal.css";

const AddUserModal = ({ isOpen, onClose, onUserAdded }) => {
  const [form, setForm] = useState({
    username: "",
    password: "",
    fullname: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await userApi.createUser(form);
      setForm({ username: "", password: "", fullname: "" });
      onUserAdded();
      onClose();
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  const handleClose = () => {
    setForm({ username: "", password: "", fullname: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Thêm tài khoản chủ khóa</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <input
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm((f) => ({ ...f, username: e.target.value }))
              }
              required
            />
          </div>
          <div className="form-group">
            <input
              placeholder="Password"
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              required
            />
          </div>
          <div className="form-group">
            <input
              placeholder="Họ tên"
              value={form.fullname}
              onChange={(e) =>
                setForm((f) => ({ ...f, fullname: e.target.value }))
              }
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={handleClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit">
              Tạo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
