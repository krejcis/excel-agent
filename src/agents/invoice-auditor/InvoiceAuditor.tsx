/* ============================================
   LogiCore AI – Invoice Auditor Agent
   Full UI: Upload → Analyze → Variance Report
   ============================================ */

import React, { useCallback, useState } from 'react';
import {
    FileSearch,
    Play,
    RotateCcw,
    Download,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    CheckCircle2,
    CircleDot,
    Info,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { FileDropzone } from '@/components/shared/FileDropzone';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { parseExcelFile } from '@/utils/excelParser';
import { runInvoiceAudit } from '@/agents/invoice-auditor/invoiceAuditService';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/context/LanguageContext';
import type { AuditReport, VarianceItem } from '@/types';

// ── Variance Table ────────────────────────────

const VarianceRow: React.FC<{ item: VarianceItem; index: number; t: (key: string) => string }> = ({ item, index, t }) => {
    const [expanded, setExpanded] = useState(false);

    const getStatusIcon = () => {
        switch (item.status) {
            case 'match':
                return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'overage':
                return <TrendingUp className="w-4 h-4 text-red-500" />;
            case 'underage':
                return <TrendingDown className="w-4 h-4 text-blue-500" />;
            case 'unmatched-quote':
                return <AlertTriangle className="w-4 h-4 text-amber-500" />;
            case 'unmatched-invoice':
                return <AlertTriangle className="w-4 h-4 text-red-500" />;
        }
    };

    const getStatusBadge = () => {
        switch (item.status) {
            case 'match':
                return <StatusBadge variant="success" dot>{t('invoiceAuditor.statusMatch')}</StatusBadge>;
            case 'overage':
                return <StatusBadge variant="danger" dot>{t('invoiceAuditor.statusOverage')}</StatusBadge>;
            case 'underage':
                return <StatusBadge variant="info" dot>{t('invoiceAuditor.statusUnderage')}</StatusBadge>;
            case 'unmatched-quote':
                return <StatusBadge variant="warning" dot>{t('invoiceAuditor.statusQuoteOnly')}</StatusBadge>;
            case 'unmatched-invoice':
                return <StatusBadge variant="danger" dot>{t('invoiceAuditor.statusInvoiceOnly')}</StatusBadge>;
        }
    };

    const getRowBg = () => {
        if (item.status === 'unmatched-invoice') return 'bg-red-50/40';
        if (item.status === 'overage') return 'bg-red-50/20';
        if (item.status === 'unmatched-quote') return 'bg-amber-50/30';
        if (index % 2 === 0) return 'bg-white';
        return 'bg-slate-50/50';
    };

    const fmt = (n: number) =>
        n.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' });

    const fmtPct = (n: number) => {
        const sign = n > 0 ? '+' : '';
        return `${sign}${n.toFixed(1)}%`;
    };

    return (
        <>
            <tr
                className={`${getRowBg()} hover:bg-slate-100/60 transition-colors cursor-pointer`}
                onClick={() => setExpanded(!expanded)}
            >
                <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">{index + 1}</td>
                <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                        {getStatusIcon()}
                        {getStatusBadge()}
                    </div>
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-700 max-w-[200px] truncate" title={item.quoteDescription}>
                    {item.quoteDescription}
                </td>
                <td className="px-4 py-2.5 text-sm text-slate-700 max-w-[200px] truncate" title={item.invoiceDescription}>
                    {item.invoiceDescription}
                </td>
                <td className="px-4 py-2.5 text-sm font-mono text-right text-slate-600">
                    {fmt(item.quoteAmount)}
                </td>
                <td className="px-4 py-2.5 text-sm font-mono text-right text-slate-600">
                    {fmt(item.invoiceAmount)}
                </td>
                <td className={`px-4 py-2.5 text-sm font-mono text-right font-bold ${item.variance > 0 ? 'text-red-600' : item.variance < 0 ? 'text-blue-600' : 'text-slate-400'
                    }`}>
                    {item.variance !== 0 ? fmt(item.variance) : '—'}
                </td>
                <td className={`px-4 py-2.5 text-xs font-mono text-right ${item.variancePercent > 0 ? 'text-red-500' : item.variancePercent < 0 ? 'text-blue-500' : 'text-slate-400'
                    }`}>
                    {item.variancePercent !== 0 ? fmtPct(item.variancePercent) : '—'}
                </td>
                <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                        <div className="w-12 h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all ${item.matchConfidence >= 80
                                    ? 'bg-emerald-500'
                                    : item.matchConfidence >= 50
                                        ? 'bg-amber-500'
                                        : 'bg-red-500'
                                    }`}
                                style={{ width: `${item.matchConfidence}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-slate-400 w-8 text-right">{item.matchConfidence}%</span>
                    </div>
                </td>
                <td className="px-3 py-2.5 text-slate-400">
                    {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </td>
            </tr>
            {expanded && (
                <tr className={getRowBg()}>
                    <td colSpan={10} className="px-4 py-3 border-t border-slate-100">
                        <div className="flex items-start gap-6 text-xs text-slate-500">
                            {item.category && (
                                <div>
                                    <span className="font-semibold text-slate-600">{t('invoiceAuditor.thCategory')}:</span> {item.category}
                                </div>
                            )}
                            {item.notes && (
                                <div className="flex items-start gap-1.5 max-w-md">
                                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                                    <span>{item.notes}</span>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

// ── Summary Cards ─────────────────────────────

const SummaryCard: React.FC<{
    label: string;
    value: string;
    sublabel?: string;
    variant?: 'default' | 'danger' | 'success' | 'warning';
    icon?: React.ReactNode;
}> = ({ label, value, sublabel, variant = 'default', icon }) => {
    const borderColor =
        variant === 'danger'
            ? 'border-l-red-500'
            : variant === 'success'
                ? 'border-l-emerald-500'
                : variant === 'warning'
                    ? 'border-l-amber-500'
                    : 'border-l-blue-500';

    return (
        <div
            className={`bg-white rounded-xl p-4 enterprise-shadow border-l-4 ${borderColor}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                        {label}
                    </p>
                    <p className="text-xl font-bold text-slate-800">{value}</p>
                    {sublabel && (
                        <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
                    )}
                </div>
                {icon && (
                    <div className="text-slate-300">{icon}</div>
                )}
            </div>
        </div>
    );
};

// ── Risk Level Badge ──────────────────────────

const RiskBadge: React.FC<{ level: string; t: (key: string) => string }> = ({ level, t }) => {
    const config: Record<string, { variant: 'success' | 'warning' | 'danger' | 'info'; labelKey: string }> = {
        low: { variant: 'success', labelKey: 'invoiceAuditor.riskLow' },
        medium: { variant: 'warning', labelKey: 'invoiceAuditor.riskMedium' },
        high: { variant: 'danger', labelKey: 'invoiceAuditor.riskHigh' },
        critical: { variant: 'danger', labelKey: 'invoiceAuditor.riskCritical' },
    };
    const c = config[level] ?? config.low;
    return <StatusBadge variant={c.variant} dot>{t(c.labelKey)}</StatusBadge>;
};

// ── Progress Bar ──────────────────────────────

const ProgressBar: React.FC<{ progress: number; message?: string; t: (key: string) => string }> = ({
    progress,
    message,
    t,
}) => (
    <div className="bg-white rounded-xl p-6 enterprise-shadow animate-[slide-up_0.3s_ease-out]">
        <div className="flex items-center gap-3 mb-3">
            <div className="relative">
                <CircleDot className="w-5 h-5 text-blue-600 animate-spin" />
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-700">
                    {t('invoiceAuditor.aiAnalysis')}
                </p>
                {message && (
                    <p className="text-xs text-slate-400 mt-0.5">{message}</p>
                )}
            </div>
            <span className="ml-auto text-sm font-bold text-blue-600">{progress}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
            />
        </div>
    </div>
);

// ── Main Component ────────────────────────────

export const InvoiceAuditor: React.FC = () => {
    const { t } = useLanguage();
    const {
        quoteFile,
        invoiceFile,
        setQuoteFile,
        setInvoiceFile,
        processing,
        setProcessing,
        auditReport,
        setAuditReport,
        resetAuditor,
    } = useAppStore();

    const [filterStatus, setFilterStatus] = useState<string>('all');

    // Handle file uploads
    const handleQuoteFile = useCallback(
        async (file: File) => {
            setQuoteFile({ file, status: 'parsing' });
            try {
                const parsed = await parseExcelFile(file);
                setQuoteFile({ parsed, status: 'ready' });
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : t('invoiceAuditor.parseFailed');
                setQuoteFile({ status: 'error', error: msg });
            }
        },
        [setQuoteFile, t]
    );

    const handleInvoiceFile = useCallback(
        async (file: File) => {
            setInvoiceFile({ file, status: 'parsing' });
            try {
                const parsed = await parseExcelFile(file);
                setInvoiceFile({ parsed, status: 'ready' });
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : t('invoiceAuditor.parseFailed');
                setInvoiceFile({ status: 'error', error: msg });
            }
        },
        [setInvoiceFile, t]
    );

    // Run audit
    const handleRunAudit = useCallback(async () => {
        if (!quoteFile.parsed || !invoiceFile.parsed) return;

        const quoteRows = quoteFile.parsed.sheets[0]?.rows ?? [];
        const invoiceRows = invoiceFile.parsed.sheets[0]?.rows ?? [];

        setProcessing({ status: 'processing', progress: 0 });

        try {
            const report = await runInvoiceAudit(
                quoteRows,
                invoiceRows,
                quoteFile.parsed.fileName,
                invoiceFile.parsed.fileName,
                (progress, message) => setProcessing({ progress, message })
            );
            setAuditReport(report);
            setProcessing({ status: 'complete', progress: 100 });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : t('invoiceAuditor.analysisFailed');
            setProcessing({ status: 'error', error: msg });
        }
    }, [quoteFile, invoiceFile, setProcessing, setAuditReport, t]);

    // Export report
    const handleExport = useCallback(() => {
        if (!auditReport) return;
        const data = JSON.stringify(auditReport, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `variance-report-${auditReport.id}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }, [auditReport]);

    const canRunAudit =
        quoteFile.status === 'ready' &&
        invoiceFile.status === 'ready' &&
        processing.status !== 'processing';

    const fmt = (n: number) =>
        n.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' });

    // Filter items
    const filteredItems =
        auditReport?.lineItems.filter(
            (item) => filterStatus === 'all' || item.status === filterStatus
        ) ?? [];

    return (
        <div className="max-w-screen-xl mx-auto px-6 py-8 animate-[fade-in_0.5s_ease-out]">
            {/* Agent Header */}
            <div className="flex items-start gap-4 mb-8">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-900/20">
                    <FileSearch className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t('invoiceAuditor.title')}</h2>
                    <p className="text-sm text-slate-500">
                        {t('invoiceAuditor.description')}
                    </p>
                </div>
            </div>

            {/* Step 1: Upload Files */}
            {!auditReport && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <FileDropzone
                                label={t('invoiceAuditor.quoteLabel')}
                                sublabel={t('invoiceAuditor.quoteSublabel')}
                                onFileAccepted={handleQuoteFile}
                                status={quoteFile.status}
                                fileName={quoteFile.parsed?.fileName}
                                error={quoteFile.error}
                                disabled={processing.status === 'processing'}
                            />
                            <a
                                href="/samples/sample_invoice_auditor_quote.xlsx"
                                download
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Stáhnout vzorový soubor
                            </a>
                        </div>
                        <div>
                            <FileDropzone
                                label={t('invoiceAuditor.invoiceLabel')}
                                sublabel={t('invoiceAuditor.invoiceSublabel')}
                                onFileAccepted={handleInvoiceFile}
                                status={invoiceFile.status}
                                fileName={invoiceFile.parsed?.fileName}
                                error={invoiceFile.error}
                                disabled={processing.status === 'processing'}
                            />
                            <a
                                href="/samples/sample_invoice_auditor_invoice.xlsx"
                                download
                                className="text-sm text-blue-500 hover:underline"
                            >
                                Stáhnout vzorový soubor
                            </a>
                        </div>
                    </div>

                    {/* File Preview Stats */}
                    {(quoteFile.parsed || invoiceFile.parsed) && (
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                            {quoteFile.parsed && (
                                <span>
                                    {t('invoiceAuditor.quotePrefix')}: {quoteFile.parsed.sheets[0]?.rows.length ?? 0} {t('invoiceAuditor.rows')} •{' '}
                                    {quoteFile.parsed.sheets[0]?.headers.length ?? 0} {t('invoiceAuditor.columns')}
                                </span>
                            )}
                            {invoiceFile.parsed && (
                                <span>
                                    {t('invoiceAuditor.invoicePrefix')}: {invoiceFile.parsed.sheets[0]?.rows.length ?? 0} {t('invoiceAuditor.rows')} •{' '}
                                    {invoiceFile.parsed.sheets[0]?.headers.length ?? 0} {t('invoiceAuditor.columns')}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Processing Progress */}
                    {processing.status === 'processing' && (
                        <ProgressBar
                            progress={processing.progress}
                            message={processing.message}
                            t={t}
                        />
                    )}

                    {/* Error State */}
                    {processing.status === 'error' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-red-700">{t('invoiceAuditor.analysisFailed')}</p>
                                <p className="text-xs text-red-600 mt-0.5">{processing.error}</p>
                            </div>
                        </div>
                    )}

                    {/* Run Button */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRunAudit}
                            disabled={!canRunAudit}
                            className={`
                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                ${canRunAudit
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 hover:-translate-y-0.5'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }
              `}
                        >
                            <Play className="w-4 h-4" />
                            {t('invoiceAuditor.runAnalysis')}
                        </button>

                        {(quoteFile.status !== 'idle' || invoiceFile.status !== 'idle') && (
                            <button
                                onClick={resetAuditor}
                                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                {t('invoiceAuditor.reset')}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Results */}
            {auditReport && (
                <ReportView
                    report={auditReport}
                    filteredItems={filteredItems}
                    filterStatus={filterStatus}
                    setFilterStatus={setFilterStatus}
                    onExport={handleExport}
                    onReset={resetAuditor}
                    fmt={fmt}
                    t={t}
                />
            )}
        </div>
    );
};

// ── Report View ───────────────────────────────

const ReportView: React.FC<{
    report: AuditReport;
    filteredItems: VarianceItem[];
    filterStatus: string;
    setFilterStatus: (s: string) => void;
    onExport: () => void;
    onReset: () => void;
    fmt: (n: number) => string;
    t: (key: string) => string;
}> = ({ report, filteredItems, filterStatus, setFilterStatus, onExport, onReset, fmt, t }) => {
    return (
        <div className="space-y-6 animate-[slide-up_0.4s_ease-out]">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryCard
                    label={t('invoiceAuditor.totalQuote')}
                    value={fmt(report.totalQuoteAmount)}
                    sublabel={`${report.summary.totalItems} ${t('invoiceAuditor.lineItems')}`}
                    icon={<FileSearch className="w-5 h-5" />}
                />
                <SummaryCard
                    label={t('invoiceAuditor.totalInvoice')}
                    value={fmt(report.totalInvoiceAmount)}
                    sublabel={`${report.summary.matchedItems} ${t('invoiceAuditor.matched')}`}
                    icon={<FileSearch className="w-5 h-5" />}
                />
                <SummaryCard
                    label={t('invoiceAuditor.netVariance')}
                    value={fmt(report.totalVariance)}
                    sublabel={
                        report.totalQuoteAmount > 0
                            ? `${((report.totalVariance / report.totalQuoteAmount) * 100).toFixed(1)}% ${t('invoiceAuditor.deviation')}`
                            : undefined
                    }
                    variant={report.totalVariance > 0 ? 'danger' : report.totalVariance < 0 ? 'success' : 'default'}
                    icon={
                        report.totalVariance > 0 ? (
                            <TrendingUp className="w-5 h-5 text-red-400" />
                        ) : (
                            <TrendingDown className="w-5 h-5 text-emerald-400" />
                        )
                    }
                />
                <SummaryCard
                    label={t('invoiceAuditor.riskAssessment')}
                    value={report.summary.riskLevel.toUpperCase()}
                    sublabel={`${report.summary.unmatchedInvoiceItems} ${t('invoiceAuditor.unmatchedInvoiceItems')}`}
                    variant={
                        report.summary.riskLevel === 'critical' || report.summary.riskLevel === 'high'
                            ? 'danger'
                            : report.summary.riskLevel === 'medium'
                                ? 'warning'
                                : 'success'
                    }
                />
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <RiskBadge level={report.summary.riskLevel} t={t} />
                    <span className="text-xs text-slate-400">
                        {report.quoteFileName} vs {report.invoiceFileName}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Filter Tabs */}
                    <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium">
                        {[
                            { key: 'all', labelKey: 'invoiceAuditor.filterAll' },
                            { key: 'overage', labelKey: 'invoiceAuditor.filterOverages' },
                            { key: 'underage', labelKey: 'invoiceAuditor.filterUnderages' },
                            { key: 'unmatched-invoice', labelKey: 'invoiceAuditor.filterUnmatched' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilterStatus(tab.key)}
                                className={`px-3 py-1.5 rounded-md transition-colors ${filterStatus === tab.key
                                    ? 'bg-white text-slate-700 shadow-sm'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {t(tab.labelKey)}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={onExport}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors enterprise-shadow"
                    >
                        <Download className="w-3.5 h-3.5" />
                        {t('invoiceAuditor.exportJson')}
                    </button>

                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        {t('invoiceAuditor.newAudit')}
                    </button>
                </div>
            </div>

            {/* Variance Table */}
            <div className="bg-white rounded-xl enterprise-shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-10">
                                    #
                                </th>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider w-32">
                                    {t('invoiceAuditor.thStatus')}
                                </th>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('invoiceAuditor.thQuoteItem')}
                                </th>
                                <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('invoiceAuditor.thInvoiceItem')}
                                </th>
                                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('invoiceAuditor.thQuoteAmount')}
                                </th>
                                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('invoiceAuditor.thInvoiceAmount')}
                                </th>
                                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                    {t('invoiceAuditor.thVariance')}
                                </th>
                                <th className="px-4 py-3 text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider w-16">
                                    {t('invoiceAuditor.thVariancePercent')}
                                </th>
                                <th className="px-4 py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider w-28">
                                    {t('invoiceAuditor.thConfidence')}
                                </th>
                                <th className="w-8" />
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map((item, idx) => (
                                <VarianceRow key={item.id} item={item} index={idx} t={t} />
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredItems.length === 0 && (
                    <div className="text-center py-12 text-sm text-slate-400">
                        {t('invoiceAuditor.noItemsMatch')}
                    </div>
                )}
            </div>

            {/* Timestamp */}
            <p className="text-center text-[10px] text-slate-300 mt-4">
                {t('invoiceAuditor.analysisPerformed')} {new Date(report.timestamp).toLocaleString('de-AT')} •
                {t('invoiceAuditor.reportId')}: {report.id}
            </p>
        </div>
    );
};
