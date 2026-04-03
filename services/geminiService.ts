
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

let aiInstance: GoogleGenAI | null = null;

function getAI() {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
      return null;
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function getMissionBriefing(phase: MissionPhase, telemetry: TelemetryData): Promise<string> {
  try {
    const ai = getAI();
    if (!ai) return "AI features currently offline.";
    
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
    const ai = getAI();
    if (!ai) return [];

    console.log("Artemis II: Initiating news fetch from NASA...");
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Current Date: ${new Date().toISOString()}. Extract the latest 5 news updates from https://www.nasa.gov/artemis-ii-news-and-updates/. For each update, provide a title, a brief summary, a timestamp (ISO 8601), and the direct URL to the full article. Categorize them as 'critical' (for major mission milestones or changes), 'advisory' (for training or status reports), or 'update' (for general news). Return the data as a JSON array where each object has fields: title, summary, timestamp, type, and url. Ensure you provide exactly 5 entries if available.`,
      config: {
        tools: [{ urlContext: {} }, { googleSearch: {} }],
        responseMimeType: "application/json",
      },
    });

    let text = response.text;
    if (!text) {
      console.warn("Artemis II: Gemini returned empty response for news.");
      return [];
    }
    
    // Clean JSON response in case of markdown blocks
    text = text.replace(/```json\n?|```/g, "").trim();
    
    try {
      const updates = JSON.parse(text);
      if (!Array.isArray(updates)) {
        console.error("Artemis II: Gemini returned non-array JSON for news:", updates);
        return [];
      }

      console.log(`Artemis II: Successfully fetched ${updates.length} updates.`);
      
      return updates.map((u: any, index: number) => ({
        id: `update-${index}-${Date.now()}`,
        title: u.title || "Mission Update",
        summary: u.summary || "No summary available.",
        timestamp: u.timestamp || new Date().toISOString(),
        type: (u.type === 'critical' || u.type === 'advisory' || u.type === 'update') ? u.type : 'update',
        url: u.url || "https://www.nasa.gov/artemis-ii-news-and-updates/",
      }));
    } catch (parseError) {
      console.error("Artemis II: Failed to parse news JSON:", text, parseError);
      return [];
    }
  } catch (error) {
    console.error("Artemis II: Critical failure fetching mission updates:", error);
    return [];
  }
}
