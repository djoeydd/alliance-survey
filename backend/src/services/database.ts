import { sql } from "@vercel/postgres";

export interface SurveyResponse {
  id?: number;
  inGameName: string;
  timeZone: string;
  timeRanges: string[];
  createdAt: Date;
}

class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {
    this.initDatabase();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private async initDatabase() {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS survey_responses (
          id SERIAL PRIMARY KEY,
          in_game_name VARCHAR(255) NOT NULL,
          time_zone VARCHAR(255) NOT NULL,
          time_ranges TEXT[] NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
      console.log("Database initialized successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  async saveSurveyResponse(data: SurveyResponse): Promise<void> {
    try {
      await sql`
        INSERT INTO survey_responses (in_game_name, time_zone, time_ranges)
        VALUES (${data.inGameName}, ${data.timeZone}, ${JSON.stringify(
        data.timeRanges
      )})
      `;
    } catch (error) {
      console.error("Error saving survey response:", error);
      throw error;
    }
  }

  async getSurveyResponses(): Promise<SurveyResponse[]> {
    try {
      const result = await sql`
        SELECT * FROM survey_responses
        ORDER BY created_at DESC
      `;

      return result.rows.map((row) => ({
        id: row.id,
        inGameName: row.in_game_name,
        timeZone: row.time_zone,
        timeRanges: row.time_ranges,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error("Error getting survey responses:", error);
      throw error;
    }
  }

  async getTimeZoneStats(): Promise<{ timeZone: string; count: number }[]> {
    try {
      const result = await sql`
        SELECT time_zone, COUNT(*) as count
        FROM survey_responses
        GROUP BY time_zone
        ORDER BY count DESC
      `;

      return result.rows.map((row) => ({
        timeZone: row.time_zone,
        count: parseInt(row.count),
      }));
    } catch (error) {
      console.error("Error getting time zone stats:", error);
      throw error;
    }
  }

  async getTimeRangeStats(): Promise<{ timeRange: string; count: number }[]> {
    try {
      const result = await sql`
        SELECT unnest(time_ranges) as time_range, COUNT(*) as count
        FROM survey_responses
        GROUP BY time_range
        ORDER BY count DESC
      `;

      return result.rows.map((row) => ({
        timeRange: row.time_range,
        count: parseInt(row.count),
      }));
    } catch (error) {
      console.error("Error getting time range stats:", error);
      throw error;
    }
  }
}

export default DatabaseService;
