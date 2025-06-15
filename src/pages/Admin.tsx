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
  timeRanges: string[];
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
      setResponses(data);
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
                      Available Times
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
                        {response.gameName}
                      </TableCell>
                      <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        {response.timeZone}
                      </TableCell>
                      <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        {response.timeRanges.join(", ")}
                      </TableCell>
                      <TableCell sx={{ color: "rgba(255, 255, 255, 0.9)" }}>
                        {new Date(response.createdAt).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
