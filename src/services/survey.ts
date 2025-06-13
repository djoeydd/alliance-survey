import { submitSurvey, getSurveyResponses } from "../api";

export const submitSurveyResponse = async (data: {
  gameName: string;
  timeZone: string;
  timeRanges: string[];
}) => {
  return submitSurvey(data);
};

export const fetchSurveyResponses = async () => {
  return getSurveyResponses();
};
