/* ============================================
   LogiCore AI – Agent Registry
   Central definition of all available agents.
   Reward Calculator is first (primary card).
   ============================================ */

import type { AgentDefinition } from '@/types';

export const AGENTS: AgentDefinition[] = [
    {
        id: 'reward-calculator',
        name: 'Reward Calculator',
        subtitle: 'Progressive courier reward calculation',
        description:
            'Upload a single Excel file with rate tiers and shipment data. The system automatically detects sheets, calculates progressive rewards and generates an output report.',
        icon: 'Calculator',
        status: 'available',
        color: 'from-emerald-600 to-emerald-800',
        accentColor: '#059669',
    },
    {
        id: 'invoice-auditor',
        name: 'Invoice Auditor',
        subtitle: 'Carrier Invoice vs. Quote Comparison',
        description:
            'Upload a carrier invoice and the original cost estimate. AI performs fuzzy entity matching to detect pricing variances, hidden surcharges, and line-item discrepancies automatically.',
        icon: 'FileSearch',
        status: 'available',
        color: 'from-blue-600 to-blue-800',
        accentColor: '#2563eb',
    },
    {
        id: 'macro-creator',
        name: 'Macro Creator',
        subtitle: 'VBA & Office Scripts generator',
        description:
            'Describe what you need and AI generates ready-to-use VBA macros or Office Scripts. Copy the code directly into Excel.',
        icon: 'Braces',
        status: 'available',
        color: 'from-violet-600 to-purple-800',
        accentColor: '#7c3aed',
    },
    {
        id: 'data-prepper',
        name: 'LBase Data Prepper',
        subtitle: 'TMS Integration Cleaner',
        description:
            'Standardize unstructured order data for LBase/Lobster import. Auto-corrects country codes, ZIP formats, and field mappings according to your TMS schema.',
        icon: 'Database',
        status: 'coming-soon',
        color: 'from-violet-600 to-violet-800',
        accentColor: '#7c3aed',
    },
    {
        id: 'rate-normalizer',
        name: 'Rate Sheet Normalizer',
        subtitle: 'Carrier Rate Unification',
        description:
            'Unify rate sheets from multiple carriers into a single standardized comparison format. Handles varying units, surcharge structures, and validity periods.',
        icon: 'Table',
        status: 'coming-soon',
        color: 'from-amber-600 to-amber-800',
        accentColor: '#d97706',
    },
    {
        id: 'ad-hoc-analyst',
        name: 'Ad-Hoc Analyst',
        subtitle: 'Natural Language Data Query',
        description:
            'Chat with your Excel data using natural language. Ask questions like "Which shipments exceeded 2000kg last month?" and get instant structured answers.',
        icon: 'MessageSquareText',
        status: 'coming-soon',
        color: 'from-rose-600 to-rose-800',
        accentColor: '#e11d48',
    },
];

export const getAgentById = (id: string): AgentDefinition | undefined =>
    AGENTS.find((a) => a.id === id);
