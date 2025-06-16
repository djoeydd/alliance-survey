import { useState, useEffect } from "react";
import { getAdminData } from "../api";
import {
  Container,
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Refresh as RefreshIcon, Home as HomeIcon } from "@mui/icons-material";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface SurveyResponse {
  id: number;
  gameName: string;
  timeZone: string;
  timeRanges: string[] | null;
  createdAt: string;
}

interface ApiResponse {
  id: number;
  gamename: string;
  timezone: string;
  timeranges: string[] | string | null;
  createdat: string;
}

interface TimeDistribution {
  hour: string;
  count: number;
}

export default function Admin() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeDistribution, setTimeDistribution] = useState<TimeDistribution[]>(
    []
  );

  const calculateTimeDistribution = (data: SurveyResponse[]) => {
    const hourCounts: { [key: string]: number } = {};

    // Initialize all hours with 0
    for (let i = 0; i < 24; i++) {
      hourCounts[i.toString()] = 0;
    }

    // Count occurrences of each hour
    data.forEach((response) => {
      if (response.timeRanges) {
        response.timeRanges.forEach((hour) => {
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        });
      }
    });

    // Convert to array and sort by hour
    const distribution = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: `${hour}:00`,
        count,
      }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));

    return distribution;
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching admin data...");
      const data = await getAdminData();
      console.log("Raw API response:", JSON.stringify(data, null, 2));

      // Process timeRanges to extract only hour numbers
      const processedData = data.map((response: ApiResponse) => {
        console.log("Processing response:", JSON.stringify(response, null, 2));
        let timeRanges: string[] = [];

        try {
          // Handle both string and array formats
          const rawTimeRanges = response.timeranges;
          if (typeof rawTimeRanges === "string") {
            console.log("Parsing timeRanges string:", rawTimeRanges);
            timeRanges = JSON.parse(rawTimeRanges);
          } else if (Array.isArray(rawTimeRanges)) {
            console.log("Using timeRanges array:", rawTimeRanges);
            timeRanges = rawTimeRanges;
          } else if (rawTimeRanges === null) {
            console.log("timeRanges is null");
            timeRanges = [];
          } else {
            console.log("Invalid timeRanges format:", rawTimeRanges);
            timeRanges = [];
          }

          // Extract hour numbers and remove leading zeros
          timeRanges = timeRanges
            .filter((time): time is string => typeof time === "string")
            .map((time) => {
              console.log("Processing time:", time);
              // Extract hour number from time string (e.g., "01:00" -> "1")
              const hour = time.split(":")[0];
              const processedHour = hour.replace(/^0+/, ""); // Remove leading zeros
              console.log(`Converted ${time} to ${processedHour}`);
              return processedHour;
            });
        } catch (e) {
          console.error("Error processing timeRanges:", e);
          timeRanges = [];
        }

        const processed = {
          id: response.id,
          gameName: response.gamename || "Unnamed",
          timeZone: response.timezone || "Unknown",
          timeRanges: timeRanges.length > 0 ? timeRanges : null,
          createdAt: response.createdat || new Date().toISOString(),
        };
        console.log("Processed response:", JSON.stringify(processed, null, 2));
        return processed;
      });

      console.log(
        "Final processed data:",
        JSON.stringify(processedData, null, 2)
      );
      setResponses(processedData);

      // Calculate time distribution
      const distribution = calculateTimeDistribution(processedData);
      setTimeDistribution(distribution);
    } catch (error) {
      console.error("Error fetching survey responses:", error);
      setError("Failed to load survey responses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTimeRanges = (timeRanges: string[] | null): string => {
    try {
      if (
        !timeRanges ||
        !Array.isArray(timeRanges) ||
        timeRanges.length === 0
      ) {
        console.log("No time ranges to format");
        return "No times selected";
      }

      console.log("Formatting timeRanges:", timeRanges);
      // Sort hours numerically
      const sortedHours = timeRanges
        .filter((hour): hour is string => typeof hour === "string")
        .map((hour) => parseInt(hour, 10))
        .sort((a, b) => a - b)
        .map((hour) => hour.toString());

      console.log("Sorted hours:", sortedHours);
      return sortedHours.join(", ") || "No times selected";
    } catch (error) {
      console.error("Error formatting time ranges:", error);
      return "Error formatting times";
    }
  };

  const formatTimeZone = (timeZone: string): string => {
    try {
      if (!timeZone || timeZone === "Unknown") {
        console.log("Empty or unknown timezone");
        return "Unknown";
      }
      console.log("Formatting timezone:", timeZone);
      const parts = timeZone.split("_");
      const result = parts[0] || timeZone;
      console.log("Formatted timezone:", result);
      return result;
    } catch (error) {
      console.error("Error formatting timezone:", error);
      return "Unknown";
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      if (!dateString) {
        return "Unknown";
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid date";
      }
      return date.toLocaleString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            background: "rgba(28, 28, 28, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 4,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{
                background: "linear-gradient(45deg, #ff4d4d 30%, #ff8533 90%)",
                backgroundClip: "text",
                textFillColor: "transparent",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 800,
              }}
            >
              Admin Panel
            </Typography>
            <Box>
              <Tooltip title="Refresh Data">
                <IconButton
                  onClick={fetchData}
                  sx={{ color: "rgba(255, 255, 255, 0.7)", mr: 2 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Button
                component={Link}
                to="/"
                variant="outlined"
                startIcon={<HomeIcon />}
                sx={{
                  color: "rgba(255, 255, 255, 0.7)",
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  "&:hover": {
                    borderColor: "#ff4d4d",
                    backgroundColor: "rgba(255, 77, 77, 0.1)",
                  },
                }}
              >
                Back to Survey
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress sx={{ color: "#ff4d4d" }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : (
            <Box>
              {/* Time Distribution Chart */}
              <Box sx={{ mb: 4, height: 300 }}>
                <Typography
                  variant="h6"
                  sx={{
                    color: "rgba(255, 255, 255, 0.9)",
                    mb: 2,
                    fontWeight: 600,
                  }}
                >
                  Popular Times Distribution
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={timeDistribution}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255, 255, 255, 0.1)"
                    />
                    <XAxis
                      dataKey="hour"
                      stroke="rgba(255, 255, 255, 0.7)"
                      tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
                    />
                    <YAxis
                      stroke="rgba(255, 255, 255, 0.7)"
                      tick={{ fill: "rgba(255, 255, 255, 0.7)" }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "rgba(28, 28, 28, 0.95)",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        color: "rgba(255, 255, 255, 0.9)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="url(#colorGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                    <defs>
                      <linearGradient
                        id="colorGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#ff4d4d"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#ff8533"
                          stopOpacity={0.8}
                        />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                        Game Name
                      </TableCell>
                      <TableCell sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                        Time Zone
                      </TableCell>
                      <TableCell sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                        Available Hours
                      </TableCell>
                      <TableCell sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                        Submitted
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {responses.map((response) => {
                      console.log("Rendering response:", response);
                      return (
                        <TableRow
                          key={response.id}
                          sx={{
                            "&:hover": {
                              backgroundColor: "rgba(255, 255, 255, 0.05)",
                            },
                          }}
                        >
                          <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                            {response.gameName || "Unnamed"}
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                            {formatTimeZone(response.timeZone)}
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                            {formatTimeRanges(response.timeRanges)}
                          </TableCell>
                          <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                            {formatDate(response.createdAt)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
