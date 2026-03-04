/* ============================================
   LogiCore AI – Gemini AI Service
   Privacy-first: only anonymized text chunks
   are sent to the API. No raw files transmitted.
   ============================================ */

import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string;

if (!API_KEY) {
    console.warn(
        '[LogiCore AI] VITE_GEMINI_API_KEY is not set. AI features will be unavailable.'
    );
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const MODEL = 'gemini-2.5-flash';

/**
 * Sends a structured prompt to Gemini and returns the text response.
 * Only processed, anonymized data chunks are transmitted — never raw files.
 */
export async function queryGemini(prompt: string): Promise<string> {
    if (!ai) {
        throw new Error(
            'Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.'
        );
    }

    try {
        const response = await ai.models.generateContent({
            model: MODEL,
            contents: prompt,
        });

        const text = response.text;
        if (!text) {
            throw new Error('Empty response from Gemini API.');
        }

        return text;
    } catch (error: unknown) {
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error('Unknown error communicating with Gemini API.');
    }
}

/**
 * Parses a JSON response from Gemini, stripping markdown code fences if present.
 */
export function parseGeminiJSON<T>(raw: string): T {
    // Strip markdown code fences
    let cleaned = raw.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
    }
    cleaned = cleaned.trim();

    return JSON.parse(cleaned) as T;
}
