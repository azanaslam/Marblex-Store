import { createTheme } from "@mui/material/styles";

export const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0a3d52", // MARBLEX Navy Teal
      light: "#125a78",
      dark: "#062b3a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ff6b4a", // MARBLEX Red-Orange Accent
      light: "#ff8c73",
      dark: "#e65636",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f7fa", // MARBLEX Light Gray
      paper: "#ffffff",
    },
    text: {
      primary: "#0f1929", // MARBLEX Dark Text
      secondary: "#565e69", // Medium Gray
    },
    success: {
      main: "#10b981",
    },
    warning: {
      main: "#f59e0b",
    },
    error: {
      main: "#ef4444",
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: "'Inter', 'Poppins', sans-serif",
    h1: { fontFamily: "'Space Grotesk', 'Poppins', sans-serif", fontWeight: 700, letterSpacing: "-0.025em" },
    h2: { fontFamily: "'Space Grotesk', 'Poppins', sans-serif", fontWeight: 700, letterSpacing: "-0.025em" },
    h3: { fontFamily: "'Space Grotesk', 'Poppins', sans-serif", fontWeight: 700, letterSpacing: "-0.02em" },
    h4: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Poppins', sans-serif", fontWeight: 600 },
    button: { 
      fontFamily: "'Poppins', sans-serif",
      textTransform: "none", 
      fontWeight: 600,
      letterSpacing: "0.01em"
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: "8px 20px",
          boxShadow: "none",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: "1px solid #e0e6ed",
          borderRadius: 16,
          boxShadow: "0 2px 4px rgba(10, 61, 82, 0.06), 0 8px 16px rgba(10, 61, 82, 0.08)",
          transition: "all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-3px)",
            borderColor: "#ff8c73",
            boxShadow: "0 4px 8px rgba(10, 61, 82, 0.08), 0 16px 32px rgba(10, 61, 82, 0.12)",
          },
        },
      },
    },
  },
});
