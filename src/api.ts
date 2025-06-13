interface SurveyData {
  gameName: string;
  timeZone: string;
  timeRanges: string[];
}

// Use relative path for API calls
const API_URL = "/api";

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Network response was not ok" }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

export const submitSurvey = async (data: SurveyData) => {
  try {
    const response = await fetch(`${API_URL}/survey`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Error submitting survey:", error);
    throw error;
  }
};

export const getSurveyResponses = async () => {
  try {
    const response = await fetch(`${API_URL}/survey`);
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching survey responses:", error);
    throw error;
  }
};

export const getAdminData = async () => {
  try {
    const response = await fetch(`${API_URL}/admin`);
    return handleResponse(response);
  } catch (error) {
    console.error("Error fetching admin data:", error);
    throw error;
  }
};
