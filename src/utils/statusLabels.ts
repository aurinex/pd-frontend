export const statusLabels: Record<string, string> = {
  pending: "Ожидает рассмотрения",
  in_review: "На рассмотрении",
  accepted: "Принято в работу",
  resolved: "Рассмотрено",
  rejected: "Отклонено",
};

export function translateAction(action: string): string {
  if (action === "created") return "Создано";
  if (action === "response_added") return "Добавлен ответ";
  if (action === "assigned") return "Назначен ответственный";
  if (action === "edited") return "Отредактировано";
  if (action.startsWith("status_changed_to_")) {
    const key = action.replace("status_changed_to_", "");
    return `Статус: ${statusLabels[key] || key}`;
  }
  return action;
}
