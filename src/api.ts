interface SurveyData {
  gameName: string;
  timeZone: string;
  timeRanges: string[];
}

// Always use relative path for API calls since we're deploying to Vercel
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
    console.log("Making admin data request...");
    const response = await fetch(`${API_URL}/admin`);
    console.log("Admin API response status:", response.status);
    const data = await handleResponse(response);
    console.log("Admin API response data:", JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error("Error fetching admin data:", error);
    throw error;
  }
};

export const deleteResponse = async (id: number) => {
  const response = await fetch(`${API_URL}/admin/responses/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete response");
  }

  return response.json();
};

export const clearAllResponses = async () => {
  const response = await fetch(`${API_URL}/admin/responses`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to clear responses");
  }

  return response.json();
};
