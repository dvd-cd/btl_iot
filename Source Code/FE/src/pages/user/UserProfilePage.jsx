// src/pages/user/UserProfilePage.jsx
import React, { useEffect, useState } from "react";
import authApi from "../../api/authApi";
import "../../styles/UserProfile.css";

const UserProfilePage = () => {
  const [profile, setProfile] = useState({ username: "", fullname: "", password: "" });
  const [initialFullname, setInitialFullname] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [focusField, setFocusField] = useState(null);

  useEffect(() => {
    authApi.getMe().then((res) => {
      // initialize profile; password left empty for security
      const data = res.data || {};
      setProfile({ username: data.username || "", fullname: data.fullname || "", password: "" });
      setInitialFullname(data.fullname || "");
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!profile.fullname.trim()) {
      setError("Họ tên không được để trống");
      return;
    }

    // confirm with the user before saving
    const ok = window.confirm("Bạn có chắc muốn lưu thay đổi?");
    if (!ok) return;

    try {
      // prepare payload (do not send empty password)
      const payload = { fullname: profile.fullname };
      if (profile.password) payload.password = profile.password;
      await authApi.updateProfile(payload);
      setMessage("Đã lưu thay đổi");
      setProfile((p) => ({ ...p, password: "" }));
      // update initial fullname so Save button hides after successful save
      setInitialFullname(payload.fullname || "");
    } catch (err) {
      console.error(err);
      setError("Có lỗi khi lưu, hãy thử lại");
    }
  };

  const handleCancel = () => {
    // reset fullname and password to initial values
    setProfile((p) => ({ ...p, fullname: initialFullname || "", password: "" }));
    setError("");
    setMessage("");
  };

  const hasChanges =
    (initialFullname || "") !== (profile.fullname || "") || (profile.password || "") !== "";

  return (
    <div className="device-list-container">
      <div className="device-list-header">
        <h1>Thông tin cá nhân</h1>
      </div>

      <div className="profile-card">
        <form onSubmit={handleSave} style={{width: '100%'}}>
          <div className="profile-row">
            <div className="label">Username</div>
            <div className="value">
              <input value={profile.username} disabled />
            </div>
          </div>

          <div className="profile-row">
            <div className="label">Họ tên</div>
            <div className="value">
              {focusField === "fullname" ? (
                <input
                  autoFocus
                  placeholder="Họ tên"
                  value={profile.fullname}
                  onChange={(e) => setProfile((p) => ({ ...p, fullname: e.target.value }))}
                  onBlur={() => setFocusField(null)}
                />
              ) : (
                <div
                  className="display-value"
                  onClick={() => setFocusField("fullname")}
                >
                  {profile.fullname || "Chưa cập nhật"}
                </div>
              )}
            </div>
          </div>

          <div className="profile-row">
            <div className="label">Mật khẩu</div>
            <div className="value">
              {focusField === "password" ? (
                <input
                  autoFocus
                  type="password"
                  placeholder="Để trống nếu không đổi"
                  value={profile.password}
                  onChange={(e) => setProfile((p) => ({ ...p, password: e.target.value }))}
                  onBlur={() => setFocusField(null)}
                />
              ) : (
                <div
                  className="masked-value"
                  onClick={() => setFocusField("password")}
                >
                  {profile.password ? "•".repeat(profile.password.length) : "Chưa cập nhật"}
                </div>
              )}
            </div>
          </div>

          {error && <div className="form-error">{error}</div>}

          {hasChanges && (
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel} style={{marginRight:8}}>Hủy</button>
              <button type="submit" className="btn-submit">Lưu</button>
            </div>
          )}
        </form>
        {message && <p style={{marginTop:12}}>{message}</p>}
      </div>
    </div>
  );
};

export default UserProfilePage;
