import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import DatabaseService from "./services/database";
import adminRoutes from "./routes/admin";
import surveyRoutes from "./routes/survey";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/survey", surveyRoutes);

// Initialize database connection
const db = DatabaseService.getInstance();

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
app.listen(port, async () => {
  try {
    await db.connect();
    console.log(`Server is running on port ${port}`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
});

// Handle graceful shutdown
process.on("SIGTERM", async () => {
  try {
    await db.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});
