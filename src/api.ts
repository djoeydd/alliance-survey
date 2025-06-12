interface SurveyData {
  gameName: string;
  timeZone: string;
  timeRanges: string[];
}

const API_URL = "/api";

export const submitSurvey = async (data: SurveyData) => {
  const response = await fetch(`${API_URL}/survey`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getSurveyResponses = async () => {
  const response = await fetch(`${API_URL}/survey`);
  return response.json();
};

export const getAdminData = async () => {
  const response = await fetch(`${API_URL}/admin`);
  return response.json();
};
