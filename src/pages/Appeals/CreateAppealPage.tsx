import {
  Box, Typography, TextField, Button, Card, Select, MenuItem, FormControl, InputLabel, Switch, FormControlLabel,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createAppeal, uploadAppealFiles } from "../../services/appealService";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";

export const CreateAppealPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("other");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    setError("");
    if (!title.trim() || !content.trim()) {
      setError("Заполните все поля");
      return;
    }
    setLoading(true);
    try {
      const result = await createAppeal({ title, content, category, is_anonymous: isAnonymous });

      if (files.length > 0) {
        await uploadAppealFiles(result._id, files);
      }

      navigate(`/?success=${result._id}`);
    } catch (err: any) {
      setError(err.message || "Ошибка при создании обращения");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const categories = [
    { value: "complaint", label: "Жалоба" },
    { value: "statement", label: "Заявление" },
    { value: "proposal", label: "Предложение" },
    { value: "crime_report", label: "Сообщение о преступлении" },
    { value: "other", label: "Другое" },
  ];

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", p: 4 }}>
      <Card sx={{ p: 4, borderRadius: 3, background: theme.palette.background.fourth }}>
        <Typography variant="h5" fontWeight={700} mb={0.5}>
          Подать обращение
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={4}>
          Заполните форму для направления обращения в органы внутренних дел
        </Typography>

        {error && (
          <Typography color="error.main" fontSize={14} mb={2}>
            {error}
          </Typography>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField label="Тема обращения" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth required />

          <FormControl fullWidth>
            <InputLabel>Категория обращения</InputLabel>
            <Select value={category} label="Категория обращения" onChange={(e) => setCategory(e.target.value)}>
              {categories.map((c) => (
                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Текст обращения"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            minRows={8}
            maxRows={16}
            fullWidth
            required
            placeholder="Опишите подробно суть вашего обращения..."
          />

          <Box>
            <input ref={fileRef} type="file" multiple onChange={handleFileChange} style={{ display: "none" }} />
            <Button variant="outlined" startIcon={<AttachFileIcon />} onClick={() => fileRef.current?.click()} sx={{ textTransform: "none" }}>
              Прикрепить файлы
            </Button>
            {files.length > 0 && (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                {files.map((f, i) => (
                  <Chip key={i} label={f.name} onDelete={() => removeFile(i)} size="small" />
                ))}
              </Box>
            )}
          </Box>

          <FormControlLabel
            control={<Switch checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} />}
            label="Подать анонимно (мои данные не будут видны сотруднику)"
          />

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button variant="outlined" onClick={() => navigate("/")} sx={{ textTransform: "none" }}>
              Отмена
            </Button>
            <Button variant="contained" startIcon={<SendIcon />} onClick={handleSubmit} disabled={loading} sx={{ textTransform: "none", fontWeight: 600 }}>
              {loading ? "Отправка..." : "Отправить обращение"}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
};
