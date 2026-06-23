import { createContext, useContext, useMemo, useState, useEffect } from "react";
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

type Mode = "light" | "dark" | "system";

const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
  const [mode, setModeState] = useState<Mode>(
    (localStorage.getItem("pd_theme") as Mode) || "system",
  );

  const setMode = (value: Mode) => {
    localStorage.setItem("pd_theme", value);
    setModeState(value);
  };

  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme());

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => {
      setSystemTheme(media.matches ? "dark" : "light");
    };
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  const actualMode: "light" | "dark" = mode === "system" ? systemTheme : mode;

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: actualMode,
          primary: {
            main: actualMode === "dark" ? "#5c6bc0" : "#1a237e",
            light: actualMode === "dark" ? "#8e99d3" : "#3949ab",
            dark: actualMode === "dark" ? "#3949ab" : "#0d1654",
          },
          secondary: {
            main: actualMode === "dark" ? "#26a69a" : "#00897b",
          },
          background: {
            first: actualMode === "dark" ? "#ffffff" : "#000000",
            second: actualMode === "dark" ? "#3a3a4a" : "#e8eaf6",
            third: actualMode === "dark" ? "#1e1e2e" : "#f5f5ff",
            fourth: actualMode === "dark" ? "#2a2a3a" : "#ffffff",
            fiveth: actualMode === "dark" ? "#252535" : "#f0f0fa",
            sixth: actualMode === "dark" ? "#1b5e20" : "#66bb6a",
            seventh: actualMode === "dark" ? "#696969" : "#9e9e9e",
            eighth: actualMode === "dark" ? "#e65100" : "#ff9800",
            nineth: actualMode === "dark" ? "#16162a" : "#ffffff",
            hovered: actualMode === "dark" ? "#5c6bc0" : "#3949ab",
            inversion: actualMode === "dark" ? "#000000" : "#ffffff",
            default: actualMode === "dark" ? "#1e1e2e" : "#f5f5ff",
            paper: actualMode === "dark" ? "#252535" : "#ffffff",
          },
        },
        typography: {
          fontFamily: "Inter, sans-serif",
          fontWeightRegular: 400,
        },
        shape: {
          borderRadius: 12,
        },
      }),
    [actualMode],
  );

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
