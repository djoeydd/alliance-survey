import { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  ThemeProvider,
  FormControlLabel,
  Checkbox,
  CssBaseline,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useTranslation } from "react-i18next";
import { submitSurvey } from "./services/survey";
import { theme } from "./theme";

function App() {
  const { t, i18n } = useTranslation();
  const [inGameName, setInGameName] = useState("");
  const [selectedTimeZone, setSelectedTimeZone] = useState("");
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<string[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  // Generate time zone options
  const getTimeZoneOptions = () => {
    const options = [];
    const now = new Date();

    // Add user's local GMT offset at the top
    const localOffset = -now.getTimezoneOffset() / 60;
    const sign = localOffset >= 0 ? "+" : "";
    const localValue = `GMT${sign}${localOffset}`;

    options.unshift({
      value: `${localValue}_local`,
      label: `${localValue} - ${t("allianceSurvey.timeZones.local")}`,
    });

    // Add a divider
    options.push({
      value: "divider",
      label: "──────────",
      disabled: true,
    });

    // GMT offsets with example cities
    const timeZoneCities = {
      "-12": "baker_island",
      "-11": "samoa",
      "-10": "hawaii",
      "-9": "alaska",
      "-8": "los_angeles",
      "-7": "denver",
      "-6": "chicago",
      "-5": "new_york",
      "-4": "caracas",
      "-3": "sao_paulo",
      "-2": "fernando",
      "-1": "cape_verde",
      "0": "london",
      "1": "paris",
      "2": "cairo",
      "3": "moscow",
      "4": "dubai",
      "5": "karachi",
      "5.5": "new_delhi",
      "6": "dhaka",
      "7": "bangkok",
      "8": "beijing",
      "9": "tokyo",
      "9.5": "adelaide",
      "10": "sydney",
      "11": "solomon",
      "12": "auckland",
      "13": "samoa_tonga",
      "14": "line_islands",
    };

    // Add time zones with example cities
    Object.entries(timeZoneCities).forEach(([offset, cityKey]) => {
      const sign = Number(offset) >= 0 ? "+" : "";
      const value = `GMT${sign}${offset}`;
      options.push({
        value: `${value}_${cityKey}`,
        label: `${value} - ${t(`allianceSurvey.timeZones.cities.${cityKey}`)}`,
      });
    });

    return options;
  };

  const timeZoneOptions = getTimeZoneOptions();

  // Generate time slots from 00:00 to 23:00 in 1-hour intervals
  const timeSlots = Array.from({ length: 24 }, (_, i) => {
    const startHour = i.toString().padStart(2, "0");
    const endHour = ((i + 1) % 24).toString().padStart(2, "0");
    return {
      value: `${startHour}:00`,
      label: `${startHour}:00-${endHour}:00`,
    };
  });

  const handleTimeZoneChange = (event: SelectChangeEvent) => {
    setSelectedTimeZone(event.target.value);
  };

  const handleTimeSlotChange = (timeSlot: string) => {
    setSelectedTimeSlots((prev) =>
      prev.includes(timeSlot)
        ? prev.filter((t) => t !== timeSlot)
        : [...prev, timeSlot]
    );
  };

  const handleSubmit = async () => {
    try {
      await submitSurvey({
        inGameName,
        timeZone: selectedTimeZone,
        timeRanges: selectedTimeSlots,
      });

      setSnackbar({
        open: true,
        message: t("allianceSurvey.submitSuccess"),
        severity: "success",
      });

      // Reset form
      setInGameName("");
      setSelectedTimeZone("");
      setSelectedTimeSlots([]);
    } catch {
      setSnackbar({
        open: true,
        message: t("allianceSurvey.submitError"),
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleLanguageSelect = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      // Force a re-render
      setSnackbar((prev) => ({ ...prev }));
      // Log the current language for debugging
      console.log("Current language:", i18n.language);
    } catch (error) {
      console.error("Error changing language:", error);
    }
  };

  // Add effect to log language changes
  useEffect(() => {
    console.log("Language changed to:", i18n.language);
  }, [i18n.language]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
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
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              py: 2,
            }}
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
              }}
            >
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Typography
                  variant="h4"
                  component="h1"
                  gutterBottom
                  sx={{
                    background:
                      "linear-gradient(45deg, #ff4d4d 30%, #ff8533 90%)",
                    backgroundClip: "text",
                    textFillColor: "transparent",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontWeight: 800,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
                  }}
                >
                  {t("allianceSurvey.title")}
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    mb: 3,
                    color: "rgba(255, 255, 255, 0.7)",
                    fontWeight: 500,
                  }}
                >
                  {t("allianceSurvey.subtitle")}
                </Typography>
              </Box>

              <Box component="form" sx={{ mt: 3 }}>
                <Box sx={{ mb: 4, textAlign: "center" }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: "rgba(255, 255, 255, 0.9)",
                      mb: 1,
                      fontWeight: 600,
                    }}
                  >
                    Select Language / 言語を選択 / 选择语言
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    {[
                      { code: "en", label: "English" },
                      { code: "es", label: "Español" },
                      { code: "pt", label: "Português" },
                      { code: "ja", label: "日本語" },
                      { code: "zh", label: "简体中文" },
                      { code: "zh-TW", label: "繁體中文" },
                      { code: "tr", label: "Türkçe" },
                      { code: "ko", label: "한국어" },
                      { code: "fr", label: "Français" },
                      { code: "nl", label: "Nederlands" },
                      { code: "de", label: "Deutsch" },
                      { code: "ar", label: "العربية" },
                    ].map((lang) => (
                      <Button
                        key={lang.code}
                        variant="outlined"
                        size="small"
                        onClick={() => handleLanguageSelect(lang.code)}
                        sx={{
                          color:
                            i18n.language === lang.code
                              ? "#ff4d4d"
                              : "rgba(255, 255, 255, 0.7)",
                          borderColor:
                            i18n.language === lang.code
                              ? "#ff4d4d"
                              : "rgba(255, 255, 255, 0.3)",
                          "&:hover": {
                            borderColor: "#ff4d4d",
                            backgroundColor: "rgba(255, 77, 77, 0.1)",
                          },
                          minWidth: "auto",
                          px: 1.5,
                          py: 0.5,
                          fontSize: "0.875rem",
                        }}
                      >
                        {lang.label}
                      </Button>
                    ))}
                  </Box>
                </Box>

                <TextField
                  fullWidth
                  label={t("allianceSurvey.inGameName")}
                  value={inGameName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setInGameName(e.target.value)
                  }
                  margin="normal"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      "& fieldset": {
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                      "&:hover fieldset": {
                        borderColor: "#ff4d4d",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#ff4d4d",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "rgba(255, 255, 255, 0.7)",
                    },
                    "& .MuiInputBase-input": {
                      color: "rgba(255, 255, 255, 0.9)",
                    },
                  }}
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                    {t("allianceSurvey.timeZone")}
                  </InputLabel>
                  <Select
                    value={selectedTimeZone}
                    label={t("allianceSurvey.timeZone")}
                    onChange={handleTimeZoneChange}
                    sx={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: "rgba(255, 255, 255, 0.1)",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#ff4d4d",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#ff4d4d",
                      },
                      "& .MuiSelect-icon": {
                        color: "rgba(255, 255, 255, 0.7)",
                      },
                      color: "rgba(255, 255, 255, 0.9)",
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300,
                          backgroundColor: "#2d2d2d",
                          color: "rgba(255, 255, 255, 0.9)",
                        },
                      },
                    }}
                  >
                    {timeZoneOptions.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        sx={
                          option.disabled
                            ? {
                                opacity: 0.5,
                                cursor: "default",
                                "&:hover": {
                                  backgroundColor: "transparent",
                                },
                              }
                            : {
                                "&:hover": {
                                  backgroundColor: "rgba(255, 77, 77, 0.1)",
                                },
                              }
                        }
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ mt: 4 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                      color: "#ff4d4d",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {t("allianceSurvey.availableTimes")}
                  </Typography>

                  <Box sx={{ mt: 1 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, 1fr)",
                          md: "repeat(3, 1fr)",
                        },
                        gap: 2,
                      }}
                    >
                      {timeSlots.map((timeSlot) => (
                        <FormControlLabel
                          key={timeSlot.value}
                          control={
                            <Checkbox
                              checked={selectedTimeSlots.includes(
                                timeSlot.value
                              )}
                              onChange={() =>
                                handleTimeSlotChange(timeSlot.value)
                              }
                              sx={{
                                color: "rgba(255, 255, 255, 0.3)",
                                "&.Mui-checked": {
                                  color: "#ff4d4d",
                                },
                              }}
                            />
                          }
                          label={timeSlot.label}
                          sx={{
                            margin: 0,
                            "& .MuiFormControlLabel-label": {
                              fontSize: "0.875rem",
                              color: "rgba(255, 255, 255, 0.7)",
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleSubmit}
                  sx={{
                    mt: 4,
                    py: 1.5,
                    background:
                      "linear-gradient(45deg, #ff4d4d 30%, #ff8533 90%)",
                    "&:hover": {
                      background:
                        "linear-gradient(45deg, #ff3333 30%, #ff6b1a 90%)",
                    },
                    "&.Mui-disabled": {
                      background: "rgba(255, 77, 77, 0.3)",
                    },
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                  disabled={!selectedTimeZone || selectedTimeSlots.length === 0}
                >
                  {t("allianceSurvey.submit")}
                </Button>
              </Box>
            </Paper>
          </Container>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              sx={{
                width: "100%",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
                backgroundColor: "#2d2d2d",
                color: "rgba(255, 255, 255, 0.9)",
                "& .MuiAlert-icon": {
                  color:
                    snackbar.severity === "success" ? "#4caf50" : "#f44336",
                },
              }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
