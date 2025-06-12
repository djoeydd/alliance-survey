import { MongoClient, Collection } from "mongodb";
import { SurveyResponse } from "../types";

class DatabaseService {
  private static instance: DatabaseService;
  private client: MongoClient;
  private collection: Collection<SurveyResponse>;

  private constructor() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
    this.client = new MongoClient(uri);
    this.collection = this.client
      .db("alliance-survey")
      .collection<SurveyResponse>("responses");
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Failed to connect to MongoDB:", error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.close();
      console.log("Disconnected from MongoDB");
    } catch (error) {
      console.error("Failed to disconnect from MongoDB:", error);
      throw error;
    }
  }

  public async saveSurveyResponse(response: SurveyResponse): Promise<void> {
    try {
      await this.collection.insertOne(response);
    } catch (error) {
      console.error("Failed to save survey response:", error);
      throw error;
    }
  }

  public async getSurveyResponses(): Promise<SurveyResponse[]> {
    try {
      return await this.collection.find().toArray();
    } catch (error) {
      console.error("Failed to get survey responses:", error);
      throw error;
    }
  }

  public async getTimeZoneStats(): Promise<
    { timeZone: string; count: number }[]
  > {
    try {
      const stats = await this.collection
        .aggregate([
          { $group: { _id: "$timeZone", count: { $sum: 1 } } },
          { $project: { timeZone: "$_id", count: 1, _id: 0 } },
          { $sort: { count: -1 } },
        ])
        .toArray();
      return stats as { timeZone: string; count: number }[];
    } catch (error) {
      console.error("Failed to get time zone stats:", error);
      throw error;
    }
  }

  public async getTimeRangeStats(): Promise<
    { timeRange: string; count: number }[]
  > {
    try {
      // Unwind the timeRanges array to tally each time slot separately
      const stats = await this.collection
        .aggregate([
          { $unwind: "$timeRanges" },
          { $group: { _id: "$timeRanges", count: { $sum: 1 } } },
          { $project: { timeRange: "$_id", count: 1, _id: 0 } },
          { $sort: { count: -1 } },
        ])
        .toArray();
      return stats as { timeRange: string; count: number }[];
    } catch (error) {
      console.error("Failed to get time range stats:", error);
      throw error;
    }
  }
}

export default DatabaseService;
