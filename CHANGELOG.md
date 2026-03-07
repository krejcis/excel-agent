# Changelog

All notable changes to LogiCore AI are documented in this file.

## [0.2.0-beta] – 2026-03-05

### Security

- **API Proxy**: Created `/api/analyze.ts` Vercel serverless function. All Gemini API calls are now routed through the server-side proxy — the API key is never exposed in the browser or DevTools.
- **Access Code**: Replaced hardcoded access code with `import.meta.env.VITE_ACCESS_CODE`. If the env var is undefined at runtime, a visible warning banner is shown instead of silently failing.
- **Rate Limiting**: Added client-side rate limiting on the login form — 5 failed attempts triggers a 5-minute lockout with a live countdown timer.
- **Badge Cleanup**: Removed all unverified compliance claims ("GDPR Compliant", "ISO 27001 Ready", "Secure Mode: Local Processing Only"). Replaced with verified badges: "v0.2.0-beta" and "HTTPS Encrypted".

### Changed

- `geminiService.ts` – Removed `@google/genai` SDK import and direct API key usage. Now calls `/api/analyze` proxy endpoint.
- `App.tsx` – Access code sourced from environment variable. Added rate limiting state and lockout countdown.
- `PrivacyShield.tsx` – Replaced false "Secure Mode" badge with version and HTTPS indicators.
- `Dashboard.tsx` – Removed the fake "Trust Bar" (GDPR, ISO 27001, Client-Side Processing). Updated footer version.
- `README.md` – Complete rewrite. Corrected from Next.js boilerplate to Vite SPA documentation with security notes.
- `.gitignore` – Added `dist/`, `dist-ssr/`, `*.local`, `.env.*` patterns with `!.env.example` exception. Removed Next.js-specific entries.

### Added

- `api/analyze.ts` – Vercel serverless proxy with CORS, 1MB body size limit, input validation.
- `.env.example` – Template showing required environment variables.
- `CHANGELOG.md` – This file.

### Removed

- Direct Gemini API calls from frontend code.
- Hardcoded access code `LogiCore2026`.
- False compliance badges from UI.
- "Local Processing Mode Active" claim from login screen.
- "All data remains on your local machine" claim from dashboard.

## [0.1.0] – 2026-03-04

### Added

- Initial MVP: Invoice Auditor agent with Excel upload and AI-powered variance analysis.
- Zustand state management.
- Tailwind CSS v4 design system.
- Access gate (hardcoded — now replaced in 0.2.0).
