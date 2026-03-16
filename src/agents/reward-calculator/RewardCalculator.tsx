/* ============================================
   LogiCore AI – Reward Calculator Agent
   Full UI: Upload → Detect → Calculate → Export
   Single file drag & drop workflow.
   ============================================ */

import React, { useCallback, useState, useRef } from 'react';
import {
    Calculator,
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Download,
    RotateCcw,
    Users,
    Coins,
    ChevronDown,
    SlidersHorizontal,
} from 'lucide-react';
import ExcelJS from 'exceljs';
import { parseExcelFile } from '@/utils/excelParser';
import {
    detectSheets,
    calculateRewards,
    RewardEngineError,
} from '@/agents/reward-calculator/rewardEngine';
import { useLanguage } from '@/context/LanguageContext';
import type { ParsedWorkbook, RewardResult } from '@/types';

// ── Types ─────────────────────────────────────

type Phase = 'upload' | 'detecting' | 'manual-select' | 'results';

/** Column mapping chosen by the user in the manual-select phase */
interface ColumnMapping {
    tiersSheetIdx: number;
    dataSheetIdx: number;
    nameCol: string;
    countCol: string;
    lowerBoundCol: string;
    rateCol: string;
}

// ── Helper: get all non-empty header options from a sheet ─────────────────

function getHeaderOptions(workbook: ParsedWorkbook, sheetIdx: number): string[] {
    const sheet = workbook.sheets[sheetIdx];
    if (!sheet) return [];
    return sheet.headers.filter((h) => h !== '');
}

// ── Main Component ────────────────────────────

export const RewardCalculator: React.FC = () => {
    const { t } = useLanguage();

    // State
    const [phase, setPhase] = useState<Phase>('upload');
    const [isDragActive, setIsDragActive] = useState(false);
    const [workbook, setWorkbook] = useState<ParsedWorkbook | null>(null);
    const [originalFile, setOriginalFile] = useState<File | null>(null);
    const [result, setResult] = useState<RewardResult | null>(null);
    const [calcError, setCalcError] = useState('');

    // Manual selection fallback
    const [manualTiersIdx, setManualTiersIdx] = useState(0);
    const [manualDataIdx, setManualDataIdx] = useState(1);

    // Column mapping (manual override)
    const [columnMapping, setColumnMapping] = useState<Partial<ColumnMapping>>({});

    const fileInputRef = useRef<HTMLInputElement>(null);

    // ── File handling ─────────────────────────

    const processFile = useCallback(
        async (file: File) => {
            setCalcError('');
            setPhase('detecting');
            setOriginalFile(file);

            try {
                const parsed = await parseExcelFile(file);
                setWorkbook(parsed);

                if (parsed.sheets.length < 2) {
                    // Not enough sheets – go directly to manual select with 1 sheet
                    setManualTiersIdx(0);
                    setManualDataIdx(0);
                    setColumnMapping({});
                    setPhase('manual-select');
                    return;
                }

                // Smart detection
                const detection = detectSheets(parsed);

                if (detection.autoDetected && detection.tiersSheetIndex !== null && detection.dataSheetIndex !== null) {
                    // Auto-detected – try to run calculation directly
                    try {
                        const calcResult = calculateRewards(
                            parsed,
                            detection.tiersSheetIndex,
                            detection.dataSheetIndex,
                        );
                        setResult(calcResult);
                        setPhase('results');
                    } catch {
                        // Calculation failed even after auto-detect → fall through to manual
                        setManualTiersIdx(detection.tiersSheetIndex);
                        setManualDataIdx(detection.dataSheetIndex);
                        setColumnMapping({});
                        setPhase('manual-select');
                    }
                } else {
                    // Auto-detect failed → manual sheet selection
                    setManualTiersIdx(detection.tiersSheetIndex ?? 0);
                    setManualDataIdx(detection.dataSheetIndex ?? (parsed.sheets.length > 1 ? 1 : 0));
                    setColumnMapping({});
                    setPhase('manual-select');
                }
            } catch (err: unknown) {
                // Hard parse error – still fall back to manual if possible
                setCalcError(err instanceof Error ? err.message : t('rewardCalculator.parseFailed'));
                setPhase('manual-select');
            }
        },
        [t],
    );

    const handleFile = useCallback(
        (file: File) => {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                processFile(file);
            }
        },
        [processFile],
    );

    // ── Drag events ───────────────────────────

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);
            const files = Array.from(e.dataTransfer.files);
            if (files[0]) handleFile(files[0]);
        },
        [handleFile],
    );

    const onFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files?.[0]) handleFile(files[0]);
            e.target.value = '';
        },
        [handleFile],
    );

    // ── Manual column mapping confirm ─────────

    const handleManualConfirm = useCallback(() => {
        if (!workbook) return;
        setCalcError('');

        // Build override only from fields the user explicitly filled in
        const override = {
            nameCol: columnMapping.nameCol || undefined,
            countCol: columnMapping.countCol || undefined,
            lowerBoundCol: columnMapping.lowerBoundCol || undefined,
            rateCol: columnMapping.rateCol || undefined,
        };
        const hasOverride = Object.values(override).some(Boolean);

        try {
            const calcResult = calculateRewards(
                workbook,
                manualTiersIdx,
                manualDataIdx,
                hasOverride ? override : undefined,
            );
            setResult(calcResult);
            setPhase('results');
        } catch (err: unknown) {
            // Column detection still failed even after manual sheet pick
            // Show inline error and keep user on manual-select
            if (err instanceof RewardEngineError) {
                setCalcError(t(err.translationKey));
            } else {
                setCalcError(err instanceof Error ? err.message : t('rewardCalculator.parseFailed'));
            }
        }
    }, [workbook, manualTiersIdx, manualDataIdx, columnMapping, t]);


    // ── Export to XLSX (format-preserving via exceljs) ───────────────────

    const handleDownload = useCallback(async () => {
        if (!result || !workbook || !originalFile) return;

        // Keywords for fuzzy reward-column detection (normalised, no diacritics)
        const REWARD_KEYWORDS = ['odmena', 'odmna', 'odměna', 'reward', 'pramie', 'pramie'];

        /** Normalise header text for fuzzy matching (strip diacritics + non-alpha). */
        function normHeader(s: string): string {
            return s
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/g, '');
        }

        try {
            // Load original file as ArrayBuffer so exceljs can preserve all styles
            const arrayBuffer = await originalFile.arrayBuffer();

            const exWb = new ExcelJS.Workbook();
            await exWb.xlsx.load(arrayBuffer);

            // Find the data worksheet by name
            const exDataSheet = exWb.getWorksheet(result.dataSheetName);
            if (!exDataSheet) {
                throw new Error(`Sheet '${result.dataSheetName}' not found in workbook`);
            }

            // Build a lookup: driver name → reward value
            const rewardMap = new Map<string, number>(
                result.drivers.map((d) => [d.name.trim(), d.reward]),
            );

            // ── Detect or create reward column ───────────────────────────────
            const headerRow = exDataSheet.getRow(1);
            let rewardColNumber = -1;

            // 1. Try to find an existing reward column by fuzzy match
            headerRow.eachCell((cell, colNumber) => {
                const headerText = String(cell.value ?? '');
                if (REWARD_KEYWORDS.some((kw) => normHeader(headerText).includes(kw))) {
                    rewardColNumber = colNumber;
                }
            });

            // 2. No match → append a new column at the end
            if (rewardColNumber === -1) {
                rewardColNumber = (exDataSheet.columnCount || 0) + 1;
                // Write the header label
                const headerCell = headerRow.getCell(rewardColNumber);
                headerCell.value = 'Vypočítaná odměna (CZK)';
                headerCell.font = { bold: true };
                headerRow.commit();
            }

            // ── Detect name column in the header row ─────────────────────────
            const NAME_NORM_KEYWORDS = [
                'jmeno', 'kuryr', 'ridic', 'name', 'driver', 'user', 'uzivatel', 'fahrer', 'kurier',
            ];
            let nameColNumber = -1;
            headerRow.eachCell((cell, colNumber) => {
                if (nameColNumber !== -1) return;
                const h = normHeader(String(cell.value ?? ''));
                if (NAME_NORM_KEYWORDS.some((kw) => h.includes(kw))) {
                    nameColNumber = colNumber;
                }
            });

            // ── Write reward values for each data row ────────────────────────
            exDataSheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return; // skip header

                const nameCell = nameColNumber !== -1 ? row.getCell(nameColNumber) : null;
                const driverName = String(nameCell?.value ?? '').trim();
                const reward = rewardMap.get(driverName);

                if (reward !== undefined) {
                    const rewardCell = row.getCell(rewardColNumber);
                    rewardCell.value = reward;
                    rewardCell.numFmt = '#,##0.00';
                    row.commit();
                }
            });

            // ── Save the modified workbook while keeping all other sheets ─────
            const buffer = await exWb.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = originalFile.name.replace(/\.xlsx?$/i, '') + '_rewards.xlsx';
            link.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('[RewardCalculator] Export failed:', err);
        }
    }, [result, workbook, originalFile]);

    // ── Reset ─────────────────────────────────

    const handleReset = useCallback(() => {
        setPhase('upload');
        setWorkbook(null);
        setOriginalFile(null);
        setResult(null);
        setCalcError('');
        setManualTiersIdx(0);
        setManualDataIdx(1);
        setColumnMapping({});
    }, []);

    // ── Format helpers ────────────────────────

    const fmtCurrency = (n: number): string =>
        n.toLocaleString('cs-CZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // ── Column mapping helpers ─────────────────

    const tiersHeaders = workbook ? getHeaderOptions(workbook, manualTiersIdx) : [];
    const dataHeaders  = workbook ? getHeaderOptions(workbook, manualDataIdx)  : [];

    const setMap = (key: keyof ColumnMapping, val: string | number) =>
        setColumnMapping((prev) => ({ ...prev, [key]: val }));

    // ── RENDER ────────────────────────────────

    return (
        <div className="max-w-screen-xl mx-auto px-6 py-8 animate-[fade-in_0.5s_ease-out]">
            {/* Agent Header */}
            <div className="flex items-start gap-4 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 shadow-lg shadow-emerald-900/20">
                    <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t('rewardCalculator.title')}</h2>
                    <p className="text-sm text-slate-500">
                        {t('rewardCalculator.description')}
                    </p>
                </div>
            </div>

            {/* Phase: Upload */}
            {(phase === 'upload' || phase === 'detecting') && (
                <div className="space-y-6">
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={() => phase === 'upload' && fileInputRef.current?.click()}
                        className={`
                            relative border-2 border-dashed rounded-2xl p-16 text-center transition-all duration-200
                            enterprise-shadow cursor-pointer
                            ${isDragActive
                                ? 'border-emerald-400 bg-emerald-50/50'
                                : phase === 'detecting'
                                    ? 'border-blue-300 bg-blue-50/30 cursor-wait'
                                    : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-emerald-50/20'
                            }
                        `}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".xlsx,.xls"
                            onChange={onFileInputChange}
                            disabled={phase === 'detecting'}
                        />

                        <div className="flex flex-col items-center gap-4">
                            <div
                                className={`p-4 rounded-2xl transition-colors ${phase === 'detecting'
                                    ? 'bg-blue-100 text-blue-600'
                                    : isDragActive
                                        ? 'bg-emerald-100 text-emerald-600'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}
                            >
                                {phase === 'detecting' ? (
                                    <Loader2 className="w-10 h-10 animate-spin" />
                                ) : (
                                    <Upload className="w-10 h-10" />
                                )}
                            </div>

                            <div>
                                <p className="text-lg font-semibold text-slate-700">
                                    {t('rewardCalculator.dropzoneLabel')}
                                </p>
                                <p className="text-sm text-slate-400 mt-1">
                                    {t('rewardCalculator.dropzoneSublabel')}
                                </p>
                                <a
                                    href="/samples/sample_reward_calculator.xlsx"
                                    download
                                    className="text-sm text-blue-500 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Stáhnout vzorový soubor
                                </a>
                            </div>

                            {phase === 'detecting' ? (
                                <p className="text-sm text-blue-600 font-medium">
                                    {t('rewardCalculator.processing')}
                                </p>
                            ) : (
                                <p className="text-xs text-slate-400">
                                    {t('rewardCalculator.dragAndDrop')}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Phase: Manual Column Mapping */}
            {phase === 'manual-select' && workbook && (
                <div className="space-y-5 animate-[slide-up_0.3s_ease-out]">

                    {/* elegant info banner – no harsh error */}
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4">
                        <div className="p-2 bg-amber-100 rounded-lg flex-shrink-0">
                            <SlidersHorizontal className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-amber-800">
                                Systém potřebuje upřesnit sloupce
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                Automatická detekce nebyla přesvědčivá. Vyberte prosím správné listy a přiřaďte sloupce ručně – výpočet pak proběhne přesně.
                            </p>
                        </div>
                    </div>

                    {/* Inline calc error (only when user already clicked Přepočítat) */}
                    {calcError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-xs text-red-700">{calcError}</p>
                        </div>
                    )}

                    <div className="bg-white rounded-xl p-6 enterprise-shadow space-y-6">

                        {/* ── Sheet selection ── */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* Tiers sheet */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    {t('rewardCalculator.selectTiersSheet')}
                                </label>
                                <div className="relative">
                                    <select
                                        value={manualTiersIdx}
                                        onChange={(e) => {
                                            setManualTiersIdx(Number(e.target.value));
                                            setColumnMapping((prev) => ({ ...prev, lowerBoundCol: undefined, rateCol: undefined }));
                                        }}
                                        className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    >
                                        {workbook.sheets.map((sheet, idx) => (
                                            <option key={idx} value={idx}>
                                                {sheet.name} ({sheet.rows.length} {t('invoiceAuditor.rows')})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Data sheet */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    {t('rewardCalculator.selectDataSheet')}
                                </label>
                                <div className="relative">
                                    <select
                                        value={manualDataIdx}
                                        onChange={(e) => {
                                            setManualDataIdx(Number(e.target.value));
                                            setColumnMapping((prev) => ({ ...prev, nameCol: undefined, countCol: undefined }));
                                        }}
                                        className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                                    >
                                        {workbook.sheets.map((sheet, idx) => (
                                            <option key={idx} value={idx}>
                                                {sheet.name} ({sheet.rows.length} {t('invoiceAuditor.rows')})
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* ── Column mapping ── */}
                        <div className="border-t border-slate-100 pt-5">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
                                Přiřazení sloupců
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                                {/* Data sheet columns */}
                                <ColumnDropdown
                                    label="Kde je jméno / kurýr?"
                                    value={columnMapping.nameCol ?? ''}
                                    options={dataHeaders}
                                    onChange={(v) => setMap('nameCol', v)}
                                    hint="List s kurýry / řidiči"
                                />
                                <ColumnDropdown
                                    label="Kde je počet zásilek?"
                                    value={columnMapping.countCol ?? ''}
                                    options={dataHeaders}
                                    onChange={(v) => setMap('countCol', v)}
                                    hint="List s kurýry / řidiči"
                                />

                                {/* Tiers sheet columns */}
                                <ColumnDropdown
                                    label="Kde je spodní hranice (od)?"
                                    value={columnMapping.lowerBoundCol ?? ''}
                                    options={tiersHeaders}
                                    onChange={(v) => setMap('lowerBoundCol', v)}
                                    hint="List se sazbami"
                                />
                                <ColumnDropdown
                                    label="Kde je sazba / odměna?"
                                    value={columnMapping.rateCol ?? ''}
                                    options={tiersHeaders}
                                    onChange={(v) => setMap('rateCol', v)}
                                    hint="List se sazbami"
                                />
                            </div>
                        </div>

                        {/* ── Action buttons ── */}
                        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
                            <button
                                onClick={handleManualConfirm}
                                disabled={manualTiersIdx === manualDataIdx}
                                className={`
                                    flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                                    ${manualTiersIdx !== manualDataIdx
                                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:-translate-y-0.5'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    }
                                `}
                            >
                                <Calculator className="w-4 h-4" />
                                Přepočítat
                            </button>

                            <button
                                onClick={handleReset}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                {t('rewardCalculator.newCalculation')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Phase: Results */}
            {phase === 'results' && result && (
                <ResultsView
                    result={result}
                    fmtCurrency={fmtCurrency}
                    onDownload={handleDownload}
                    onReset={handleReset}
                    onChangeMapping={() => {
                        // Return to the manual-select panel so the user can fix column mapping
                        setColumnMapping({});
                        setPhase('manual-select');
                    }}
                    t={t}
                />
            )}
        </div>
    );
};

// ── Column Dropdown helper component ──────────

const ColumnDropdown: React.FC<{
    label: string;
    hint: string;
    value: string;
    options: string[];
    onChange: (val: string) => void;
}> = ({ label, hint, value, options, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <p className="text-[11px] text-slate-400 mb-1.5">{hint}</p>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-lg border border-slate-300 bg-white text-sm text-slate-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            >
                <option value="">— automaticky —</option>
                {options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>
    </div>
);

// ── Results View ──────────────────────────────

const ResultsView: React.FC<{
    result: RewardResult;
    fmtCurrency: (n: number) => string;
    onDownload: () => void;
    onReset: () => void;
    /** Opens the manual column-mapping screen so the user can fix detection errors */
    onChangeMapping: () => void;
    t: (key: string) => string;
}> = ({ result, fmtCurrency, onDownload, onReset, onChangeMapping, t }) => {
    const totalShipments = result.drivers.reduce((sum, d) => sum + d.shipments, 0);

    return (
        <div className="space-y-6 animate-[slide-up_0.4s_ease-out]">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 enterprise-shadow border-l-4 border-l-emerald-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                                {t('rewardCalculator.driversProcessed')}
                            </p>
                            <p className="text-2xl font-bold text-slate-800">{result.drivers.length}</p>
                        </div>
                        <div className="text-slate-300">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 enterprise-shadow border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                                {t('rewardCalculator.colShipments')}
                            </p>
                            <p className="text-2xl font-bold text-slate-800">
                                {totalShipments.toLocaleString('cs-CZ')}
                            </p>
                        </div>
                        <div className="text-slate-300">
                            <FileSpreadsheet className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-5 enterprise-shadow border-l-4 border-l-amber-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                                {t('rewardCalculator.totalReward')}
                            </p>
                            <p className="text-2xl font-bold text-slate-800">
                                {fmtCurrency(result.totalReward)} {t('rewardCalculator.currency')}
                            </p>
                        </div>
                        <div className="text-slate-300">
                            <Coins className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Detection Info */}
            <div className="flex items-center gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('rewardCalculator.detectedTiers')}: <strong className="text-slate-600">{result.tiersSheetName}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('rewardCalculator.detectedData')}: <strong className="text-slate-600">{result.dataSheetName}</strong></span>
                </div>
            </div>

            {/* Results Table */}
            <div className="bg-white rounded-xl enterprise-shadow overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-700">
                        {t('rewardCalculator.resultTitle')}
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* FIX: button to re-open column mapping so users can correct bad auto-detection */}
                        <button
                            onClick={onChangeMapping}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-all"
                            title="Změnit mapování sloupců"
                        >
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Změnit mapování
                        </button>
                        <button
                            onClick={onDownload}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:shadow-lg transition-all"
                        >
                            <Download className="w-3.5 h-3.5" />
                            {t('rewardCalculator.downloadButton')}
                        </button>
                        <button
                            onClick={onReset}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            {t('rewardCalculator.newCalculation')}
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">
                                    #
                                </th>
                                <th className="px-5 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('rewardCalculator.colName')}
                                </th>
                                <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('rewardCalculator.colShipments')}
                                </th>
                                <th className="px-5 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('rewardCalculator.colReward')} ({t('rewardCalculator.currency')})
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.drivers.map((driver, idx) => (
                                <tr
                                    key={idx}
                                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} hover:bg-slate-100/60 transition-colors`}
                                >
                                    <td className="px-5 py-2.5 text-xs text-slate-400 font-mono">
                                        {idx + 1}
                                    </td>
                                    <td className="px-5 py-2.5 text-sm font-medium text-slate-700">
                                        {driver.name}
                                    </td>
                                    <td className="px-5 py-2.5 text-sm font-mono text-right text-slate-600">
                                        {driver.shipments.toLocaleString('cs-CZ')}
                                    </td>
                                    <td className="px-5 py-2.5 text-sm font-mono text-right font-semibold text-emerald-700">
                                        {fmtCurrency(driver.reward)}
                                    </td>
                                </tr>
                            ))}

                            {/* Total Row */}
                            <tr className="bg-slate-800 text-white">
                                <td className="px-5 py-3" />
                                <td className="px-5 py-3 text-sm font-bold">
                                    {t('rewardCalculator.rowTotal')}
                                </td>
                                <td className="px-5 py-3 text-sm font-mono text-right font-bold">
                                    {result.drivers
                                        .reduce((sum, d) => sum + d.shipments, 0)
                                        .toLocaleString('cs-CZ')}
                                </td>
                                <td className="px-5 py-3 text-sm font-mono text-right font-bold text-emerald-300">
                                    {fmtCurrency(result.totalReward)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Tier Reference Table */}
            <div className="bg-white rounded-xl enterprise-shadow overflow-hidden">
                <div className="px-5 py-3 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-700">
                        {t('rewardCalculator.tiersUsed')}
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-5 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">
                                    #
                                </th>
                                <th className="px-5 py-2.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('rewardCalculator.tierFrom')}
                                </th>
                                <th className="px-5 py-2.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('rewardCalculator.tierTo')}
                                </th>
                                <th className="px-5 py-2.5 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('rewardCalculator.tierRate')} ({t('rewardCalculator.currency')})
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.tiers.map((tier, idx) => (
                                <tr
                                    key={idx}
                                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                                >
                                    <td className="px-5 py-2 text-xs text-slate-400 font-mono">
                                        {idx + 1}
                                    </td>
                                    <td className="px-5 py-2 text-sm font-mono text-right text-slate-600">
                                        {tier.from}
                                    </td>
                                    <td className="px-5 py-2 text-sm font-mono text-right text-slate-600">
                                        {tier.to !== null ? tier.to : t('rewardCalculator.tierInfinity')}
                                    </td>
                                    <td className="px-5 py-2 text-sm font-mono text-right font-semibold text-slate-700">
                                        {fmtCurrency(tier.rate)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
