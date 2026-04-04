
import { GoogleGenAI, Type } from "@google/genai";
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

// Cache to prevent redundant calls and handle rate limits
const cache = {
  briefing: { data: "", timestamp: 0, key: "" },
  updates: { data: [] as MissionUpdate[], timestamp: 0 }
};

// Global lock to prevent concurrent Gemini calls which trigger rate limits faster
let isRequestInProgress = false;
const requestQueue: (() => void)[] = [];

async function acquireLock() {
  if (isRequestInProgress) {
    await new Promise<void>(resolve => requestQueue.push(resolve));
  }
  isRequestInProgress = true;
}

function releaseLock() {
  isRequestInProgress = false;
  const next = requestQueue.shift();
  if (next) next();
}

const CACHE_TTL = 300000; // 5 minutes cache for briefings
const UPDATES_CACHE_TTL = 900000; // 15 minutes for news updates

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

/**
 * Helper to execute Gemini calls with exponential backoff and concurrency control
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> {
  await acquireLock();
  try {
    let lastError: any;
    for (let i = 0; i <= retries; i++) {
      try {
        const ai = getAI();
        if (!ai) throw new Error("AI instance not available");
        return await fn();
      } catch (error: any) {
        lastError = error;
        const isRateLimit = error?.message?.includes("429") || 
                           error?.status === "RESOURCE_EXHAUSTED" ||
                           JSON.stringify(error).includes("429");
        
        if (isRateLimit && i < retries) {
          const waitTime = delay * Math.pow(2, i);
          console.warn(`Artemis II: Gemini Rate Limit hit. Retrying in ${waitTime}ms... (${retries - i} retries left)`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw error;
      }
    }
    throw lastError;
  } finally {
    // Add a small mandatory cooldown between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
    releaseLock();
  }
}

export async function getMissionBriefing(phase: MissionPhase, telemetry: TelemetryData): Promise<string> {
  // Round telemetry to reduce cache fragmentation
  const altKey = Math.floor(telemetry.altitude / 100);
  const velKey = Math.floor(telemetry.velocity / 100);
  const cacheKey = `${phase}-${altKey}-${velKey}`;
  const now = Date.now();

  if (cache.briefing.key === cacheKey && (now - cache.briefing.timestamp) < CACHE_TTL) {
    return cache.briefing.data;
  }

  try {
    const ai = getAI();
    if (!ai) return "AI features currently offline.";
    
    const briefing = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a NASA flight assistant. Analyze the current mission phase (${phase}) and telemetry (alt: ${telemetry.altitude.toFixed(2)}km, vel: ${telemetry.velocity.toFixed(2)}km/h, fuel: ${telemetry.fuel.toFixed(1)}%). Provide a concise, professional 2-sentence briefing for the crew.`,
      });
      return response.text || "Unable to generate briefing.";
    });

    cache.briefing = { data: briefing, timestamp: now, key: cacheKey };
    return briefing;
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (cache.briefing.data) return cache.briefing.data; // Return stale cache on error
    return "Telemetry uplink unstable. Please stand by.";
  }
}

export async function fetchMissionUpdates(): Promise<MissionUpdate[]> {
  const now = Date.now();
  if (cache.updates.data.length > 0 && (now - cache.updates.timestamp) < UPDATES_CACHE_TTL) {
    return cache.updates.data;
  }

  try {
    const ai = getAI();
    if (!ai) return [];

    console.log("Artemis II: Initiating news fetch from NASA...");
    
    const updates = await withRetry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Current Date: ${new Date().toISOString()}. Extract the latest 5 news updates from https://www.nasa.gov/artemis-ii-news-and-updates/. For each update, provide a title, a brief summary, a timestamp (ISO 8601), and the direct URL to the full article. Categorize them as 'critical' (for major mission milestones or changes), 'advisory' (for training or status reports), or 'update' (for general news). Return the data as a JSON array where each object has fields: title, summary, timestamp, type, and url. Ensure you provide exactly 5 entries if available.`,
        config: {
          tools: [{ urlContext: {} }, { googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                summary: { type: Type.STRING },
                timestamp: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["critical", "advisory", "update"] },
                url: { type: Type.STRING }
              },
              required: ["title", "summary", "timestamp", "type", "url"]
            }
          }
        },
      });

      let text = response.text;
      if (!text) return [];
      
      text = text.replace(/```json\n?|```/g, "").trim();
      const lastBracket = text.lastIndexOf(']');
      if (lastBracket !== -1 && lastBracket < text.length - 1) {
        text = text.substring(0, lastBracket + 1);
      }
      
      const parsed = JSON.parse(text);
      return parsed.map((u: any, index: number) => ({
        id: `update-${index}-${Date.now()}`,
        title: u.title || "Mission Update",
        summary: u.summary || "No summary available.",
        timestamp: u.timestamp || new Date().toISOString(),
        type: (u.type === 'critical' || u.type === 'advisory' || u.type === 'update') ? u.type : 'update',
        url: u.url || "https://www.nasa.gov/artemis-ii-news-and-updates/",
      }));
    });

    cache.updates = { data: updates, timestamp: now };
    return updates;
  } catch (error: any) {
    console.error("Artemis II: Error fetching mission updates:", error?.message || error);
    return cache.updates.data; // Return stale cache on error
  }
}
