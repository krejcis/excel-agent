/* ============================================
   LogiCore AI – Reward Calculation Engine
   Smart Sheet Detection + Progressive Tier
   Calculation. All processing client-side.
   ============================================ */

import type { ParsedSheet, ParsedWorkbook, RewardTier, DriverReward, RewardResult, SheetDetection } from '@/types';

// ── Keyword lists for fuzzy detection ───────

/** Keywords indicating a lower-bound column in a tier sheet */
const LOWER_BOUND_KEYWORDS: string[] = [
    'od', 'min', 'start', 'from', 'von', 'ab',
];

/** Keywords indicating a rate/reward column in a tier sheet */
const RATE_KEYWORDS: string[] = [
    'sazba', 'cena', 'odmena', 'odměna', 'odmena', 'rate', 'reward',
    'prämie', 'pramie', 'satz', 'betrag', 'price',
];

/** Keywords indicating an upper-bound column in a tier sheet */
const UPPER_BOUND_KEYWORDS: string[] = [
    'do', 'max', 'end', 'to', 'bis',
];

/** Keywords indicating a driver name column */
const NAME_KEYWORDS: string[] = [
    'jmeno', 'jméno', 'kurýr', 'kuryr', 'ridic', 'řidič', 'ridič',
    'name', 'driver', 'user', 'uživatel', 'uzivatel',
    'fahrer', 'kurier', 'benutzer',
];

/** Keywords indicating a shipment count column */
const COUNT_KEYWORDS: string[] = [
    'zasilek', 'zásilek', 'pocet', 'počet', 'ks', 'kusu',
    'count', 'shipment', 'shipments', 'amount', 'total',
    'sendungen', 'anzahl', 'pakete',
];

// ── Normalize helper ────────────────────────

/**
 * Normalize a header string for fuzzy comparison:
 * lowercase, strip accents, collapse whitespace/underscores.
 */
function normalize(raw: string): string {
    return raw
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip diacritics
        .replace(/[^a-z0-9]/g, '')       // remove non-alphanumeric
        .trim();
}

/**
 * Check if a header matches any keyword from a list.
 * Uses substring matching for flexibility.
 */
function headerMatchesAny(header: string, keywords: string[]): boolean {
    const norm = normalize(header);
    return keywords.some((kw) => {
        const nkw = normalize(kw);
        return norm === nkw || norm.includes(nkw) || nkw.includes(norm);
    });
}

/**
 * Find the first header index that matches any keyword in the list.
 * Returns -1 if not found.
 */
function findColumnIndex(headers: string[], keywords: string[]): number {
    return headers.findIndex((h) => headerMatchesAny(h, keywords));
}

// ── Smart Sheet Detection ───────────────────

/**
 * Detect which sheet is the tier table and which is the data table.
 * Returns indices or null if detection fails.
 */
export function detectSheets(workbook: ParsedWorkbook): SheetDetection {
    let tiersSheetIndex: number | null = null;
    let dataSheetIndex: number | null = null;

    // Step A: Find the tier sheet – must have BOTH a lower-bound AND a rate column
    for (let i = 0; i < workbook.sheets.length; i++) {
        const sheet = workbook.sheets[i];
        const headers = sheet.headers;
        const hasLowerBound = headers.some((h) => headerMatchesAny(h, LOWER_BOUND_KEYWORDS));
        const hasRate = headers.some((h) => headerMatchesAny(h, RATE_KEYWORDS));

        if (hasLowerBound && hasRate) {
            tiersSheetIndex = i;
            break;
        }
    }

    // Step B: Find the data sheet – among remaining sheets, find one with BOTH name AND count
    for (let i = 0; i < workbook.sheets.length; i++) {
        if (i === tiersSheetIndex) continue;

        const sheet = workbook.sheets[i];
        const headers = sheet.headers;
        const hasName = headers.some((h) => headerMatchesAny(h, NAME_KEYWORDS));
        const hasCount = headers.some((h) => headerMatchesAny(h, COUNT_KEYWORDS));

        if (hasName && hasCount) {
            dataSheetIndex = i;
            break;
        }
    }

    const autoDetected = tiersSheetIndex !== null && dataSheetIndex !== null;

    return { tiersSheetIndex, dataSheetIndex, autoDetected };
}

// ── Tier Extraction ─────────────────────────

/**
 * Error class for localized validation errors.
 * The `translationKey` can be passed to t() for display.
 */
export class RewardEngineError extends Error {
    public readonly translationKey: string;

    constructor(translationKey: string, message: string) {
        super(message);
        this.name = 'RewardEngineError';
        this.translationKey = translationKey;
    }
}

/**
 * Extract tier data from a parsed sheet.
 * Throws RewardEngineError with appropriate translation key on failure.
 */
export function extractTiers(sheet: ParsedSheet): RewardTier[] {
    const headers = sheet.headers;

    const lbIdx = findColumnIndex(headers, LOWER_BOUND_KEYWORDS);
    if (lbIdx === -1) {
        throw new RewardEngineError(
            'rewardCalculator.errorNoLowerBound',
            'Lower bound column not found in tier sheet',
        );
    }

    const rateIdx = findColumnIndex(headers, RATE_KEYWORDS);
    if (rateIdx === -1) {
        throw new RewardEngineError(
            'rewardCalculator.errorNoRate',
            'Rate column not found in tier sheet',
        );
    }

    // Optional: upper bound column
    const ubIdx = findColumnIndex(headers, UPPER_BOUND_KEYWORDS);

    const lbHeader = headers[lbIdx];
    const rateHeader = headers[rateIdx];
    const ubHeader = ubIdx !== -1 ? headers[ubIdx] : null;

    const tiers: RewardTier[] = [];

    for (const row of sheet.rows) {
        const fromRaw = row[lbHeader];
        const rateRaw = row[rateHeader];

        const from = parseNumeric(fromRaw);
        const rate = parseNumeric(rateRaw);

        if (from === null || rate === null) continue;

        let to: number | null = null;
        if (ubHeader !== null) {
            const toRaw = row[ubHeader];
            to = parseNumeric(toRaw);
            // Empty cell or 0 means infinity (last tier)
            if (to === 0) to = null;
        }

        tiers.push({ from, to, rate });
    }

    if (tiers.length === 0) {
        throw new RewardEngineError(
            'rewardCalculator.errorNoTiers',
            'No valid tiers found in the tier sheet',
        );
    }

    // Sort tiers by lower bound ascending
    tiers.sort((a, b) => a.from - b.from);

    // Ensure last tier has to = null (infinity)
    const lastTier = tiers[tiers.length - 1];
    if (lastTier.to !== null && lastTier.to <= lastTier.from) {
        lastTier.to = null;
    }

    return tiers;
}

// ── Driver Extraction ───────────────────────

interface RawDriver {
    name: string;
    shipments: number;
}

/**
 * Extract driver names and shipment counts from data sheet.
 * Throws RewardEngineError with appropriate translation key on failure.
 */
export function extractDrivers(sheet: ParsedSheet): RawDriver[] {
    const headers = sheet.headers;

    const nameIdx = findColumnIndex(headers, NAME_KEYWORDS);
    if (nameIdx === -1) {
        throw new RewardEngineError(
            'rewardCalculator.errorNoName',
            'Name column not found in data sheet',
        );
    }

    const countIdx = findColumnIndex(headers, COUNT_KEYWORDS);
    if (countIdx === -1) {
        throw new RewardEngineError(
            'rewardCalculator.errorNoCount',
            'Count column not found in data sheet',
        );
    }

    const nameHeader = headers[nameIdx];
    const countHeader = headers[countIdx];

    const drivers: RawDriver[] = [];

    for (const row of sheet.rows) {
        const nameRaw = row[nameHeader];
        const countRaw = row[countHeader];

        const name = String(nameRaw ?? '').trim();
        const shipments = parseNumeric(countRaw);

        if (name === '' || shipments === null) continue;

        drivers.push({ name, shipments });
    }

    if (drivers.length === 0) {
        throw new RewardEngineError(
            'rewardCalculator.errorNoDrivers',
            'No valid driver rows found in data sheet',
        );
    }

    return drivers;
}

// ── Progressive Calculation ─────────────────

/**
 * Calculate progressive reward for a given number of shipments.
 * Iterates tiers ascending, applying each tier's rate only for
 * the shipments falling within that tier's interval.
 *
 * Example:
 *   Tiers: [0-50 @ 20, 51-100 @ 25, 101+ @ 30]
 *   Shipments: 75
 *   → 50 * 20 + 25 * 25 = 1000 + 625 = 1625
 */
export function calculateProgressiveReward(
    shipments: number,
    tiers: RewardTier[],
): number {
    if (shipments <= 0 || tiers.length === 0) return 0;

    let totalReward = 0;
    let remaining = shipments;

    for (const tier of tiers) {
        if (remaining <= 0) break;

        // Determine how many shipments fall into this tier
        const tierWidth = tier.to !== null
            ? tier.to - tier.from
            : remaining; // Infinity tier takes all remaining

        // Cap to what we actually have remaining
        const applicableCount = Math.min(remaining, tierWidth > 0 ? tierWidth : remaining);

        totalReward += applicableCount * tier.rate;
        remaining -= applicableCount;
    }

    return Math.round(totalReward * 100) / 100; // Round to 2 decimal places
}

// ── Full Calculation Pipeline ───────────────

/**
 * Run the complete reward calculation given a workbook and
 * the indices of the tier/data sheets.
 */
export function calculateRewards(
    workbook: ParsedWorkbook,
    tiersSheetIndex: number,
    dataSheetIndex: number,
): RewardResult {
    const tiersSheet = workbook.sheets[tiersSheetIndex];
    const dataSheet = workbook.sheets[dataSheetIndex];

    // Extract structured data
    const tiers = extractTiers(tiersSheet);
    const rawDrivers = extractDrivers(dataSheet);

    // Calculate reward for each driver
    const drivers: DriverReward[] = rawDrivers.map((d) => ({
        name: d.name,
        shipments: d.shipments,
        reward: calculateProgressiveReward(d.shipments, tiers),
    }));

    const totalReward = drivers.reduce((sum, d) => sum + d.reward, 0);

    return {
        tiers,
        drivers,
        totalReward: Math.round(totalReward * 100) / 100,
        tiersSheetName: tiersSheet.name,
        dataSheetName: dataSheet.name,
    };
}

// ── Helpers ─────────────────────────────────

/**
 * Parse a value to a number. Returns null if not parseable.
 * Handles string numbers with commas (European format).
 */
function parseNumeric(val: unknown): number | null {
    if (val === null || val === undefined || val === '') return null;

    if (typeof val === 'number') {
        return isNaN(val) ? null : val;
    }

    if (typeof val === 'string') {
        // Remove whitespace and replace comma with dot
        const cleaned = val.replace(/\s/g, '').replace(',', '.');
        const num = Number(cleaned);
        return isNaN(num) ? null : num;
    }

    return null;
}
