import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6C63FF", // Modern purple
      light: "#8F88FF",
      dark: "#4A43D6",
    },
    secondary: {
      main: "#FF6B6B", // Coral accent
      light: "#FF8E8E",
      dark: "#D64A4A",
    },
    background: {
      default: "#1a1a1a",
      paper: "#2d2d2d",
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      letterSpacing: "-0.5px",
    },
    h6: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minHeight: "100dvh",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          backgroundAttachment: "fixed",
          WebkitOverflowScrolling: "touch",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          padding: "10px 24px",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          background: "rgba(45, 45, 45, 0.95)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(108, 99, 255, 0.1)",
          "&:hover": {
            backgroundColor: "rgba(108, 99, 255, 0.2)",
          },
        },
      },
    },
  },
});
