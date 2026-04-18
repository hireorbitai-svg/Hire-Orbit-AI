import "dotenv/config";
import OpenAI from "openai";

// Use a placeholder so the server doesn't crash on startup if key is missing.
// Actual API calls will fail gracefully if the key is invalid.
export const ai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || "placeholder-set-DEEPSEEK_API_KEY-in-env",
  baseURL: "https://api.deepseek.com",
});
