# LogiCore AI v0.3.0 – Logistics Excel Processor

AI-powered dashboard for freight forwarding operations: invoice auditing, courier reward calculation, data preparation, and ad-hoc analytics.

## Tech Stack

- **Frontend:** Vite 5 + React 19 + TypeScript
- **AI:** Google Gemini API (via Vercel serverless proxy)
- **Deployment:** Vercel (static hosting + serverless functions)
- **File processing:** SheetJS (client-side Excel parsing)
- **State management:** Zustand
- **Styling:** Tailwind CSS v4

## Getting Started

```bash
# Install dependencies
npm install

# Create your local env file
cp .env.example .env.local
# Then fill in the values in .env.local

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

| Variable | Purpose | Required |
| --- | --- | --- |
| `VITE_ACCESS_CODE` | Access gate password (min 12 characters recommended) | Yes |
| `VITE_GEMINI_API_KEY` | Google AI API key (**server-side only** via `/api/analyze`) | Yes |

> **Note:** `VITE_GEMINI_API_KEY` is read by the Vercel serverless function at `/api/analyze`. It is **never** bundled into the frontend or exposed in the browser.

## Project Structure

```
├── api/
│   └── analyze.ts          # Vercel serverless function (Gemini proxy)
├── src/
│   ├── agents/
│   │   ├── invoice-auditor/    # Invoice Auditor agent (Quote vs Invoice variance)
│   │   └── reward-calculator/  # Reward Calculator agent (progressive tier rewards)
│   ├── components/             # Shared UI components
│   ├── config/                 # Agent registry
│   ├── context/                # LanguageContext (CS / EN / DE, localStorage)
│   ├── services/               # API client (calls /api/analyze)
│   ├── store/                  # Zustand state management
│   ├── types/                  # TypeScript type definitions
│   ├── utils/                  # Excel parser and utilities
│   ├── App.tsx                 # Root component with access gate
│   ├── main.tsx                # React entry point
│   └── index.css               # Design system tokens
├── public/
│   └── samples/                # Example Excel files for download in UI
│       ├── sample_reward_calculator.xlsx
│       ├── sample_invoice_auditor_quote.xlsx
│       └── sample_invoice_auditor_invoice.xlsx
├── index.html
├── vite.config.ts
└── package.json
```

## Sample Files

The `public/samples/` directory contains example Excel files that users can download directly from the UI:

| File | Agent | Description |
|---|---|---|
| `sample_reward_calculator.xlsx` | Reward Calculator | Two-sheet workbook: rate tiers + shipment data |
| `sample_invoice_auditor_quote.xlsx` | Invoice Auditor | Example Quote file |
| `sample_invoice_auditor_invoice.xlsx` | Invoice Auditor | Example Invoice file |

Download links are shown below each upload dropzone in the respective agent UI.

## Security Notes

- **Never** commit `.env` files — they are gitignored.
- **Never** commit the `dist/` folder — it is gitignored.
- The Gemini API key is handled **server-side only** via the `/api/analyze` proxy. It is invisible in browser DevTools.
- The access gate provides basic UX protection with rate limiting (5 attempts → 5-min lockout). Real security relies on the server-side API proxy.
- This tool is provided as-is. The user is responsible for data compliance in their jurisdiction.

## Deployment

This project is designed for [Vercel](https://vercel.com):

1. Push to your GitHub repository
2. Import the project in Vercel
3. Set environment variables (`VITE_ACCESS_CODE`, `VITE_GEMINI_API_KEY`) in Vercel → Settings → Environment Variables
4. Deploy — Vercel auto-detects Vite and the `/api` serverless functions

## License

Private — not for redistribution.
