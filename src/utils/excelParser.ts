/* ============================================
   LogiCore AI – Excel Parser Utility
   Client-side only. No data leaves the browser.
   ============================================ */

import * as XLSX from 'xlsx';
import type { ParsedSheet, ParsedWorkbook } from '@/types';

/**
 * Parses an Excel file (.xlsx) entirely client-side.
 * Applies automatic data cleaning: trims whitespace, normalizes headers,
 * and filters out completely empty rows.
 */
export async function parseExcelFile(file: File): Promise<ParsedWorkbook> {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });

    const sheets: ParsedSheet[] = workbook.SheetNames.map((name) => {
        const sheet = workbook.Sheets[name];

        // Get raw data as array-of-arrays
        const rawData = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
            header: 1,
            defval: '',
            blankrows: false,
        });

        if (rawData.length === 0) {
            return { name, headers: [], rows: [], rawData: [] };
        }

        // Extract and clean headers
        const rawHeaders = (rawData[0] as unknown[]).map((h) =>
            cleanHeaderValue(String(h ?? ''))
        );

        // Build rows as objects keyed by cleaned headers
        const rows: Record<string, unknown>[] = [];
        for (let i = 1; i < rawData.length; i++) {
            const rawRow = rawData[i] as unknown[];
            const row: Record<string, unknown> = {};
            let hasValue = false;

            rawHeaders.forEach((header, colIdx) => {
                const val = rawRow[colIdx] ?? '';
                const cleaned = cleanCellValue(val);
                row[header] = cleaned;
                if (cleaned !== '' && cleaned !== null && cleaned !== undefined) {
                    hasValue = true;
                }
            });

            // Skip entirely empty rows
            if (hasValue) {
                rows.push(row);
            }
        }

        return { name, headers: rawHeaders, rows, rawData: rawData as unknown[][] };
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
