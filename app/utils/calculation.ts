import * as XLSX from 'xlsx';

export interface CalculationResult {
  preview: any[];
  workbook: XLSX.WorkBook;
}

export const processExcelFile = async (fileBuffer: ArrayBuffer): Promise<CalculationResult> => {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });

  // 1. Validate Sheets
  if (!workbook.SheetNames.includes('sazebnik')) {
    throw new Error('Sheet "sazebnik" not found.');
  }
  if (!workbook.SheetNames.includes('odmeny')) {
    throw new Error('Sheet "odmeny" not found.');
  }

  const sazebnikSheet = workbook.Sheets['sazebnik'];
  const odmenySheet = workbook.Sheets['odmeny'];

  // 2. Parse Sazebnik (Rates)
  // Get raw data as array of arrays
  const sazebnikData = XLSX.utils.sheet_to_json<any[]>(sazebnikSheet, { header: 1 });

  interface Tier {
    min: number;
    max: number;
    rate: number;
  }

  const tiers: Tier[] = [];

  // Skip header if present. We look for rows with 3 numeric values.
  for (let i = 0; i < sazebnikData.length; i++) {
    const row = sazebnikData[i];
    if (!row || row.length < 3) continue;

    // Attempt to parse columns A, B, C
    const min = parseFloat(row[0]);
    const max = parseFloat(row[1]);
    const rate = parseFloat(row[2]);

    if (!isNaN(min) && !isNaN(max) && !isNaN(rate)) {
      tiers.push({ min, max, rate });
    }
  }

  if (tiers.length === 0) {
    throw new Error('No valid tiers found in "sazebnik" sheet (Columns A, B, C must be numeric).');
  }

  // Sort tiers by Min Quantity
  tiers.sort((a, b) => a.min - b.min);

  // 3. Process Odmeny (Rewards)
  const odmenyData = XLSX.utils.sheet_to_json<any[]>(odmenySheet, { header: 1 });

  // We will modify odmenyData in place and create a new sheet from it.
  // Identify header row. Usually row 0.
  // We'll iterate from row 1 (assuming row 0 is header).

  let startRow = 0;
  if (odmenyData.length > 0) {
    const firstRowValB = odmenyData[0][1];
    // Check if it's a number. If not, assume it's a header.
    // "Shipment Count" -> NaN -> Header.
    // 100 -> 100 -> Data.
    if (isNaN(parseFloat(firstRowValB))) {
      startRow = 1;
    }
  }

  const previewData: any[] = [];

  // Start processing from startRow
  for (let i = startRow; i < odmenyData.length; i++) {
    const row = odmenyData[i];
    // Ensure row exists and has at least 2 columns (Name, Count)
    if (!row || row.length < 2) continue;

    const name = row[0];
    let count = parseFloat(row[1]);

    if (isNaN(count)) count = 0;

    // Calculate Reward
    let totalReward = 0;
    let remaining = count;

    for (const tier of tiers) {
        if (remaining <= 0) break;

        const capacity = tier.max - tier.min + 1;
        const taken = Math.min(remaining, capacity);

        totalReward += taken * tier.rate;
        remaining -= taken;
    }

    // Overflow Rule
    if (remaining > 0) {
        const lastTier = tiers[tiers.length - 1];
        totalReward += remaining * lastTier.rate;
    }

    // Update Column C (Index 2)
    // Ensure the row array is long enough
    if (row.length < 3) {
        row[2] = totalReward;
    } else {
        row[2] = totalReward;
    }

    // Add to preview
    if (previewData.length < 5) {
        previewData.push({
            name,
            count,
            totalReward
        });
    }
  }

  // Create new sheet
  const newSheet = XLSX.utils.aoa_to_sheet(odmenyData);
  workbook.Sheets['odmeny'] = newSheet;

  return { preview: previewData, workbook };
};
