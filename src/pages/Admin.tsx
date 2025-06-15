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

interface SurveyResponse {
  id: number;
  gameName: string;
  timeZone: string;
  timeRanges: string[] | null;
  createdAt: string;
}

interface ApiResponse {
  id: number;
  gameName: string;
  timeZone: string;
  timeRanges: unknown;
  createdAt: string;
}

export default function Admin() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminData();
      // Process timeRanges to extract only hour numbers
      const processedData = data.map((response: ApiResponse) => ({
        ...response,
        timeRanges: Array.isArray(response.timeRanges)
          ? response.timeRanges
              .filter((time): time is string => typeof time === "string")
              .map((time) => {
                // Extract hour number from time string (e.g., "01:00" -> "1")
                const hour = time.split(":")[0];
                return hour.replace(/^0+/, ""); // Remove leading zeros
              })
          : [],
      }));
      setResponses(processedData);
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
      if (!timeRanges || !Array.isArray(timeRanges)) return "No times selected";

      // Sort hours numerically
      const sortedHours = timeRanges
        .filter((hour): hour is string => typeof hour === "string")
        .map((hour) => parseInt(hour, 10))
        .sort((a, b) => a - b)
        .map((hour) => hour.toString());

      return sortedHours.join(", ") || "No times selected";
    } catch (error) {
      console.error("Error formatting time ranges:", error);
      return "Error formatting times";
    }
  };

  const formatTimeZone = (timeZone: string): string => {
    try {
      if (!timeZone) return "Unknown";
      const parts = timeZone.split("_");
      return parts[0] || timeZone;
    } catch (error) {
      console.error("Error formatting timezone:", error);
      return timeZone || "Unknown";
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
                          {response.createdAt
                            ? new Date(response.createdAt).toLocaleString()
                            : "Unknown"}
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
    </Box>
  );
}
