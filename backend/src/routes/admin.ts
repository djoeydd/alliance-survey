import express from "express";
import DatabaseService from "../services/database";

const router = express.Router();
const db = DatabaseService.getInstance();

// Get admin dashboard data
router.get("/", async (req, res) => {
  try {
    const [responses, timeZoneStats, timeRangeStats] = await Promise.all([
      db.getSurveyResponses(),
      db.getTimeZoneStats(),
      db.getTimeRangeStats(),
    ]);

    res.json({
      responses,
      timeZoneStats,
      timeRangeStats,
    });
  } catch (error) {
    console.error("Error getting admin data:", error);
    res.status(500).json({ error: "Failed to get admin data" });
  }
});

export default router;
