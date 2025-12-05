// src/pages/admin/UserManagementPage.jsx
import React, { useEffect, useState } from "react";
import userApi from "../../api/userApi";
import AddUserModal from "../../components/admin/AddUserModal";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import "../../styles/UserManagementPage.css";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    userId: null,
    username: "",
  });

  const loadUsers = () => {
    userApi.getAllUsers().then((res) => setUsers(res.data));
  };

  useEffect(loadUsers, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleUserAdded = () => {
    loadUsers();
  };

  const handleDeleteClick = (userId, username) => {
    setConfirmDialog({
      isOpen: true,
      userId,
      username,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await userApi.deleteUser(confirmDialog.userId);
      setConfirmDialog({ isOpen: false, userId: null, username: "" });
      loadUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setConfirmDialog({ isOpen: false, userId: null, username: "" });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, userId: null, username: "" });
  };

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>Danh sách người dùng</h1>
        <button className="btn-add-user" onClick={handleOpenModal}>
          + Thêm tài khoản
        </button>
      </div>

      <div className="user-list-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Role</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.username}</td>
                <td>{u.fullname}</td>
                <td>{u.role}</td>
                <td>
                  <div className="table-actions">
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteClick(u._id, u.username)}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUserAdded={handleUserAdded}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa tài khoản "${confirmDialog.username}" không?`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
};

export default UserManagementPage;
