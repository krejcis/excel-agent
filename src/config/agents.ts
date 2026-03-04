/* ============================================
   LogiCore AI – Agent Registry
   Central definition of all available agents
   ============================================ */

import type { AgentDefinition } from '@/types';

export const AGENTS: AgentDefinition[] = [
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
        id: 'data-prepper',
        name: 'LBase Data Prepper',
        subtitle: 'TMS Integration Cleaner',
        description:
            'Standardize unstructured order data for LBase/Lobster import. Auto-corrects country codes, ZIP formats, and field mappings according to your TMS schema.',
        icon: 'Database',
        status: 'coming-soon',
        color: 'from-emerald-600 to-emerald-800',
        accentColor: '#059669',
    },
    {
        id: 'rate-normalizer',
        name: 'Rate Sheet Normalizer',
        subtitle: 'Carrier Rate Unification',
        description:
            'Unify rate sheets from multiple carriers into a single standardized comparison format. Handles varying units, surcharge structures, and validity periods.',
        icon: 'Table',
        status: 'coming-soon',
        color: 'from-violet-600 to-violet-800',
        accentColor: '#7c3aed',
    },
    {
        id: 'ad-hoc-analyst',
        name: 'Ad-Hoc Analyst',
        subtitle: 'Natural Language Data Query',
        description:
            'Chat with your Excel data using natural language. Ask questions like "Which shipments exceeded 2000kg last month?" and get instant structured answers.',
        icon: 'MessageSquareText',
        status: 'coming-soon',
        color: 'from-amber-600 to-amber-800',
        accentColor: '#d97706',
    },
];

export const getAgentById = (id: string): AgentDefinition | undefined =>
    AGENTS.find((a) => a.id === id);
