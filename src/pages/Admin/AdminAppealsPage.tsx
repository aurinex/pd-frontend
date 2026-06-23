import {
  Box, Typography, Card, CardContent, Grid, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, IconButton, Tabs, Tab, Avatar,
  Switch, FormControlLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getAppeals, updateAppealStatus, getAppealStats, toggleAllowMessages } from "../../services/appealService";
import { useTheme } from "@mui/material/styles";
import { StatusChip } from "../../components/common/StatusChip";
import { translateAction } from "../../utils/statusLabels";
import { getFileUrl } from "../../services/api";
import type { Appeal, AppealStats } from "../../types/appeal";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import CloseIcon from "@mui/icons-material/Close";

export const AdminAppealsPage = () => {
  const theme = useTheme();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [stats, setStats] = useState<AppealStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [response, setResponse] = useState("");

  const loadData = async () => {
    try {
      const [appealsData, statsData] = await Promise.all([getAppeals(), getAppealStats()]);
      setAppeals(appealsData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const openAppeal = (appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setNewStatus(appeal.status);
    setResponse(appeal.response || "");
  };

  const handleToggleMessages = async () => {
    if (!selectedAppeal) return;
    try {
      const updated = await toggleAllowMessages(selectedAppeal._id);
      setSelectedAppeal(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!selectedAppeal) return;
    try {
      await updateAppealStatus(selectedAppeal._id, {
        status: newStatus !== selectedAppeal.status ? newStatus : undefined,
        response: response !== (selectedAppeal.response || "") ? response : undefined,
      });
      setSelectedAppeal(null);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAppeals = tab === 0 ? appeals : appeals.filter((a) => a.status === ["pending", "in_review", "accepted", "resolved", "rejected"][tab - 1]);

  const statusCounts: Record<string, number> = {
    pending: stats?.pending ?? 0,
    in_review: stats?.in_review ?? 0,
    resolved: stats?.resolved ?? 0,
    rejected: stats?.rejected ?? 0,
  };

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><Typography>Загрузка...</Typography></Box>;
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 4 }}>
      <Typography variant="h5" fontWeight={700} mb={0.5}>Управление обращениями</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>Панель сотрудника органов внутренних дел</Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          { label: "Все", count: appeals.length, color: "" },
          { label: "Ожидают", count: statusCounts.pending, color: "warning" },
          { label: "На рассмотрении", count: statusCounts.in_review, color: "info" },
          { label: "Рассмотрено", count: statusCounts.resolved, color: "success" },
          { label: "Отклонено", count: statusCounts.rejected, color: "error" },
        ].map((s, i) => (
          <Card key={i} sx={{ p: 2, minWidth: 140, textAlign: "center", background: theme.palette.background.fourth }}>
            <Typography variant="h4" fontWeight={700}>{s.count}</Typography>
            <Typography variant="caption" color="text.secondary">{s.label}</Typography>
          </Card>
        ))}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Все" />
        <Tab label="Ожидают" />
        <Tab label="На рассмотрении" />
        <Tab label="Рассмотрено" />
        <Tab label="Отклонено" />
      </Tabs>

      <Grid container spacing={2}>
        {filteredAppeals.map((appeal) => (
          <Grid size={12} key={appeal._id}>
            <Card
              sx={{
                background: theme.palette.background.fourth,
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
              }}
              onClick={() => openAppeal(appeal)}
            >
              <CardContent sx={{ py: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={600}>{appeal.title}</Typography>
                      <StatusChip status={appeal.status} />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      От: {appeal.is_anonymous ? "Анонимно" : `${appeal.author_surname} ${appeal.author_name}`}
                      {" · "}
                      {appeal.created_at ? format(new Date(appeal.created_at), "dd MMM yyyy, HH:mm", { locale: ru }) : ""}
                    </Typography>
                  </Box>
                  {appeal.assigned_name && (
                    <Chip size="small" label={appeal.assigned_name} variant="outlined" sx={{ ml: 2 }} />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={!!selectedAppeal} onClose={() => setSelectedAppeal(null)} maxWidth="md" fullWidth>
        {selectedAppeal && (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>{selectedAppeal.title}</Typography>
                <StatusChip status={selectedAppeal.status} />
              </Box>
              <IconButton onClick={() => setSelectedAppeal(null)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Автор</Typography>
                  <Typography variant="body2">
                    {selectedAppeal.is_anonymous ? "Анонимно" : `${selectedAppeal.author_surname} ${selectedAppeal.author_name}`}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Категория</Typography>
                  <Typography variant="body2">{selectedAppeal.category}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Текст обращения</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>{selectedAppeal.content}</Typography>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" mb={1} display="block">Статус</Typography>
                  <FormControl fullWidth size="small">
                    <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      <MenuItem value="pending">Ожидает рассмотрения</MenuItem>
                      <MenuItem value="in_review">На рассмотрении</MenuItem>
                      <MenuItem value="accepted">Принято в работу</MenuItem>
                      <MenuItem value="resolved">Рассмотрено</MenuItem>
                      <MenuItem value="rejected">Отклонено</MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" mb={1} display="block">Ответ заявителю</Typography>
                  <TextField value={response} onChange={(e) => setResponse(e.target.value)} multiline minRows={3} fullWidth placeholder="Введите текст ответа..." />
                </Box>

                <FormControlLabel
                  control={<Switch checked={selectedAppeal.allow_messages} onChange={handleToggleMessages} />}
                  label="Разрешить отправку дополнительных сведений"
                />

                {selectedAppeal.files && selectedAppeal.files.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">Прикреплённые файлы</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selectedAppeal.files.map((f, i) => (
                        <Button
                          key={i}
                          size="small"
                          variant="outlined"
                          href={getFileUrl(selectedAppeal._id, f.stored_name)}
                          target="_blank"
                          sx={{ textTransform: "none" }}
                        >
                          {f.original_name}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {selectedAppeal.messages && selectedAppeal.messages.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">Дополнительные сведения от заявителя</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {[...selectedAppeal.messages].reverse().map((m, i) => (
                        <Box key={i} sx={{
                          p: 1.5, borderRadius: 2,
                          background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                        }}>
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{m.text}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {m.user} — {m.date ? format(new Date(m.date), "dd.MM HH:mm") : ""}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {selectedAppeal.history && selectedAppeal.history.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">История</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                      {[...selectedAppeal.history].reverse().map((h, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 10 }}>{h.user?.[0]}</Avatar>
                          <Typography variant="caption">
                            {translateAction(h.action)}
                            {" — "}
                            {h.date ? format(new Date(h.date), "dd.MM HH:mm") : ""}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedAppeal(null)} sx={{ textTransform: "none" }}>Отмена</Button>
              <Button variant="contained" onClick={handleUpdate} sx={{ textTransform: "none", fontWeight: 600 }}>
                Сохранить изменения
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
