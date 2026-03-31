# Changelog

All notable changes to LogiCore AI are documented in this file.

## [0.4.0] – 2026-03-31

### Added

- **Macro Creator Agent**: New AI-powered tool for generating Excel macros from natural-language descriptions.
  - **Dual Script Support**: Generate VBA macros (`.xlsm` desktop) or Office Scripts (Excel Online / Microsoft 365).
  - **Script type dropdown**: Switch between VBA and Office Script with dedicated system prompts for each.
  - **Code output**: Monospace code block with dark background and horizontal scroll.
  - **Copy to clipboard**: One-click copy with 2-second confirmation toast.
  - **Regenerate**: Re-run generation while preserving the user's description.
  - **MacroInstructions component**: Always-visible, context-aware step-by-step guide:
    - VBA: Two tabs — "With Developer Tab" and "Without Developer Tab" (includes how to enable it).
    - Office Script: Step-by-step guide for Excel Online with OneDrive/SharePoint note.
    - Keyboard shortcuts (`Alt+F11`, `F5`) rendered as styled monospace badges.
  - Full translations for CS, EN, DE.
- **Dashboard**: Macro Creator added as the third available agent card (violet/purple gradient, Braces icon).

### Technical

- `types/index.ts` – Added `'macro-creator'` to `AgentId` union.
- `config/agents.ts` – Macro Creator agent definition (available, violet-purple gradient, Braces icon).
- `agents/macro-creator/MacroCreator.tsx` – Full UI component with textarea, dropdown, generate/copy/regenerate flow.
- `agents/macro-creator/MacroInstructions.tsx` – Tab-based instruction component with Kbd badge rendering.
- `App.tsx` – Added `macro-creator` route.
- `Dashboard.tsx` – Added `Braces` icon import and `macro-creator` translation key mapping.
- `translations.ts` – Complete `macroCreator` section for CS/EN/DE (agent card + all UI strings + instructions).
- TypeScript strict, no `any` types, all comments in English.

---

## [0.3.1] – 2026-03-10

### Added

- **Sample files**: Added `public/samples/` directory with three example Excel files for new users:
  - `sample_reward_calculator.xlsx` – example workbook for Reward Calculator (two sheets: rate tiers + shipment data).
  - `sample_invoice_auditor_quote.xlsx` – example Quote file for Invoice Auditor.
  - `sample_invoice_auditor_invoice.xlsx` – example Invoice file for Invoice Auditor.
- **Download links in UI**:
  - `RewardCalculator.tsx` – link *Stáhnout vzorový soubor* displayed below the upload dropzone sublabel.
  - `InvoiceAuditor.tsx` – separate download links below the Quote and Invoice dropzones respectively.
  - Links use the native `download` attribute and point to `/samples/*.xlsx`.

---

## [0.3.0] – 2026-03-10

### Added

- **Smart Reward Calculator**: New primary agent for calculating progressive courier rewards from a single Excel file.
  - Single-file drag & drop workflow (`.xlsx` with two sheets: rate tiers + shipment data).
  - **Smart Sheet Detection**: Automatically identifies which sheet is the tier table and which contains shipment data using fuzzy, case-insensitive, multi-language keyword matching.
  - **Fallback UI**: If auto-detection fails, users can manually select sheets via dropdown.
  - **Progressive Tier Calculation**: Iterates rate bands ascending, applies each tier's rate only to shipments within that interval. Empty/zero upper bound = infinity (last tier).
  - **Results Table**: Displays Name | Shipments | Reward per driver, plus a total row.
  - **XLSX Export**: Generates a new workbook with original shipment data + calculated reward column, and a copy of the original rate tiers sheet.
- **English (EN) language**: Full English translation set added alongside Czech and German.
- **Language Persistence**: Language selection is now saved to `localStorage` (`logicore_lang` key) and restored on reload.

### Changed

- **Default language**: Changed from German (`de`) to Czech (`cs`).
- **Language Switcher**: Now shows three options: CS | EN | DE (was CS | DE).
- **Agent Registry**: Reward Calculator is now the first (primary) card on the dashboard. Invoice Auditor moved to second position.
- **Dashboard footer**: Updated version references to v0.3.0.
- **PrivacyShield**: Version badge updated to v0.3.0.
- `package.json` version bumped to `0.3.0`.

### Technical

- `translations.ts` – Complete restructure: added `en` language, added all `rewardCalculator.*` keys for CS/EN/DE.
- `LanguageContext.tsx` – Default `cs`, localStorage read/write, accepts `'cs' | 'en' | 'de'`.
- `types/index.ts` – Added `RewardTier`, `DriverReward`, `RewardResult`, `SheetDetection` types, added `'reward-calculator'` to `AgentId` union.
- `config/agents.ts` – Reward Calculator agent definition (available, emerald color, Calculator icon).
- `agents/reward-calculator/rewardEngine.ts` – Smart detection algorithm, progressive calculation, localized error handling via translation keys.
- `agents/reward-calculator/RewardCalculator.tsx` – Full UI component with upload, detection, manual fallback, results, and export phases.
- TypeScript strict, no `any` types, all comments in English.

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
