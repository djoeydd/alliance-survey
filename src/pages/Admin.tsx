import { useState, useEffect } from "react";
import { getAdminData } from "../api";

interface SurveyResponse {
  id: number;
  gameName: string;
  timeZone: string;
  timeRanges: string[];
  createdAt: string;
}

export default function Admin() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAdminData();
        setResponses(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load survey responses");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Survey Responses</h1>
      <div className="grid gap-4">
        {responses.map((response) => (
          <div
            key={response.id}
            className="border p-4 rounded-lg shadow-sm bg-white"
          >
            <h2 className="font-semibold">{response.gameName}</h2>
            <p>Time Zone: {response.timeZone}</p>
            <p>Available Times: {response.timeRanges.join(", ")}</p>
            <p className="text-sm text-gray-500">
              Submitted: {new Date(response.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
