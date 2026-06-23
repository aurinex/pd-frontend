const envApi = (import.meta as any).env.VITE_API_URL;
export const API_BASE = envApi ?? `http://${window.location.hostname}:8000`;

export const getFileUrl = (appealId: string, storedName: string) =>
  `${API_BASE}/uploads/${appealId}/${storedName}`;
