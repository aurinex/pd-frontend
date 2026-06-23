import {
  Box, Typography, Card, CardContent, CardActions, Button, Grid, Chip, Dialog, DialogTitle,
  DialogContent, DialogActions, Avatar, IconButton, TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAppeals, sendAppealMessage } from "../../services/appealService";
import { useTheme } from "@mui/material/styles";
import { StatusChip } from "../../components/common/StatusChip";
import { translateAction } from "../../utils/statusLabels";
import { getFileUrl } from "../../services/api";
import { useUser } from "../../utils/UserContext";
import type { Appeal } from "../../types/appeal";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export const AppealsPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Appeal | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { user } = useUser();

  const load = async () => {
    try {
      const data = await getAppeals();
      setAppeals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSendMessage = async () => {
    if (!selected || !messageText.trim()) return;
    setSendingMessage(true);
    try {
      const fullName = user ? `${user.surname} ${user.name}` : "Пользователь";
      const updated = await sendAppealMessage(selected._id, messageText, fullName, user?._id || "");
      setSelected(updated);
      setMessageText("");
      load();
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    complaint: "Жалоба",
    statement: "Заявление",
    proposal: "Предложение",
    crime_report: "Сообщение о преступлении",
    other: "Другое",
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <Typography>Загрузка...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Мои обращения</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Всего обращений: {appeals.length}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/create")} sx={{ textTransform: "none", fontWeight: 600 }}>
          Подать обращение
        </Button>
      </Box>

      {appeals.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center", background: theme.palette.background.fourth }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            У вас пока нет обращений
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate("/create")} sx={{ textTransform: "none", mt: 2 }}>
            Создать первое обращение
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {appeals.map((appeal) => (
            <Grid size={12} key={appeal._id}>
              <Card
                sx={{
                  background: theme.palette.background.fourth,
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" },
                }}
                onClick={() => setSelected(appeal)}
              >
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {appeal.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {categoryLabels[appeal.category] || appeal.category}
                        {appeal.is_anonymous && " · Анонимно"}
                        {" · "}
                        {appeal.created_at
                          ? format(new Date(appeal.created_at), "dd MMM yyyy, HH:mm", { locale: ru })
                          : ""}
                      </Typography>
                    </Box>
                    <StatusChip status={appeal.status} />
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      maxWidth: "100%",
                    }}
                  >
                    {appeal.content}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button size="small" sx={{ textTransform: "none" }} onClick={(e) => { e.stopPropagation(); setSelected(appeal); }}>
                    Подробнее
                  </Button>
                  {appeal.response && (
                    <Chip label="Есть ответ" color="success" size="small" variant="outlined" />
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>{selected.title}</Typography>
                <StatusChip status={selected.status} />
              </Box>
              <IconButton onClick={() => setSelected(null)}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Категория</Typography>
                  <Typography variant="body2">{categoryLabels[selected.category] || selected.category}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Текст обращения</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>{selected.content}</Typography>
                </Box>

                {selected.response && (
                  <Box sx={{
                    p: 2, borderRadius: 2,
                    background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  }}>
                    <Typography variant="caption" color="success.main" fontWeight={600}>Ответ сотрудника</Typography>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}>{selected.response}</Typography>
                  </Box>
                )}

                {selected.files && selected.files.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">Прикреплённые файлы</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {selected.files.map((f, i) => (
                        <Button
                          key={i}
                          size="small"
                          variant="outlined"
                          href={getFileUrl(selected._id, f.stored_name)}
                          target="_blank"
                          sx={{ textTransform: "none" }}
                        >
                          {f.original_name}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {selected.messages && selected.messages.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">Мои дополнительные сведения</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      {[...selected.messages].reverse().map((m, i) => (
                        <Box key={i} sx={{
                          p: 1.5, borderRadius: 2,
                          background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                        }}>
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{m.text}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {m.date ? format(new Date(m.date), "dd.MM HH:mm") : ""}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {selected.allow_messages && (
                  <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                    <TextField
                      label="Дополнительные сведения"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      fullWidth
                      size="small"
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={sendingMessage || !messageText.trim()}
                      sx={{ textTransform: "none", minWidth: 100, height: 40 }}
                      endIcon={<SendIcon />}
                    >
                      {sendingMessage ? "..." : "Отправить"}
                    </Button>
                  </Box>
                )}

                {selected.history && selected.history.length > 0 && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">История</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                      {[...selected.history].reverse().map((h, i) => (
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
              <Button onClick={() => setSelected(null)} sx={{ textTransform: "none" }}>Закрыть</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
