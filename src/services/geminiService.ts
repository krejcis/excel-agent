/* ============================================
   LogiCore AI – Gemini AI Service
   All requests proxied via /api/analyze.
   API key never leaves the server.
   ============================================ */

interface AnalyzeResponse {
    text: string;
    error?: string;
    details?: string;
}

/**
 * Sends a structured prompt to the Gemini API via the Vercel serverless proxy.
 * No API key is ever referenced or transmitted from the client.
 */
export async function queryGemini(prompt: string, fileData: string = ''): Promise<string> {
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, fileData }),
    });

    if (!response.ok) {
        const errorBody = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(
            errorBody.error ?? `API proxy error: ${response.status} ${response.statusText}`
        );
    }

    const data = (await response.json()) as AnalyzeResponse;

    if (data.error) {
        throw new Error(`Gemini API Error: ${data.error}`);
    }

    if (!data.text) {
        throw new Error('Empty response from Gemini API.');
    }

    return data.text;
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
