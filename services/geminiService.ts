
import { GoogleGenAI } from "@google/genai";
import { MissionPhase, TelemetryData } from "../types";

export interface MissionUpdate {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  type: 'critical' | 'advisory' | 'update';
  url: string;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getMissionBriefing(phase: MissionPhase, telemetry: TelemetryData): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a NASA flight assistant. Analyze the current mission phase (${phase}) and telemetry (alt: ${telemetry.altitude.toFixed(2)}km, vel: ${telemetry.velocity.toFixed(2)}km/h, fuel: ${telemetry.fuel.toFixed(1)}%). Provide a concise, professional 2-sentence briefing for the crew.`,
    });
    return response.text || "Unable to generate briefing.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Telemetry uplink unstable. Please stand by.";
  }
}

export async function fetchMissionUpdates(): Promise<MissionUpdate[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Extract the latest 5 news updates from https://www.nasa.gov/artemis-ii-news-and-updates/. For each update, provide a title, a brief summary, and a timestamp. Categorize them as 'critical' (for major mission milestones or changes), 'advisory' (for training or status reports), or 'update' (for general news). Return the data as a JSON array.",
      config: {
        tools: [{ urlContext: {} }],
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) return [];
    
    const updates = JSON.parse(text);
    return updates.map((u: any, index: number) => ({
      ...u,
      id: `update-${index}-${Date.now()}`,
    }));
  } catch (error) {
    console.error("Failed to fetch mission updates:", error);
    return [];
  }
}
