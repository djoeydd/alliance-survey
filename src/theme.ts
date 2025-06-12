import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
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
      default: "#F8F9FA",
      paper: "#FFFFFF",
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
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: "#F0F0FF",
          "&:hover": {
            backgroundColor: "#E0E0FF",
          },
        },
      },
    },
  },
});
