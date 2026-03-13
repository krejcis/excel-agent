/* ============================================
   LogiCore AI – Excel Parser Utility
   Client-side only. No data leaves the browser.
   ============================================ */

import * as XLSX from 'xlsx';
import type { ParsedSheet, ParsedWorkbook } from '@/types';

/** Maximum number of rows to scan when looking for the header row. */
const HEADER_SCAN_DEPTH = 10;

/**
 * Score a candidate row as a header row.
 * Higher score = more likely to be a header.
 * Criteria: non-empty text cells that are not purely numeric.
 */
function scoreHeaderRow(row: unknown[]): number {
    let score = 0;
    for (const cell of row) {
        const s = String(cell ?? '').trim();
        if (s === '') continue;
        // Prefer text cells, penalise pure numbers
        if (isNaN(Number(s.replace(',', '.'))) || s.length > 6) {
            score += 2;
        } else {
            score += 1;
        }
    }
    return score;
}

/**
 * Find the most likely header row index within the first HEADER_SCAN_DEPTH rows.
 * Returns 0 if no better candidate is found.
 */
function detectHeaderRowIndex(rawData: unknown[][]): number {
    const scanLimit = Math.min(HEADER_SCAN_DEPTH, rawData.length);
    let bestIdx = 0;
    let bestScore = -1;

    for (let i = 0; i < scanLimit; i++) {
        const score = scoreHeaderRow(rawData[i] as unknown[]);
        if (score > bestScore) {
            bestScore = score;
            bestIdx = i;
        }
    }

    return bestIdx;
}

/**
 * Parses an Excel file (.xlsx) entirely client-side.
 * Deep-scans the first 10 rows of each sheet to locate the header row,.
 * then cleans headers and builds typed row objects.
 */
export async function parseExcelFile(file: File): Promise<ParsedWorkbook> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    const sheets: ParsedSheet[] = workbook.SheetNames.map((name) => {
        const sheet = workbook.Sheets[name];

        // Get raw data as array-of-arrays (keep blank rows for deep scan)
        const rawDataAll = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
            header: 1,
            defval: '',
            blankrows: true,
        });

        if (rawDataAll.length === 0) {
            return { name, headers: [], rows: [], rawData: [] };
        }

        // ── Deep scan: find the header row ────────────────────────────────────
        const headerRowIdx = detectHeaderRowIndex(rawDataAll as unknown[][]);

        // Extract and clean headers from detected row
        const rawHeaders = (rawDataAll[headerRowIdx] as unknown[]).map((h) =>
            cleanHeaderValue(String(h ?? ''))
        );

        // Strip empty-string header slots (trailing empty cells)
        const validHeaderCount = rawHeaders.filter((h) => h !== '').length || rawHeaders.length;

        // Re-read rawData without blankrows for clean row iteration
        const rawData = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
            header: 1,
            defval: '',
            blankrows: false,
        }) as unknown[][];

        // Build rows as objects keyed by cleaned headers (skip rows up to & including header)
        const rows: Record<string, unknown>[] = [];
        const dataStartIdx = rawData.findIndex((row) => {
            // Find this same header row in the blankrows=false version
            const s = scoreHeaderRow(row as unknown[]);
            return s === scoreHeaderRow(rawDataAll[headerRowIdx] as unknown[]);
        });
        const firstDataRow = dataStartIdx >= 0 ? dataStartIdx + 1 : headerRowIdx + 1;

        for (let i = firstDataRow; i < rawData.length; i++) {
            const rawRow = rawData[i] as unknown[];
            const row: Record<string, unknown> = {};
            let hasValue = false;

            for (let colIdx = 0; colIdx < validHeaderCount; colIdx++) {
                const header = rawHeaders[colIdx];
                if (!header) continue;
                const val = rawRow[colIdx] ?? '';
                const cleaned = cleanCellValue(val);
                row[header] = cleaned;
                if (cleaned !== '' && cleaned !== null && cleaned !== undefined) {
                    hasValue = true;
                }
            }

            // Skip entirely empty rows
            if (hasValue) {
                rows.push(row);
            }
        }

        return { name, headers: rawHeaders.slice(0, validHeaderCount), rows, rawData };
    });

    const totalRows = sheets.reduce((acc, s) => acc + s.rows.length, 0);

    return {
        fileName: file.name,
        sheets,
        totalRows,
    };
}

/**
 * Cleans a header value: trims, lowercases, replaces spaces/special chars with underscores.
 */
function cleanHeaderValue(raw: string): string {
    return raw
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9äöüß_]/gi, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
}

/**
 * Cleans an individual cell value.
 */
function cleanCellValue(val: unknown): unknown {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val.trim();
    if (val instanceof Date) return val.toISOString().split('T')[0];
    return val;
}

/**
 * Extracts a human-readable summary of parsed data for AI context.
 * Only sends structure + sample data, never full file contents.
 */
export function extractDataSummaryForAI(
    parsed: ParsedWorkbook,
    maxRows: number = 50
): string {
    const { sheets, fileName } = parsed;
    const parts: string[] = [`File: ${fileName}`];

    for (const sheet of sheets) {
        parts.push(`\nSheet: "${sheet.name}" (${sheet.rows.length} rows)`);
        parts.push(`Headers: ${sheet.headers.join(', ')}`);

        const sampleRows = sheet.rows.slice(0, maxRows);
        parts.push(`Data (first ${sampleRows.length} rows):`);
        parts.push(JSON.stringify(sampleRows, null, 2));
    }

    return parts.join('\n');
}

/**
 * Converts parsed rows into a simple JSON array suitable for AI processing.
 * Limits to maxRows for token efficiency.
 */
export function toAIPayload(
    rows: Record<string, unknown>[],
    maxRows: number = 100
): Record<string, unknown>[] {
    return rows.slice(0, maxRows).map((row) => {
        const clean: Record<string, unknown> = {};
        for (const [key, val] of Object.entries(row)) {
            if (val !== '' && val !== null && val !== undefined) {
                clean[key] = val;
            }
        }
        return clean;
    });
}
