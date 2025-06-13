const express = require("express");
const cors = require("cors");
const { sql } = require("@vercel/postgres");
require("dotenv").config();

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parse JSON bodies
app.use(express.json());

// Initialize database
async function initDatabase() {
  try {
    console.log("Initializing database...");
    await sql`
      CREATE TABLE IF NOT EXISTS survey_responses (
        id SERIAL PRIMARY KEY,
        gameName VARCHAR(255) NOT NULL,
        timeZone VARCHAR(255) NOT NULL,
        timeRanges JSONB NOT NULL,
        createdAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
    throw error;
  }
}

// Initialize database before setting up routes
let dbInitialized = false;
app.use(async (req, res, next) => {
  if (!dbInitialized) {
    try {
      await initDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      return res.status(500).json({ error: "Database initialization failed" });
    }
  }
  next();
});

// API Routes
app.post("/api/survey", async (req, res) => {
  try {
    const { gameName, timeZone, timeRanges } = req.body;

    if (!gameName || !timeZone || !timeRanges) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await sql`
      INSERT INTO survey_responses (gameName, timeZone, timeRanges)
      VALUES (${gameName}, ${timeZone}, ${JSON.stringify(timeRanges)})
      RETURNING *
    `;

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error saving survey response:", error);
    res.status(500).json({ error: "Failed to save survey response" });
  }
});

app.get("/api/survey", async (req, res) => {
  try {
    const result =
      await sql`SELECT * FROM survey_responses ORDER BY createdAt DESC`;
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching survey responses:", error);
    res.status(500).json({ error: "Failed to fetch survey responses" });
  }
});

app.get("/api/admin", async (req, res) => {
  try {
    const result =
      await sql`SELECT * FROM survey_responses ORDER BY createdAt DESC`;
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ error: "Failed to fetch admin data" });
  }
});

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    await sql`SELECT 1`;
    res.json({ status: "ok", message: "Database connection is working" });
  } catch (error) {
    console.error("Health check failed:", error);
    res
      .status(500)
      .json({ status: "error", message: "Database connection failed" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// For Vercel serverless functions
module.exports = app;
