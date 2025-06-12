interface SurveyResponse {
  inGameName: string;
  timeZone: string;
  timeRanges: string[];
}

export const submitSurvey = async (data: SurveyResponse): Promise<void> => {
  try {
    const response = await fetch("http://localhost:3001/api/survey", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Failed to submit survey");
    }
  } catch (error) {
    console.error("Error submitting survey:", error);
    throw error;
  }
};
