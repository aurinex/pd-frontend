import { API_BASE } from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const createAppeal = async (data: {
  title: string;
  content: string;
  category: string;
  is_anonymous: boolean;
}) => {
  const res = await fetch(`${API_BASE}/appeals`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create appeal");
  }
  return res.json();
};

export const getAppeals = async () => {
  const res = await fetch(`${API_BASE}/appeals`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to fetch appeals");
  }
  return res.json();
};

export const getAppeal = async (id: string) => {
  const res = await fetch(`${API_BASE}/appeals/${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to fetch appeal");
  }
  return res.json();
};

export const updateAppealStatus = async (
  id: string,
  data: { status?: string; response?: string; assigned_to?: string },
) => {
  const res = await fetch(`${API_BASE}/appeals/${id}/status`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update appeal");
  }
  return res.json();
};

export const uploadAppealFiles = async (appealId: string, files: File[]) => {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  const res = await fetch(`${API_BASE}/appeals/${appealId}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to upload files");
  }
  return res.json();
};

export const toggleAllowMessages = async (appealId: string) => {
  const res = await fetch(`${API_BASE}/appeals/${appealId}/allow-messages`, {
    method: "PATCH",
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to toggle allow messages");
  }
  return res.json();
};

export const sendAppealMessage = async (appealId: string, text: string, user: string, userId: string) => {
  const res = await fetch(`${API_BASE}/appeals/${appealId}/messages`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ text, user, user_id: userId }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to send message");
  }
  return res.json();
};

export const getAppealStats = async () => {
  const res = await fetch(`${API_BASE}/appeals/stats/overview`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to fetch stats");
  }
  return res.json();
};
