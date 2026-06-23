import {
  Box, Typography, Card, CardContent, Grid, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip, IconButton, Tabs, Tab, Avatar,
  Switch, FormControlLabel, Collapse, keyframes,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getAppeals, updateAppealStatus, getAppealStats, toggleAllowMessages } from "../../services/appealService";
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from "../../services/announcementService";
import { useTheme } from "@mui/material/styles";
import { StatusChip } from "../../components/common/StatusChip";
import { translateAction } from "../../utils/statusLabels";
import { getFileUrl } from "../../services/api";
import type { Appeal, AppealStats } from "../../types/appeal";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import CloseIcon from "@mui/icons-material/Close";
import CheckIcon from "@mui/icons-material/Check";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArticleIcon from "@mui/icons-material/Article";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#FFB74D", "#64B5F6", "#1976D2", "#81C784", "#E57373"];

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const AdminAppealsPage = () => {
  const theme = useTheme();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [stats, setStats] = useState<AppealStats | null>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [response, setResponse] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [annDialogOpen, setAnnDialogOpen] = useState(false);
  const [annTitle, setAnnTitle] = useState("");
  const [annContent, setAnnContent] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ appeal: Appeal; newStatus: string } | null>(null);

  const loadData = async () => {
    try {
      const [appealsData, statsData, annData] = await Promise.all([
        getAppeals(),
        getAppealStats(),
        getAnnouncements(),
      ]);
      setAppeals(appealsData);
      setStats(statsData);
      setAnnouncements(annData);
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

  const handleToggleMessages = async () => {
    if (!selectedAppeal) return;
    try {
      const updated = await toggleAllowMessages(selectedAppeal._id);
      setSelectedAppeal(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!annTitle.trim() || !annContent.trim()) return;
    try {
      await createAnnouncement(annTitle, annContent);
      setAnnDialogOpen(false);
      setAnnTitle("");
      setAnnContent("");
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredAppeals = tab === 0 ? appeals : appeals.filter((a) => a.status === ["pending", "in_review", "accepted", "resolved", "rejected"][tab - 1]);
  const recentAppeals = appeals.slice(0, 5);

  const statusCounts = stats
    ? [
        { name: "Ожидает", value: stats.pending, color: COLORS[0] },
        { name: "На рассмотрении", value: stats.in_review, color: COLORS[1] },
        { name: "Принято в работу", value: stats.accepted, color: COLORS[2] },
        { name: "Рассмотрено", value: stats.resolved, color: COLORS[3] },
        { name: "Отклонено", value: stats.rejected, color: COLORS[4] },
      ]
    : [];

  if (loading) {
    return <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}><Typography>Загрузка...</Typography></Box>;
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", p: 4, pl: { md: 8 } }}>
        <Box sx={{ animation: `${fadeIn} 0.25s ease forwards` }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>Панель управления</Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>Управление обращениями граждан</Typography>
      </Box>

      {stats && (
        <Box sx={{ animation: `${fadeIn} 0.25s 0.05s ease forwards`, opacity: 0 }}>
          <Grid container spacing={2} mb={4}>
              {[
                { label: "Всего", value: stats.total, color: "text.primary" },
                { label: "Ожидают", value: stats.pending, color: "warning.main" },
                { label: "На рассмотрении", value: stats.in_review, color: "info.main" },
                { label: "Принято в работу", value: stats.accepted, color: "primary.main" },
                { label: "Рассмотрено", value: stats.resolved, color: "success.main" },
                { label: "Отклонено", value: stats.rejected, color: "error.main" },
              ].map((s, i) => (
                <Grid size={{ xs: 6, md: 4 }} key={i}>
                <Card
                  sx={{ p: 2.5, textAlign: "center", background: theme.palette.background.fourth, transition: "transform 0.15s", "&:hover": { transform: "translateY(-2px)" } }}
                >
                  <Typography variant="h4" fontWeight={700} color={s.color}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Grid container spacing={3} mb={4}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ animation: `${fadeIn} 0.25s 0.1s ease forwards`, opacity: 0, height: "100%" }}>
            <Card sx={{ p: 3, background: theme.palette.background.fourth, height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Распределение по статусам</Typography>
              <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 3 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, minWidth: 140 }}>
                  {statusCounts.filter(s => s.value > 0).map((s, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                      <Box>
                        <Typography variant="caption" fontWeight={600}>{s.name}</Typography>
                        <Typography variant="body2" fontWeight={700}>{s.value}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusCounts} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value">
                        {statusCounts.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Card>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ animation: `${fadeIn} 0.25s 0.1s ease forwards`, opacity: 0, height: "100%" }}>
            <Card sx={{ p: 3, background: theme.palette.background.fourth, height: "100%" }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Последние обращения</Typography>
                <Button size="small" onClick={() => setShowAll(!showAll)} sx={{ textTransform: "none" }} endIcon={showAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}>
                  {showAll ? "Скрыть" : "Все →"}
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {recentAppeals.map((a) => (
                  <Box
                    key={a._id}
                    sx={{
                      display: "flex", alignItems: "center", gap: 1.5, py: 1, px: 1.5,
                      borderRadius: 2, cursor: "pointer",
                      "&:hover": { background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)" },
                    }}
                    onClick={() => openAppeal(a)}
                  >
                    <ArticleIcon fontSize="small" color="action" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={500} noWrap>{a.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        От: {a.is_anonymous ? "Анонимно" : `${a.author_surname} ${a.author_name}`}
                      </Typography>
                    </Box>
                    <StatusChip status={a.status} />
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
        </Grid>
      </Grid>

      <Collapse in={showAll}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label="Все" />
            <Tab label="Ожидают" />
            <Tab label="На рассмотрении" />
            <Tab label="Принято" />
            <Tab label="Рассмотрено" />
            <Tab label="Отклонено" />
          </Tabs>

          <Grid container spacing={2} mb={4}>
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
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {appeal.assigned_name && (
                          <Chip size="small" label={appeal.assigned_name} variant="outlined" />
                        )}
                        {appeal.status !== "resolved" && appeal.status !== "rejected" && (
                          <Box sx={{ display: "flex", gap: 0.5 }}>
                            <IconButton
                              size="small"
                              sx={{ color: "success.main", bgcolor: "success.main" + "18", "&:hover": { bgcolor: "success.main" + "30" } }}
                              onClick={(e) => { e.stopPropagation(); setConfirmDialog({ appeal, newStatus: "resolved" }); }}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              sx={{ color: "error.main", bgcolor: "error.main" + "18", "&:hover": { bgcolor: "error.main" + "30" } }}
                              onClick={(e) => { e.stopPropagation(); setConfirmDialog({ appeal, newStatus: "rejected" }); }}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
      </Collapse>

      <Box sx={{ animation: `${fadeIn} 0.25s 0.15s ease forwards`, opacity: 0 }}>
        <Card sx={{ p: 3, background: theme.palette.background.fourth }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>Объявления</Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={() => setAnnDialogOpen(true)} sx={{ textTransform: "none" }}>
              Добавить
            </Button>
          </Box>
          {announcements.length === 0 && (
            <Typography variant="body2" color="text.secondary">Пока нет объявлений</Typography>
          )}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {announcements.map((a) => (
              <Box key={a._id} sx={{
                p: 2, borderRadius: 2,
                background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>{a.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {a.author} · {a.created_at ? format(new Date(a.created_at), "dd MMM yyyy, HH:mm", { locale: ru }) : ""}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => deleteAnnouncement(a._id).then(loadData)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 1 }}>{a.content}</Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)} maxWidth="xs">
        {confirmDialog && (
          <>
            <DialogTitle>Подтверждение</DialogTitle>
            <DialogContent>
              <Typography>
                Вы точно хотите перевести обращение «{confirmDialog.appeal.title}» в статус «{confirmDialog.newStatus === "resolved" ? "Рассмотрено" : "Отклонено"}»?
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setConfirmDialog(null)} sx={{ textTransform: "none" }}>Отмена</Button>
              <Button
                variant="contained"
                color={confirmDialog.newStatus === "resolved" ? "success" : "error"}
                onClick={async () => {
                  await updateAppealStatus(confirmDialog.appeal._id, { status: confirmDialog.newStatus });
                  setConfirmDialog(null);
                  loadData();
                }}
                sx={{ textTransform: "none" }}
              >
                Подтвердить
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={annDialogOpen} onClose={() => setAnnDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Новое объявление</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField label="Заголовок" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} fullWidth />
            <TextField label="Текст" value={annContent} onChange={(e) => setAnnContent(e.target.value)} multiline minRows={4} fullWidth />
            <Button variant="contained" onClick={handleCreateAnnouncement} sx={{ textTransform: "none" }}>Опубликовать</Button>
          </Box>
        </DialogContent>
      </Dialog>

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
                        <Button key={i} size="small" variant="outlined" href={getFileUrl(selectedAppeal._id, f.stored_name)} target="_blank" sx={{ textTransform: "none" }}>
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
