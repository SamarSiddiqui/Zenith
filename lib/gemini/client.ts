/**
 * Zenith Native Gemini REST Client
 * Direct HTTP calls to Google Gemini 2.5 Flash-Lite with structured JSON outputs.
 * Zero external npm dependencies.
 */

import type { DiagnosisRequest, DiagnosisResult } from '../../types/diagnosis';

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const PRIMARY_MODEL = 'gemini-3.5-flash-lite';
const FALLBACK_MODEL = 'gemini-3.8-flash';
const SECONDARY_FALLBACK = 'gemini-flash-lite-latest';

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  error?: {
    code?: number;
    message?: string;
    status?: string;
  };
}

export async function callGeminiStructured<T>(
  prompt: string,
  systemInstruction?: string,
  preferredModel: string = PRIMARY_MODEL
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the environment variables.');
  }

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
    systemInstruction: systemInstruction
      ? {
          parts: [{ text: systemInstruction }],
        }
      : undefined,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.25, // Lower temperature for analytical and structured consistency
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  };

  const executeRequest = async (modelName: string) => {
    const url = `${GEMINI_API_BASE}/${modelName}:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Gemini API error (${response.status} ${modelName}): ${errorBody}`);
    }

    return (await response.json()) as GeminiGenerateResponse;
  };

  const candidateModels = [preferredModel, FALLBACK_MODEL, SECONDARY_FALLBACK];
  let data: GeminiGenerateResponse | null = null;
  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      data = await executeRequest(model);
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Client] Model ${model} failed, attempting next candidate...`, err.message);
    }
  }

  if (!data) {
    throw lastError || new Error('All Gemini candidate models failed to generate content.');
  }

  const candidate = data.candidates?.[0];
  const responseText = candidate?.content?.parts?.[0]?.text;

  if (!responseText) {
    throw new Error('Gemini API returned an empty response or candidate was filtered.');
  }

  try {
    return JSON.parse(responseText) as T;
  } catch (parseErr) {
    console.error('[Gemini Client] Failed to parse JSON response:', responseText);
    throw new Error('Failed to parse structured JSON from Gemini response.');
  }
}
