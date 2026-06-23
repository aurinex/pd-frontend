import { Chip } from "@mui/material";

const statusConfig: Record<string, { label: string; color: any }> = {
  pending: { label: "Ожидает рассмотрения", color: "warning" },
  in_review: { label: "На рассмотрении", color: "info" },
  accepted: { label: "Принято в работу", color: "primary" },
  resolved: { label: "Рассмотрено", color: "success" },
  rejected: { label: "Отклонено", color: "error" },
};

export const StatusChip = ({ status }: { status: string }) => {
  const config = statusConfig[status] || { label: status, color: "default" };
  return <Chip label={config.label} color={config.color} size="small" variant="filled" />;
};
