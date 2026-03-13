/* ============================================
   LogiCore AI – Core Type Definitions
   ============================================ */

// ── Agent Registry ──────────────────────────

export type AgentId =
    | 'reward-calculator'
    | 'invoice-auditor'
    | 'data-prepper'
    | 'rate-normalizer'
    | 'ad-hoc-analyst';

export type AgentStatus = 'available' | 'coming-soon' | 'beta';

export interface AgentDefinition {
    id: AgentId;
    name: string;
    subtitle: string;
    description: string;
    icon: string;
    status: AgentStatus;
    color: string;
    accentColor: string;
}

// ── Reward Calculator Types ─────────────────

/** A single tier in the progressive rate table */
export interface RewardTier {
    from: number;
    to: number | null; // null = infinity (last tier)
    rate: number;
}

/** A driver's shipment data with calculated reward */
export interface DriverReward {
    name: string;
    shipments: number;
    reward: number;
}

/** Full result from the reward calculation engine */
export interface RewardResult {
    tiers: RewardTier[];
    drivers: DriverReward[];
    totalReward: number;
    tiersSheetName: string;
    dataSheetName: string;
}

/** Sheet detection result – which sheet is which */
export interface SheetDetection {
    tiersSheetIndex: number | null;
    dataSheetIndex: number | null;
    autoDetected: boolean;
}

/** Optional manual column override – bypasses fuzzy detection when provided */
export interface ColumnOverride {
    nameCol?: string;      // header name for driver name
    countCol?: string;     // header name for shipment count
    lowerBoundCol?: string; // header name for tier lower bound
    rateCol?: string;      // header name for tier rate
    upperBoundCol?: string; // header name for tier upper bound (optional)
}


// ── Invoice Auditor Types ───────────────────

export interface QuoteLineItem {
    position: number;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    currency: string;
    category?: string;
    reference?: string;
}

export interface InvoiceLineItem {
    position: number;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    currency: string;
    invoiceNumber?: string;
    reference?: string;
}

export interface VarianceItem {
    id: string;
    quoteDescription: string;
    invoiceDescription: string;
    quoteAmount: number;
    invoiceAmount: number;
    variance: number;
    variancePercent: number;
    matchConfidence: number;
    status: 'match' | 'overage' | 'underage' | 'unmatched-quote' | 'unmatched-invoice';
    category?: string;
    notes?: string;
}

export interface AuditReport {
    id: string;
    timestamp: string;
    quoteFileName: string;
    invoiceFileName: string;
    totalQuoteAmount: number;
    totalInvoiceAmount: number;
    totalVariance: number;
    lineItems: VarianceItem[];
    summary: AuditSummary;
}

export interface AuditSummary {
    totalItems: number;
    matchedItems: number;
    overageItems: number;
    underageItems: number;
    unmatchedQuoteItems: number;
    unmatchedInvoiceItems: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// ── Excel Parsing ───────────────────────────

export interface ParsedSheet {
    name: string;
    headers: string[];
    rows: Record<string, unknown>[];
    rawData: unknown[][];
}

export interface ParsedWorkbook {
    fileName: string;
    sheets: ParsedSheet[];
    totalRows: number;
}

// ── Application State ───────────────────────

export type AppView = 'dashboard' | AgentId;

export interface FileUploadState {
    file: File | null;
    parsed: ParsedWorkbook | null;
    status: 'idle' | 'uploading' | 'parsing' | 'ready' | 'error';
    error?: string;
}

export interface ProcessingState {
    status: 'idle' | 'processing' | 'complete' | 'error';
    progress: number;
    message?: string;
    error?: string;
}
