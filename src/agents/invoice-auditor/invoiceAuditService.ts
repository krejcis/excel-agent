/* ============================================
   LogiCore AI – Invoice Auditor Service
   Core AI logic for comparing quotes vs invoices.
   ============================================ */

import { queryGemini, parseGeminiJSON } from '@/services/geminiService';
import { toAIPayload } from '@/utils/excelParser';
import type { VarianceItem, AuditReport, AuditSummary } from '@/types';

interface GeminiVarianceResult {
    line_items: Array<{
        quote_description: string;
        invoice_description: string;
        quote_amount: number;
        invoice_amount: number;
        match_confidence: number;
        category?: string;
        notes?: string;
    }>;
    unmatched_quote_items: Array<{
        description: string;
        amount: number;
        category?: string;
    }>;
    unmatched_invoice_items: Array<{
        description: string;
        amount: number;
        category?: string;
    }>;
}

/**
 * Builds the Gemini prompt for invoice vs. quote comparison.
 * Only anonymized, structured data is sent.
 */
function buildComparisonPrompt(
    quoteData: Record<string, unknown>[],
    invoiceData: Record<string, unknown>[]
): string {
    return `You are an expert logistics invoice auditor for a freight forwarding company in Austria.

TASK: Compare the following Cost Estimate (Quote) line items against Invoice line items.
Perform "Fuzzy Entity Matching" — line item descriptions may differ between documents
(e.g., "Demurrage Hamburg" on invoice may correspond to "Storage costs Port HH" on quote).

RULES:
1. Match line items by semantic meaning, not exact text match.
2. For each matched pair, calculate the variance (Invoice Amount - Quote Amount).
3. Report ALL items, including those with zero variance.
4. Identify any unmatched items from either document.
5. Match confidence should be 0-100 (100 = exact match, 0 = no match found).
6. Amounts should use EUR values. If units differ, normalize to total cost.

QUOTE DATA (Cost Estimate):
${JSON.stringify(quoteData, null, 2)}

INVOICE DATA (Carrier Invoice):
${JSON.stringify(invoiceData, null, 2)}

RESPOND ONLY WITH VALID JSON in this exact schema:
{
  "line_items": [
    {
      "quote_description": "description from quote",
      "invoice_description": "description from invoice",
      "quote_amount": 1000.00,
      "invoice_amount": 1050.00,
      "match_confidence": 85,
      "category": "Transport | Handling | Storage | Customs | Insurance | Other",
      "notes": "optional explanation of matching logic or variance reason"
    }
  ],
  "unmatched_quote_items": [
    {
      "description": "item only in quote",
      "amount": 500.00,
      "category": "category"
    }
  ],
  "unmatched_invoice_items": [
    {
      "description": "item only in invoice",
      "amount": 200.00,
      "category": "category"
    }
  ]
}`;
}

/**
 * Runs the full invoice audit comparison.
 */
export async function runInvoiceAudit(
    quoteRows: Record<string, unknown>[],
    invoiceRows: Record<string, unknown>[],
    quoteFileName: string,
    invoiceFileName: string,
    onProgress?: (progress: number, message: string) => void
): Promise<AuditReport> {
    // Step 1: Prepare data
    onProgress?.(10, 'Preparing data for analysis…');
    const quotePayload = toAIPayload(quoteRows, 100);
    const invoicePayload = toAIPayload(invoiceRows, 100);

    // Step 2: Build prompt
    onProgress?.(20, 'Building comparison prompt…');
    const prompt = buildComparisonPrompt(quotePayload, invoicePayload);

    // Step 3: Send to Gemini
    onProgress?.(40, 'AI is analyzing line items (fuzzy matching)…');
    const rawResponse = await queryGemini(prompt);

    // Step 4: Parse response
    onProgress?.(80, 'Processing variance report…');
    const result = parseGeminiJSON<GeminiVarianceResult>(rawResponse);

    // Step 5: Build structured report
    onProgress?.(90, 'Generating final report…');

    let idCounter = 0;
    const lineItems: VarianceItem[] = [];

    // Matched items
    for (const item of result.line_items) {
        const variance = item.invoice_amount - item.quote_amount;
        const variancePercent =
            item.quote_amount !== 0
                ? (variance / item.quote_amount) * 100
                : item.invoice_amount !== 0
                    ? 100
                    : 0;

        let status: VarianceItem['status'] = 'match';
        if (Math.abs(variance) >= 0.01) {
            status = variance > 0 ? 'overage' : 'underage';
        }

        lineItems.push({
            id: `vi-${++idCounter}`,
            quoteDescription: item.quote_description,
            invoiceDescription: item.invoice_description,
            quoteAmount: item.quote_amount,
            invoiceAmount: item.invoice_amount,
            variance,
            variancePercent,
            matchConfidence: item.match_confidence,
            status,
            category: item.category,
            notes: item.notes,
        });
    }

    // Unmatched quote items
    for (const item of result.unmatched_quote_items) {
        lineItems.push({
            id: `vi-${++idCounter}`,
            quoteDescription: item.description,
            invoiceDescription: '—',
            quoteAmount: item.amount,
            invoiceAmount: 0,
            variance: -item.amount,
            variancePercent: -100,
            matchConfidence: 0,
            status: 'unmatched-quote',
            category: item.category,
            notes: 'Item exists in quote but not found on invoice',
        });
    }

    // Unmatched invoice items
    for (const item of result.unmatched_invoice_items) {
        lineItems.push({
            id: `vi-${++idCounter}`,
            quoteDescription: '—',
            invoiceDescription: item.description,
            quoteAmount: 0,
            invoiceAmount: item.amount,
            variance: item.amount,
            variancePercent: 100,
            matchConfidence: 0,
            status: 'unmatched-invoice',
            category: item.category,
            notes: 'Item exists on invoice but not in original quote — potential hidden surcharge',
        });
    }

    // Calculate summary
    const summary: AuditSummary = {
        totalItems: lineItems.length,
        matchedItems: lineItems.filter(
            (i) => i.status === 'match' || i.status === 'overage' || i.status === 'underage'
        ).length,
        overageItems: lineItems.filter((i) => i.status === 'overage').length,
        underageItems: lineItems.filter((i) => i.status === 'underage').length,
        unmatchedQuoteItems: lineItems.filter((i) => i.status === 'unmatched-quote').length,
        unmatchedInvoiceItems: lineItems.filter((i) => i.status === 'unmatched-invoice')
            .length,
        riskLevel: 'low',
    };

    // Determine risk level
    const totalVariance = lineItems.reduce(
        (acc, item) => acc + Math.abs(item.variance),
        0
    );
    const totalQuote = lineItems.reduce((acc, item) => acc + item.quoteAmount, 0);
    const varianceRatio = totalQuote > 0 ? totalVariance / totalQuote : 0;

    if (varianceRatio > 0.15 || summary.unmatchedInvoiceItems > 2) {
        summary.riskLevel = 'critical';
    } else if (varianceRatio > 0.08 || summary.unmatchedInvoiceItems > 0) {
        summary.riskLevel = 'high';
    } else if (varianceRatio > 0.03) {
        summary.riskLevel = 'medium';
    }

    const totalQuoteAmount = lineItems.reduce((acc, i) => acc + i.quoteAmount, 0);
    const totalInvoiceAmount = lineItems.reduce((acc, i) => acc + i.invoiceAmount, 0);

    onProgress?.(100, 'Audit complete.');

    return {
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        quoteFileName,
        invoiceFileName,
        totalQuoteAmount,
        totalInvoiceAmount,
        totalVariance: totalInvoiceAmount - totalQuoteAmount,
        lineItems,
        summary,
    };
}
