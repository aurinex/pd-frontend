import { Box, Typography, Button, Menu, MenuItem, IconButton, Avatar } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../../utils/UserContext";
import { useThemeContext } from "../../utils/ThemeContext";
import { useState } from "react";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LaptopIcon from "@mui/icons-material/Laptop";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";
import { useTheme } from "@mui/material/styles";

export const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isOfficer } = useUser();
  const { mode, setMode } = useThemeContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuEl, setUserMenuEl] = useState<null | HTMLElement>(null);

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
