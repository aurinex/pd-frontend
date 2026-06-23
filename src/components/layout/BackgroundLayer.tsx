import { Box } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import LocalPoliceIcon from "@mui/icons-material/LocalPolice";

export const BackgroundLayer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
        backgroundImage: `
          radial-gradient(${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"} 1.5px, transparent 1.5px)
        `,
        backgroundSize: "24px 24px",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          opacity: isDark ? 0.06 : 0.05,
        }}
      >
        <LocalPoliceIcon sx={{ fontSize: 600, color: "text.primary" }} />
      </Box>
      <Box
        sx={{
          position: "absolute",
          top: "20%",
          right: "10%",
          opacity: isDark ? 0.05 : 0.04,
          transform: "rotate(30deg)",
        }}
      >
        <LocalPoliceIcon sx={{ fontSize: 200, color: "text.primary" }} />
      </Box>
      <Box
        sx={{
          position: "absolute",
          bottom: "15%",
          left: "8%",
          opacity: isDark ? 0.05 : 0.04,
          transform: "rotate(-20deg)",
        }}
      >
        <LocalPoliceIcon sx={{ fontSize: 150, color: "text.primary" }} />
      </Box>
    </Box>
  );
};
