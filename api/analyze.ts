/* ============================================
   LogiCore AI – Vercel Serverless API Proxy
   Keeps API key server-side only.
   ============================================ */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const MAX_BODY_SIZE = 1_048_576; // 1 MB

interface AnalyzeRequestBody {
    prompt: string;
    fileData: string;
}

function isValidBody(body: unknown): body is AnalyzeRequestBody {
    if (typeof body !== 'object' || body === null) return false;
    const obj = body as Record<string, unknown>;
    return typeof obj.prompt === 'string' && typeof obj.fileData === 'string';
}

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
): Promise<void> {
    // CORS – restrict to your Vercel deployment domain
    const allowedOrigin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : '*';
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed. Use POST.' });
        return;
    }

    // Validate API key exists server-side
    const apiKey = process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
        res.status(500).json({
            error: 'Server misconfiguration: VITE_GEMINI_API_KEY is not set.',
        });
        return;
    }

    // Validate body size
    const rawBody = JSON.stringify(req.body);
    if (rawBody.length > MAX_BODY_SIZE) {
        res.status(413).json({
            error: `Request body exceeds maximum size of ${MAX_BODY_SIZE} bytes.`,
        });
        return;
    }

    // Validate request body
    if (!isValidBody(req.body)) {
        res.status(400).json({
            error: 'Invalid request body. Expected { prompt: string, fileData: string }.',
        });
        return;
    }

    const { prompt, fileData } = req.body;

    if (prompt.trim().length === 0) {
        res.status(400).json({ error: 'Prompt must not be empty.' });
        return;
    }

    // Build the content to send to Gemini
    const contents = fileData.length > 0 ? `${prompt}\n\n${fileData}` : prompt;

    try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const geminiResponse = await fetch(geminiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: contents }] }],
            }),
        });

        if (!geminiResponse.ok) {
            const errorBody = await geminiResponse.text();
            res.status(geminiResponse.status).json({
                error: `Gemini API error: ${geminiResponse.statusText}`,
                details: errorBody,
            });
            return;
        }

        const data: unknown = await geminiResponse.json();

        // Extract text from Gemini REST response
        const geminiData = data as {
            candidates?: Array<{
                content?: { parts?: Array<{ text?: string }> };
            }>;
        };
        const text =
            geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        if (!text) {
            res.status(502).json({
                error: 'Empty response from Gemini API.',
            });
            return;
        }

        res.status(200).json({ text });
    } catch (error: unknown) {
        const message =
            error instanceof Error
                ? error.message
                : 'Unknown error communicating with Gemini API.';
        res.status(500).json({ error: message });
    }
}
