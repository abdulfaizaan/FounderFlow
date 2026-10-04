import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "./env";
import { z } from "zod";

// Configuration for AI resilience
const AI_CONFIG = {
  TIMEOUT_MS: 15000,
  MAX_RETRIES: 2,
  RETRY_DELAY_MS: 1000,
};

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export type AIError = {
  type: "TIMEOUT" | "RATE_LIMIT" | "PROVIDER_ERROR" | "VALIDATION_ERROR" | "UNKNOWN";
  message: string;
  status?: number;
};

/**
 * A resilient wrapper for Gemini AI calls.
 * Handles timeouts, retries, and basic error classification.
 */
export async function callAI<T>(
  prompt: string,
  schema?: z.ZodSchema<T>,
  options: {
    retryCount?: number;
    timeout?: number;
  } = {}
): Promise<T> {
  const maxRetries = options.retryCount ?? AI_CONFIG.MAX_RETRIES;
  const timeout = options.timeout ?? AI_CONFIG.TIMEOUT_MS;
  let attempts = 0;

  while (attempts <= maxRetries) {
    try {
      // Promise.race to implement timeout
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("AI_TIMEOUT")), timeout)
        ),
      ]);

      const text = result.response.text();

      if (!text) {
        throw new Error("EMPTY_RESPONSE");
      }

      // If a schema is provided, validate the output
      if (schema) {
        try {
          // Attempt to parse JSON if schema is provided
          // Gemini often wraps JSON in markdown blocks
          const jsonString = text.replace(/```json\n?|```/g, "").trim();
          const parsed = JSON.parse(jsonString);
          return schema.parse(parsed);
        } catch (e) {
          if (e instanceof z.ZodError) {
            throw new Error(`VALIDATION_ERROR: ${e.message}`);
          }
          throw new Error(`JSON_PARSE_ERROR: ${e instanceof Error ? e.message : "Unknown error"}`);
        }
      }

      return text as unknown as T;
    } catch (error: any) {
      attempts++;
      const errorMsg = error.message || "Unknown error";

      // Determine if we should retry
      const isRetryable =
        errorMsg.includes("AI_TIMEOUT") ||
        errorMsg.includes("500") ||
        errorMsg.includes("503") ||
        errorMsg.includes("429");

      if (!isRetryable || attempts > maxRetries) {
        // Classify error for the caller
        let type: AIError["type"] = "UNKNOWN";
        if (errorMsg.includes("AI_TIMEOUT")) type = "TIMEOUT";
        else if (errorMsg.includes("429")) type = "RATE_LIMIT";
        else if (errorMsg.includes("VALIDATION_ERROR")) type = "VALIDATION_ERROR";
        else if (errorMsg.includes("500") || errorMsg.includes("503")) type = "PROVIDER_ERROR";

        throw {
          type,
          message: errorMsg,
          status: error.status,
        } as AIError;
      }

      // Exponential backoff
      await new Promise(res => setTimeout(res, AI_CONFIG.RETRY_DELAY_MS * attempts));
    }
  }

  throw new Error("AI_RETRY_EXHAUSTED");
}
