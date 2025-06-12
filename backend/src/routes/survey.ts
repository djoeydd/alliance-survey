import express from "express";
import DatabaseService from "../services/database";

const router = express.Router();
const db = DatabaseService.getInstance();

// Submit survey response
router.post("/", async (req, res) => {
  try {
    const { inGameName, timeZone, timeRanges } = req.body;

    if (
      !inGameName ||
      !timeZone ||
      !Array.isArray(timeRanges) ||
      timeRanges.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const response = {
      inGameName,
      timeZone,
      timeRanges,
      createdAt: new Date(),
    };

    await db.saveSurveyResponse(response);
    res.status(201).json({ message: "Survey response saved successfully" });
  } catch (error) {
    console.error("Error saving survey response:", error);
    res.status(500).json({ error: "Failed to save survey response" });
  }
});

export default router;
