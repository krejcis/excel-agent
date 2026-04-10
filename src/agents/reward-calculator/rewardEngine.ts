/* ============================================
   LogiCore AI – Reward Calculation Engine
   Smart Sheet Detection + Progressive Tier
   Calculation. All processing client-side.
   ============================================ */

import type { ParsedSheet, ParsedWorkbook, RewardTier, DriverReward, RewardResult, SheetDetection, ColumnOverride } from '@/types';

// ── Keyword lists for fuzzy detection ───────

/** Keywords indicating a lower-bound column in a tier sheet (spodní hranice / od) */
const LOWER_BOUND_KEYWORDS: string[] = [
    'od', 'min', 'start', 'from', 'minimum',
    'von', 'ab',
    'spodni hranice', 'od zasilek', 'from shipments',
];

/** Keywords indicating a rate/reward column in a tier sheet (sazba / odměna) */
const RATE_KEYWORDS: string[] = [
    'odmena', 'sazba', 'cena', 'castka', 'rate', 'price', 'reward', 'vyplata', 'penize',
    'pramie', 'satz', 'betrag',
    'odmena za', 'cena za', 'rate per', 'sazba za',
    'odmena celkem',
];

/** Keywords indicating an upper-bound column in a tier sheet (horní hranice / do) */
const UPPER_BOUND_KEYWORDS: string[] = [
    'do', 'max', 'end', 'to', 'limit', 'maximum',
    'bis',
    'horni hranice', 'do zasilek',
];

/** Keywords indicating a driver name column */
const NAME_KEYWORDS: string[] = [
    'jmeno', 'kuryr', 'ridic', 'uzivatel', 'osoba', 'pracovnik', 'name', 'driver', 'user', 'zamestnanec',
    'fahrer', 'kurier', 'benutzer',
    'prijmeni', 'jmeno kuryre',
];

/** Keywords indicating a shipment count column */
const COUNT_KEYWORDS: string[] = [
    'pocet', 'zasilek', 'ks', 'mnozstvi', 'celkem', 'count', 'amount', 'total', 'kusy', 'kus',
    'sendungen', 'anzahl', 'pakete',
    'shipment', 'shipments',
    'zasilek celkem', 'pocet zasilek',
    'total shipments', 'celkem zasilek',
];

// ── Normalize helper ────────────────────────

/**
 * Null-safe normalize: strips diacritics, lowercases, collapses whitespace.
 * Accepts any value — returns empty string for null/undefined/non-string.
 */
function normalize(raw: unknown): string {
    if (!raw) return '';
    return raw
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // strip diacritics
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ');           // collapse multiple spaces
}

/**
 * Check if a header contains any of the given alias keywords.
 * Matching is done on normalized strings (no diacritics, lowercase).
 * Direction: normalizedHeader.includes(normalizedAlias)
 */
function headerMatchesAny(header: string, aliases: string[]): boolean {
    const normHeader = normalize(header);
    return aliases.some((alias) => normHeader.includes(normalize(alias)));
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
 * @param override – if provided, uses these column names directly instead of fuzzy detection.
 */
export function extractTiers(sheet: ParsedSheet, override?: ColumnOverride): RewardTier[] {
    const headers = sheet.headers;

    const lbIdx = override?.lowerBoundCol
        ? headers.indexOf(override.lowerBoundCol)
        : findColumnIndex(headers, LOWER_BOUND_KEYWORDS);
    if (lbIdx === -1) {
        throw new RewardEngineError(
            'rewardCalculator.errorNoLowerBound',
            'Lower bound column not found in tier sheet',
        );
    }

    const rateIdx = override?.rateCol
        ? headers.indexOf(override.rateCol)
        : findColumnIndex(headers, RATE_KEYWORDS);
    if (rateIdx === -1) {
        throw new RewardEngineError(
            'rewardCalculator.errorNoRate',
            'Rate column not found in tier sheet',
        );
    }

    // Optional: upper bound column
    const ubIdx = override?.upperBoundCol
        ? headers.indexOf(override.upperBoundCol)
        : findColumnIndex(headers, UPPER_BOUND_KEYWORDS);

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
 * @param override – if provided, uses these column names directly instead of fuzzy detection.
 */
export function extractDrivers(sheet: ParsedSheet, override?: ColumnOverride): RawDriver[] {
    const headers = sheet.headers;

    const nameIdx = override?.nameCol
        ? headers.indexOf(override.nameCol)
        : findColumnIndex(headers, NAME_KEYWORDS);
    if (nameIdx === -1) {
        throw new RewardEngineError(
            'rewardCalculator.errorNoName',
            'Name column not found in data sheet',
        );
    }

    const countIdx = override?.countCol
        ? headers.indexOf(override.countCol)
        : findColumnIndex(headers, COUNT_KEYWORDS);
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
 *
 * Tiers are sorted ascending by `from`. For each tier the size is
 * `to - from + 1` (inclusive on both ends). The last/open-ended tier
 * (to === 0 | null | undefined) is treated as Infinity.
 *
 * Verified examples (tiers: 1-5@120, 6-10@100, 11-20@80, 21-30@60):
 *   3  shipments →  3 * 120               =  360 Kč
 *   16 shipments →  5*120 + 5*100 + 6*80  = 1580 Kč
 */
export function calculateProgressiveReward(
    shipments: number,
    tiers: RewardTier[],
): number {
    if (shipments <= 0 || tiers.length === 0) return 0;

    // Sort tiers ascending by lower bound (defensive copy)
    const sorted = [...tiers].sort((a, b) => a.from - b.from);

    let total = 0;
    let remaining = shipments;

    for (const tier of sorted) {
        if (remaining <= 0) break;

        // Treat to === 0 / null / undefined as open-ended (Infinity)
        const tierMax =
            tier.to === 0 || tier.to === null || tier.to === undefined
                ? Infinity
                : tier.to;

        // Size of this tier band (inclusive: from=1, to=5 → 5 slots)
        const tierSize = tierMax === Infinity ? remaining : tierMax - tier.from + 1;

        const countInTier = Math.min(remaining, tierSize);
        total += countInTier * tier.rate;
        remaining -= countInTier;
    }

    return Math.round(total * 100) / 100; // Round to 2 decimal places
}

// ── Full Calculation Pipeline ───────────────

/**
 * Run the complete reward calculation given a workbook and
 * the indices of the tier/data sheets.
 * @param override – optional manual column mapping to bypass fuzzy detection.
 */
export function calculateRewards(
    workbook: ParsedWorkbook,
    tiersSheetIndex: number,
    dataSheetIndex: number,
    override?: ColumnOverride,
): RewardResult {
    const tiersSheet = workbook.sheets[tiersSheetIndex];
    const dataSheet = workbook.sheets[dataSheetIndex];

    // Extract structured data (pass override for direct column lookup)
    const tiers = extractTiers(tiersSheet, override);
    const rawDrivers = extractDrivers(dataSheet, override);

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
