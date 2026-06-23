import { API_BASE } from "./api";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const getUsers = async () => {
  const res = await fetch(`${API_BASE}/users`, {
    headers: getHeaders(),
  });
  return res.json();
};

export const updateUserRoles = async (userId: string, roles: string[]) => {
  const res = await fetch(`${API_BASE}/users/${userId}/roles`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ roles }),
  });
  return res.json();
};
