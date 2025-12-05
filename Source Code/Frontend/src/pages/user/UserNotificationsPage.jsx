// src/pages/user/UserNotificationsPage.jsx
import React, { useEffect, useState } from "react";
import notificationApi from "../../api/notificationApi";

const UserNotificationsPage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    notificationApi.getMyNotifications().then((res) => setItems(res.data));
  }, []);

  return (
    <div>
      <h1>Thông báo</h1>
      <ul>
        {items.map((n) => (
          <li key={n._id}>
            [{new Date(n.timestamp).toLocaleString()}] {n.title} -{" "}
            {n.description}
          </li>
        ))}
      </ul>
      <p>
        Các cảnh báo 5 lần truy cập thất bại nên được backend tạo vào bảng
        Notification và trả về tại đây.
      </p>
    </div>
  );
};

export default UserNotificationsPage;
