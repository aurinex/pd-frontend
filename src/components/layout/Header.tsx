import { Box, Typography, Button, Menu, MenuItem, IconButton, Avatar, Badge, Divider } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../utils/UserContext";
import { useThemeContext } from "../../utils/ThemeContext";
import { useState, useEffect, useCallback, useRef } from "react";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LaptopIcon from "@mui/icons-material/Laptop";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import { useTheme } from "@mui/material/styles";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "../../services/notificationService";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface Notification {
  _id: string;
  user_id: string;
  appeal_id: string;
  type: string;
  text: string;
  read: boolean;
  created_at: string;
}

export const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isOfficer } = useUser();
  const { mode, setMode } = useThemeContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuEl, setUserMenuEl] = useState<null | HTMLElement>(null);
  const [notifAnchor, setNotifAnchor] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const fetchData = useCallback(async () => {
    try {
      const [count, notifs] = await Promise.all([getUnreadCount(), getNotifications()]);
      setUnreadCount(count.count);
      setNotifications(notifs);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchData();
    intervalRef.current = setInterval(fetchData, 15000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetchData]);

  const handleNotifClick = async (n: Notification) => {
    if (!n.read) await markAsRead(n._id).catch(() => {});
    setNotifAnchor(null);
    navigate(isOfficer ? "/admin" : "/appeals");
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead().catch(() => {});
    fetchData();
  };

  const active = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const tabStyle = (path: string) => ({
    fontSize: 15,
    textTransform: "none" as const,
    color: theme.palette.background.first,
    borderBottom: active(path) ? `2px solid ${theme.palette.primary.main}` : "2px solid transparent",
    borderRadius: 0,
    pb: "2px",
    fontFamily: "Inter",
    fontWeight: 500,
  });

  const getThemeIcon = () => {
    if (mode === "light") return <LightModeIcon />;
    if (mode === "dark") return <DarkModeIcon />;
    return <LaptopIcon />;
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: 64,
        width: "100%",
        background: theme.palette.background.nineth,
        borderBottom: `1px solid ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"}`,
        px: 3,
        position: "relative",
        zIndex: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <LocalPoliceIcon sx={{ color: theme.palette.primary.main, fontSize: 32 }} />
        <Typography
          sx={{ fontSize: 16, fontWeight: 700, color: theme.palette.background.first, mr: 4, cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          Обращения граждан
        </Typography>

        <Button sx={tabStyle("/")} onClick={() => navigate("/")} disableRipple>
          Главная
        </Button>
        <Button sx={tabStyle("/appeals")} onClick={() => navigate("/appeals")} disableRipple>
          Мои обращения
        </Button>
        <Button sx={tabStyle("/create")} onClick={() => navigate("/create")} disableRipple>
          Подать обращение
        </Button>
        {isOfficer && (
          <Button sx={tabStyle("/admin")} onClick={() => navigate("/admin")} disableRipple>
            Управление
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: "text.primary" }}>
          {getThemeIcon()}
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          <MenuItem onClick={() => { setMode("light"); setAnchorEl(null); }}>Светлая</MenuItem>
          <MenuItem onClick={() => { setMode("dark"); setAnchorEl(null); }}>Тёмная</MenuItem>
          <MenuItem onClick={() => { setMode("system"); setAnchorEl(null); }}>Системная</MenuItem>
        </Menu>

        <IconButton onClick={(e) => setNotifAnchor(e.currentTarget)} sx={{ color: "text.primary" }}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>

        <Menu
          anchorEl={notifAnchor}
          open={Boolean(notifAnchor)}
          onClose={() => setNotifAnchor(null)}
          slotProps={{ paper: { sx: { maxWidth: 400, minWidth: 340, maxHeight: 480 } } }}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1 }}>
            <Typography variant="subtitle2" fontWeight={600}>Уведомления</Typography>
            {unreadCount > 0 && (
              <Button size="small" startIcon={<MarkEmailReadIcon />} onClick={handleMarkAllRead} sx={{ textTransform: "none", fontSize: 12 }}>
                Прочитать все
              </Button>
            )}
          </Box>
          <Divider />
          {notifications.length === 0 && (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">Нет уведомлений</Typography>
            </Box>
          )}
          {notifications.slice(0, 20).map((n) => (
            <Box key={n._id}>
              <MenuItem
                onClick={() => handleNotifClick(n)}
                sx={{
                  whiteSpace: "normal",
                  py: 1.5,
                  px: 2,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  background: n.read ? "transparent" : theme.palette.action.hover,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5, width: "100%" }}>
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: n.read ? 400 : 600 }}>
                    {n.text}
                  </Typography>
                  {!n.read && <Box sx={{ width: 8, height: 8, borderRadius: "50%", background: theme.palette.primary.main, flexShrink: 0 }} />}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {n.created_at ? format(new Date(n.created_at), "dd MMM HH:mm", { locale: ru }) : ""}
                </Typography>
              </MenuItem>
              <Divider />
            </Box>
          ))}
        </Menu>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, cursor: "pointer" }}
          onClick={(e) => setUserMenuEl(e.currentTarget)}
        >
          <Typography fontSize={14} fontWeight={500} color={theme.palette.background.first}>
            {user?.name} {user?.surname}
          </Typography>
          {user?.roles?.includes("officer") && (
            <Typography fontSize={11} sx={{ color: theme.palette.primary.main, bgcolor: theme.palette.primary.main + "18", px: 1, py: 0.3, borderRadius: 1 }}>
              СОТРУДНИК
            </Typography>
          )}
          {user?.roles?.includes("admin") && (
            <Typography fontSize={11} sx={{ color: theme.palette.secondary.main, bgcolor: theme.palette.secondary.main + "18", px: 1, py: 0.3, borderRadius: 1 }}>
              АДМИН
            </Typography>
          )}
          <Avatar sx={{ width: 32, height: 32, bgcolor: theme.palette.primary.main, fontSize: 14 }}>
            {user?.name?.[0] || "?"}
          </Avatar>
        </Box>

        <Menu anchorEl={userMenuEl} open={Boolean(userMenuEl)} onClose={() => setUserMenuEl(null)}>
          <MenuItem onClick={() => { setUserMenuEl(null); logout(); navigate("/auth"); }}>
            Выйти
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};
