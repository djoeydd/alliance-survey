import { Box, Container, Paper, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

function ThankYou() {
  const { t } = useTranslation();

  return (
    <Box
      sx={{
        minHeight: { xs: "100dvh", sm: "100vh" },
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        py: 4,
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{ flex: 1, display: "flex", flexDirection: "column", py: 2 }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: "rgba(28, 28, 28, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <CheckCircleOutlineIcon
            sx={{
              fontSize: 80,
              color: "#ff4d4d",
              mb: 3,
              animation: "scaleIn 0.5s ease-out",
              "@keyframes scaleIn": {
                "0%": {
                  transform: "scale(0)",
                  opacity: 0,
                },
                "100%": {
                  transform: "scale(1)",
                  opacity: 1,
                },
              },
            }}
          />

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              background: "linear-gradient(45deg, #ff4d4d 30%, #ff8533 90%)",
              backgroundClip: "text",
              textFillColor: "transparent",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 800,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              animation: "fadeIn 0.5s ease-out 0.3s both",
              "@keyframes fadeIn": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(20px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            {t("allianceSurvey.thankYou")}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: "rgba(255, 255, 255, 0.9)",
              mb: 4,
              fontWeight: 500,
              maxWidth: "600px",
              animation: "fadeIn 0.5s ease-out 0.5s both",
            }}
          >
            {t("allianceSurvey.thankYouMessage")}
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              justifyContent: "center",
              animation: "fadeIn 0.5s ease-out 0.7s both",
            }}
          >
            <Button
              component={Link}
              to="/"
              variant="outlined"
              sx={{
                color: "rgba(255, 255, 255, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.3)",
                "&:hover": {
                  borderColor: "#ff4d4d",
                  backgroundColor: "rgba(255, 77, 77, 0.1)",
                },
              }}
            >
              {t("allianceSurvey.backToSurvey")}
            </Button>

            <Button
              component={Link}
              to="/admin"
              variant="contained"
              sx={{
                background: "linear-gradient(45deg, #ff4d4d 30%, #ff8533 90%)",
                "&:hover": {
                  background:
                    "linear-gradient(45deg, #ff3333 30%, #ff6b1a 90%)",
                },
                fontWeight: 600,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {t("allianceSurvey.viewResults")}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default ThankYou;
