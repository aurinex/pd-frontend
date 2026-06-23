import { Box, TextField, Button, Card, Typography, Divider, Tabs, Tab } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/authService";
import { useUser } from "../../utils/UserContext";

export const AuthPage = () => {
  const theme = useTheme();
  const { login } = useUser();
  const [mode, setMode] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === 0) {
        const data = await loginUser(email, password);
        login(
          { _id: data.user_id, name: data.name, surname: data.surname, email: data.email, roles: data.roles || ["user"] },
          data.token,
        );
      } else {
        if (password !== confirmPassword) {
          setError("Пароли не совпадают");
          setLoading(false);
          return;
        }
        const data = await registerUser(email, name, surname, password);
        login(
          { _id: data.user_id, name: data.name, surname: data.surname, email: data.email, roles: data.roles || ["user"] },
          data.token,
        );
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Ошибка соединения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: theme.palette.background.fiveth }}>
      <Card sx={{ width: 420, p: 5, borderRadius: 3, display: "flex", flexDirection: "column", gap: 3, boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }}>
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
          <LocalPoliceIcon sx={{ fontSize: 44, color: theme.palette.primary.main }} />
          <Typography variant="h5" fontWeight={700}>Система обращений</Typography>
          <Typography variant="body2" color="text.secondary">Органы внутренних дел</Typography>
        </Box>

        <Tabs value={mode} onChange={(_, v) => { setMode(v); setError(""); }} centered>
          <Tab label="Войти" />
          <Tab label="Регистрация" />
        </Tabs>

        {error && <Typography color="error.main" fontSize={14} textAlign="center">{error}</Typography>}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {mode === 1 && (
            <>
              <TextField label="Имя" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
              <TextField label="Фамилия" value={surname} onChange={(e) => setSurname(e.target.value)} fullWidth />
            </>
          )}
          <TextField label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} fullWidth />
          <TextField label="Пароль" type="password" value={password} onChange={(e) => setPassword(e.target.value)} fullWidth />
          {mode === 1 && (
            <TextField label="Подтвердите пароль" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} fullWidth />
          )}
          <Button variant="contained" onClick={handleSubmit} disabled={loading} size="large" sx={{ py: 1.2, textTransform: "none", fontWeight: 600 }}>
            {loading ? "Загрузка..." : mode === 0 ? "Войти" : "Зарегистрироваться"}
          </Button>
        </Box>

        {mode === 0 && <Divider />}

        {mode === 0 && (
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Для регистрации переключитесь на вкладку «Регистрация»
          </Typography>
        )}
      </Card>
    </Box>
  );
};
