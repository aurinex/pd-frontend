import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const Footer = () => {
  const theme = useTheme();
  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        py: 3,
        px: 4,
        textAlign: "center",
        borderTop: "1px solid",
        borderColor: "divider",
        background: theme.palette.background.nineth,
        position: "relative",
        zIndex: 1,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Министерство внутренних дел · Система приёма обращений граждан
      </Typography>
    </Box>
  );
};
