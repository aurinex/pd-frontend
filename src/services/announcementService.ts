import { API_BASE } from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getAnnouncements = async () => {
  const res = await fetch(`${API_BASE}/announcements`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch announcements");
  return res.json();
};

export const createAnnouncement = async (title: string, content: string) => {
  const res = await fetch(`${API_BASE}/announcements`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ title, content }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create announcement");
  }
  return res.json();
};

export const deleteAnnouncement = async (id: string) => {
  const res = await fetch(`${API_BASE}/announcements/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to delete announcement");
  return res.json();
};
