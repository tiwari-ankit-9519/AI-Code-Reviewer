import Groq from "groq-sdk";
import { config } from "dotenv";

config();

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY environment variable is not set");
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const GROQ_MODELS = {
  LLAMA_70B: "llama-3.3-70b-versatile",
  LLAMA_8B: "llama-3.1-8b-instant",
  MIXTRAL_8X7B: "mixtral-8x7b-32768",
} as const;
