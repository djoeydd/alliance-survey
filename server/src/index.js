require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// Middleware
app.use(
  cors({
    origin: ["https://alliance-survey.vercel.app", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  })
);
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Initialize database
const initDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id SERIAL PRIMARY KEY,
        in_game_name VARCHAR(255) NOT NULL,
        time_zone VARCHAR(255) NOT NULL,
        time_ranges TEXT[] NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

// API Routes
app.post("/api/survey", async (req, res) => {
  try {
    console.log("Received survey submission request");
    const { gameName, timeZone, timeRanges } = req.body;
    console.log("Creating new survey response:", {
      gameName,
      timeZone,
      timeRanges,
    });

    await pool.query(
      "INSERT INTO survey_responses (in_game_name, time_zone, time_ranges) VALUES ($1, $2, $3)",
      [gameName, timeZone, timeRanges]
    );

    console.log("Survey response saved successfully");
    res.status(201).json({ message: "Survey response saved successfully" });
  } catch (error) {
    console.error("Error saving survey response:", error);
    res
      .status(500)
      .json({ error: "Failed to save survey response: " + error.message });
  }
});

app.get("/api/survey", async (req, res) => {
  try {
    console.log("Fetching survey responses");
    const result = await pool.query(
      "SELECT * FROM survey_responses ORDER BY created_at DESC"
    );

    const responses = result.rows.map((row) => ({
      id: row.id,
      gameName: row.in_game_name,
      timeZone: row.time_zone,
      timeRanges: row.time_ranges,
      createdAt: row.created_at,
    }));

    console.log(`Found ${responses.length} survey responses`);
    res.json(responses);
  } catch (error) {
    console.error("Error fetching survey responses:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch survey responses: " + error.message });
  }
});

// Admin endpoint
app.get("/api/admin", async (req, res) => {
  try {
    console.log("Fetching admin data");
    const result = await pool.query(
      "SELECT * FROM survey_responses ORDER BY created_at DESC"
    );

    const responses = result.rows.map((row) => ({
      id: row.id,
      gameName: row.in_game_name,
      timeZone: row.time_zone,
      timeRanges: row.time_ranges,
      createdAt: row.created_at,
    }));

    console.log(`Found ${responses.length} responses for admin view`);
    res.json(responses);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch admin data: " + error.message });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    console.log("Health check requested");
    await pool.query("SELECT 1");
    res.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({
      status: "error",
      error: error.message,
      database: "disconnected",
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack);
  res.status(500).json({ error: "Something broke! " + err.message });
});

// Initialize database before starting
initDatabase();

// Export the Express API
module.exports = app;
