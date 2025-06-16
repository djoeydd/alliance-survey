import { useState, useEffect } from "react";
import { getAdminData, deleteResponse, clearAllResponses } from "../api";
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

  const calculateTimeDistribution = (
    responses: SurveyResponse[]
  ): TimeDistribution[] => {
    const hourCounts = new Array(24).fill(0);

    responses.forEach((response) => {
      if (Array.isArray(response.timeRanges)) {
        response.timeRanges.forEach((time) => {
          const hour = parseInt(time, 10);
          if (!isNaN(hour) && hour >= 0 && hour < 24) {
            hourCounts[hour]++;
          }
        });
      }
    });

    return hourCounts.map((count, hour) => ({
      hour: hour.toString(),
      count,
    }));
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const data: ApiResponse[] = await getAdminData();

      // Process the data
      const processedData = data.map((response) => ({
        id: response.id,
        gameName: response.gamename,
        timeZone: response.timezone,
        timeRanges: Array.isArray(response.timeranges)
          ? response.timeranges
          : JSON.parse(response.timeranges || "[]"),
        createdAt: response.createdat,
      }));

      setResponses(processedData);

      // Calculate time distribution
      const distribution = calculateTimeDistribution(processedData);
      setTimeDistribution(distribution);
    } catch {
      setError("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTimeRanges = (timeRanges: string[] | string | null): string => {
    if (!timeRanges || timeRanges.length === 0) {
      return "No times selected";
    }

    try {
      // Ensure we're working with an array
      const ranges = Array.isArray(timeRanges) ? timeRanges : [timeRanges];

      // Filter out any invalid values and sort numerically
      const validHours = ranges
        .filter((t): t is string => typeof t === "string")
        .map((hour) => parseInt(hour, 10))
        .filter((hour) => !isNaN(hour))
        .sort((a, b) => a - b);

      if (validHours.length === 0) {
        return "No times selected";
      }

      return validHours.join(", ");
    } catch {
      return "Invalid time format";
    }
  };

  const formatTimeZone = (timeZone: string | null): string => {
    if (!timeZone) return "Unknown";

    try {
      // Extract the GMT part from the timezone string
      const gmtMatch = timeZone.match(/GMT[+-]\d+(\.\d+)?/);
      if (gmtMatch) {
        return gmtMatch[0];
      }
      return timeZone;
    } catch {
      return "Unknown";
    }
  };

  const formatDate = (date: string | null): string => {
    if (!date) return "Unknown";

    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return "Unknown";
      }
      return d.toLocaleString();
    } catch {
      return "Unknown";
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
      await deleteResponse(selectedResponse.id);

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
      await clearAllResponses();

      // Clear all responses from the state
      setResponses([]);
      setTimeDistribution([]);

      // Show success message
      setError(null);
    } catch (error) {
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
