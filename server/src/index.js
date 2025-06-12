require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

// MongoDB Connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/alliance-survey";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

// Survey Response Schema
const surveyResponseSchema = new mongoose.Schema({
  gameName: String,
  timeZone: String,
  timeRanges: [String],
  createdAt: { type: Date, default: Date.now },
});

const SurveyResponse = mongoose.model("SurveyResponse", surveyResponseSchema);

// API Routes
app.post("/api/survey", async (req, res) => {
  try {
    const { gameName, timeZone, timeRanges } = req.body;
    const response = new SurveyResponse({
      gameName,
      timeZone,
      timeRanges,
    });
    await response.save();
    res.status(201).json(response);
  } catch (error) {
    console.error("Error saving survey response:", error);
    res.status(500).json({ error: "Failed to save survey response" });
  }
});

app.get("/api/survey", async (req, res) => {
  try {
    const responses = await SurveyResponse.find().sort({ createdAt: -1 });
    res.json(responses);
  } catch (error) {
    console.error("Error fetching survey responses:", error);
    res.status(500).json({ error: "Failed to fetch survey responses" });
  }
});

// Admin endpoint
app.get("/api/admin", async (req, res) => {
  try {
    const responses = await SurveyResponse.find().sort({ createdAt: -1 });
    res.json(responses);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    res.status(500).json({ error: "Failed to fetch admin data" });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Connect to MongoDB before starting the server
connectDB();

// Export the Express API
module.exports = app;
