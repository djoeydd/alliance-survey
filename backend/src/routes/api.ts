import express from "express";
import DatabaseService from "../services/database";

const router = express.Router();
const db = DatabaseService.getInstance();

// Submit survey response
router.post("/survey", async (req, res) => {
  try {
    const { inGameName, timeZone, timeRanges } = req.body;

    // Validate input
    if (!inGameName || !timeZone || !timeRanges || !Array.isArray(timeRanges)) {
      return res.status(400).json({ error: "Invalid input data" });
    }

    await db.saveSurveyResponse({
      inGameName,
      timeZone,
      timeRanges,
    });

    res.status(201).json({ message: "Survey response saved successfully" });
  } catch (error) {
    console.error("Error saving survey response:", error);
    res.status(500).json({ error: "Failed to save survey response" });
  }
});

// Get all survey responses
router.get("/survey", async (req, res) => {
  try {
    const responses = await db.getSurveyResponses();
    res.json(responses);
  } catch (error) {
    console.error("Error getting survey responses:", error);
    res.status(500).json({ error: "Failed to get survey responses" });
  }
});

// Get time zone statistics
router.get("/survey/stats/timezones", async (req, res) => {
  try {
    const stats = await db.getTimeZoneStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching time zone stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get time range statistics
router.get("/survey/stats/timeranges", async (req, res) => {
  try {
    const stats = await db.getTimeRangeStats();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching time range stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
