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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Delete as DeleteIcon,
  DeleteSweep as DeleteSweepIcon,
} from "@mui/icons-material";
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] =
    useState<SurveyResponse | null>(null);
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);

  const getTimezoneOffset = (timezone: string): number => {
    // Extract GMT offset from timezone string (e.g., "GMT+8_beijing" -> 8)
    const match = timezone.match(/GMT([+-]\d+)/);
    if (match) {
      const offset = parseInt(match[1], 10);
      console.log(`Extracted offset ${offset} from timezone ${timezone}`);
      return offset;
    }
    console.log(`No offset found in timezone ${timezone}, defaulting to 0`);
    return 0; // Default to GMT+0 if no offset found
  };

  const convertToServerTime = (hour: string, timezone: string): string => {
    try {
      const hourNum = parseInt(hour, 10);
      const offset = getTimezoneOffset(timezone);
      console.log(
        `Converting time: Local ${hour}:00 (${timezone}) to server time`
      );
      console.log(`Hour number: ${hourNum}, Offset: ${offset}`);

      // Convert to server time (GMT+0)
      // If local time is 11:00 in GMT+9, we need to subtract 9 hours to get server time
      // Additional -2 hours adjustment needed
      const serverHour = (hourNum - offset - 2 + 24) % 24;
      console.log(
        `Server time calculation: (${hourNum} - ${offset} - 2 + 24) % 24 = ${serverHour}`
      );
      return serverHour.toString();
    } catch (error) {
      console.error("Error converting time:", error);
      return hour;
    }
  };

  const calculateTimeDistribution = (data: SurveyResponse[]) => {
    const hourCounts: { [key: string]: number } = {};

    // Initialize all hours with 0
    for (let i = 0; i < 24; i++) {
      hourCounts[i.toString()] = 0;
    }

    // Count occurrences of each hour, converting to server time
    data.forEach((response) => {
      if (response.timeRanges) {
        response.timeRanges.forEach((hour) => {
          const serverHour = convertToServerTime(hour, response.timeZone);
          console.log(`Adding count for server hour ${serverHour}:00`);
          hourCounts[serverHour] = (hourCounts[serverHour] || 0) + 1;
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

    console.log("Final time distribution:", distribution);
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

  const handleDeleteClick = (response: SurveyResponse) => {
    setSelectedResponse(response);
    setDeleteDialogOpen(true);
  };

  const handleClearAllClick = () => {
    setClearAllDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedResponse) return;

    try {
      console.log(
        `Attempting to delete response with ID: ${selectedResponse.id}`
      );
      const response = await fetch(
        `/api/admin/responses/${selectedResponse.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      console.log("Delete response data:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to delete response: ${response.status} ${response.statusText}`
        );
      }

      // Remove the deleted response from the state
      setResponses(responses.filter((r) => r.id !== selectedResponse.id));
      // Recalculate time distribution
      const newDistribution = calculateTimeDistribution(
        responses.filter((r) => r.id !== selectedResponse.id)
      );
      setTimeDistribution(newDistribution);

      // Show success message
      setError(null);
    } catch (error) {
      console.error("Error deleting response:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete response"
      );
    } finally {
      setDeleteDialogOpen(false);
      setSelectedResponse(null);
    }
  };

  const handleClearAllConfirm = async () => {
    try {
      console.log("Attempting to clear all responses");
      const response = await fetch("/api/admin/responses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Clear all response data:", data);

      if (!response.ok) {
        throw new Error(
          data.error ||
            `Failed to clear responses: ${response.status} ${response.statusText}`
        );
      }

      // Clear all responses from the state
      setResponses([]);
      setTimeDistribution([]);

      // Show success message
      setError(null);
    } catch (error) {
      console.error("Error clearing responses:", error);
      setError(
        error instanceof Error ? error.message : "Failed to clear responses"
      );
    } finally {
      setClearAllDialogOpen(false);
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
              <Tooltip title="Clear All Responses">
                <IconButton
                  onClick={handleClearAllClick}
                  sx={{ color: "rgba(255, 255, 255, 0.7)", mr: 2 }}
                >
                  <DeleteSweepIcon />
                </IconButton>
              </Tooltip>
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
                  Popular Times Distribution (Server Time GMT+0)
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
                      labelFormatter={(label) => `Server Time: ${label}`}
                      formatter={(value: number) => [
                        `${value} responses`,
                        "Count",
                      ]}
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
                      <TableCell sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {responses.map((response) => (
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
                        <TableCell>
                          <Tooltip title="Delete Response">
                            <IconButton
                              onClick={() => handleDeleteClick(response)}
                              sx={{ color: "rgba(255, 255, 255, 0.7)" }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: "rgba(28, 28, 28, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <DialogTitle sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
          Delete Response
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Are you sure you want to delete this response? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            sx={{
              color: "#ff4d4d",
              "&:hover": {
                backgroundColor: "rgba(255, 77, 77, 0.1)",
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog
        open={clearAllDialogOpen}
        onClose={() => setClearAllDialogOpen(false)}
        PaperProps={{
          sx: {
            background: "rgba(28, 28, 28, 0.95)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <DialogTitle sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
          Clear All Responses
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
            Are you sure you want to delete all responses? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setClearAllDialogOpen(false)}
            sx={{ color: "rgba(255, 255, 255, 0.7)" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClearAllConfirm}
            sx={{
              color: "#ff4d4d",
              "&:hover": {
                backgroundColor: "rgba(255, 77, 77, 0.1)",
              },
            }}
          >
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
