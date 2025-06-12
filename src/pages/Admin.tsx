import { useState, useEffect } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import { theme } from "../theme";
import { ThemeProvider } from "@mui/material/styles";

interface SurveyResponse {
  inGameName: string;
  timeZone: string;
  timeRanges: string[];
}

interface TimeZoneStat {
  timeZone: string;
  count: number;
}

interface TimeRangeStat {
  timeRange: string;
  count: number;
}

interface AdminData {
  responses: SurveyResponse[];
  timeZoneStats: TimeZoneStat[];
  timeRangeStats: TimeRangeStat[];
}

// Function to convert time range to server time (UTC-11)
const convertToUTC11 = (timeRange: string, fromTimeZone: string): string => {
  // Extract the time from the range (e.g., "09:00 - 10:00" -> "09:00")
  const [startTime] = timeRange.split(" - ");

  // Extract hours and minutes
  const [hours, minutes] = startTime.split(":").map(Number);

  // Get timezone offset (handle both UTC and GMT formats)
  let timeZoneOffset;
  if (fromTimeZone.startsWith("GMT")) {
    // Extract the number from GMT+X or GMT-X
    timeZoneOffset = parseInt(
      fromTimeZone.replace("GMT", "").replace("_local", "")
    );
  } else {
    // Handle UTC format
    timeZoneOffset = parseInt(fromTimeZone.replace("UTC", ""));
  }

  console.log("Time conversion debug:");
  console.log("Original time:", startTime);
  console.log("Timezone offset:", timeZoneOffset);
  console.log("Hours:", hours);
  console.log("Minutes:", minutes);

  // Convert to server time (UTC-11)
  // Simply subtract 11 hours from the local time
  let serverHours = (hours - 11 + 24) % 24;
  console.log("After converting to server time:", serverHours);

  // Format as 24-hour time
  const result = `${serverHours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  console.log("Final result:", result);
  return result;
};

function Admin() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        console.log("Fetching admin data...");
        const response = await fetch("http://localhost:3001/api/admin");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Admin data received:", data);
        setAdminData(data);
      } catch (err) {
        console.error("Error fetching admin data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch admin data"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          }}
        >
          <CircularProgress sx={{ color: "#ff4d4d" }} />
        </Box>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          }}
        >
          <Alert severity="error" sx={{ maxWidth: 600 }}>
            {error}
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  if (!adminData) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          }}
        >
          <Alert severity="info" sx={{ maxWidth: 600 }}>
            No data available
          </Alert>
        </Box>
      </ThemeProvider>
    );
  }

  // Convert all time ranges to UTC-11 and create new stats
  const convertedTimeRangeStats = adminData.responses.reduce(
    (acc, response) => {
      response.timeRanges.forEach((timeRange) => {
        const convertedTime = convertToUTC11(timeRange, response.timeZone);
        const existingStat = acc.find(
          (stat) => stat.timeRange === convertedTime
        );
        if (existingStat) {
          existingStat.count++;
        } else {
          acc.push({ timeRange: convertedTime, count: 1 });
        }
      });
      return acc;
    },
    [] as TimeRangeStat[]
  );

  // Sort by time
  convertedTimeRangeStats.sort((a, b) => {
    const [hoursA, minutesA] = a.timeRange.split(":").map(Number);
    const [hoursB, minutesB] = b.timeRange.split(":").map(Number);

    // Compare hours first, then minutes
    if (hoursA !== hoursB) return hoursA - hoursB;
    return minutesA - minutesB;
  });

  // Calculate total responses
  const totalResponses = adminData.responses.length;

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              color: "#ff4d4d",
              textAlign: "center",
              mb: 4,
              fontWeight: 600,
            }}
          >
            Survey Dashboard
          </Typography>

          {/* Summary Stats */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, md: 4 }} component="div">
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background:
                    "linear-gradient(45deg, #1a237e 30%, #283593 90%)",
                  color: "white",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Total Responses
                </Typography>
                <Typography variant="h4">
                  {adminData.responses.length}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }} component="div">
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background:
                    "linear-gradient(45deg, #b71c1c 30%, #c62828 90%)",
                  color: "white",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Time Zones
                </Typography>
                <Typography variant="h4">
                  {adminData.timeZoneStats.length}
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, md: 4 }} component="div">
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background:
                    "linear-gradient(45deg, #1b5e20 30%, #2e7d32 90%)",
                  color: "white",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Time Slots (UTC-11)
                </Typography>
                <Typography variant="h4">
                  {convertedTimeRangeStats.length}
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Grid container spacing={4}>
            {/* Time Zone Distribution */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 6 }} component="div">
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#ff4d4d", mb: 2 }}>
                      Time Zone Distribution
                    </Typography>
                    {adminData.timeZoneStats.map((stat) => (
                      <Box
                        key={stat.timeZone}
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 1,
                          background: "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6, md: 7 }} component="div">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Time Zone
                            </Typography>
                            <Typography
                              sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                            >
                              {stat.timeZone}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 5 }} component="div">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Responses
                            </Typography>
                            <Typography
                              sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                            >
                              {stat.count}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Time Range Distribution (UTC-11) */}
              <Grid size={{ xs: 12, md: 6 }} component="div">
                <Card
                  sx={{
                    background: "rgba(255, 255, 255, 0.05)",
                    backdropFilter: "blur(10px)",
                    borderRadius: 2,
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#ff4d4d", mb: 2 }}>
                      Time Range Distribution (UTC-11)
                    </Typography>
                    {convertedTimeRangeStats.map((stat) => (
                      <Box
                        key={stat.timeRange}
                        sx={{
                          mb: 2,
                          p: 2,
                          borderRadius: 1,
                          background: "rgba(255, 255, 255, 0.05)",
                        }}
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6, md: 7 }} component="div">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Time Slot
                            </Typography>
                            <Typography
                              sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                            >
                              {stat.timeRange}
                            </Typography>
                          </Grid>
                          <Grid size={{ xs: 6, md: 5 }} component="div">
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Responses
                            </Typography>
                            <Typography
                              sx={{ color: "rgba(255, 255, 255, 0.9)" }}
                            >
                              {stat.count}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* All Responses */}
            <Grid size={{ xs: 12 }} component="div">
              <Card
                sx={{
                  background: "rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ color: "#ff4d4d", mb: 2 }}>
                    All Responses
                  </Typography>
                  {adminData.responses.map((response, index) => (
                    <Box
                      key={index}
                      sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 1,
                        background: "rgba(255, 255, 255, 0.05)",
                        "&:last-child": {
                          mb: 0,
                        },
                      }}
                    >
                      <Typography
                        sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 1 }}
                      >
                        <strong>In-Game Name:</strong> {response.inGameName}
                      </Typography>
                      <Typography
                        sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 1 }}
                      >
                        <strong>Time Zone:</strong> {response.timeZone}
                      </Typography>
                      <Typography
                        sx={{ color: "rgba(255, 255, 255, 0.9)", mb: 1 }}
                      >
                        <strong>Original Time Ranges:</strong>{" "}
                        {response.timeRanges.join(", ")}
                      </Typography>
                      <Typography sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        <strong>Time Ranges (UTC-11):</strong>{" "}
                        {response.timeRanges
                          .map((timeRange) =>
                            convertToUTC11(timeRange, response.timeZone)
                          )
                          .join(", ")}
                      </Typography>
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Admin;
