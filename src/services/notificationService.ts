import { API_BASE } from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getNotifications = async () => {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
};

export const getUnreadCount = async () => {
  const res = await fetch(`${API_BASE}/notifications/unread-count`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch unread count");
  return res.json();
};

export const markAsRead = async (id: string) => {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark as read");
  return res.json();
};

export const markAllAsRead = async () => {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to mark all as read");
  return res.json();
};
