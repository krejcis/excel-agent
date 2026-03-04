/* ============================================
   LogiCore AI – Zustand Application Store
   ============================================ */

import { create } from 'zustand';
import type { AppView, FileUploadState, ProcessingState, AuditReport } from '@/types';

interface AppStore {
    // Navigation
    currentView: AppView;
    setView: (view: AppView) => void;

    // Invoice Auditor State
    quoteFile: FileUploadState;
    invoiceFile: FileUploadState;
    setQuoteFile: (state: Partial<FileUploadState>) => void;
    setInvoiceFile: (state: Partial<FileUploadState>) => void;

    // Processing
    processing: ProcessingState;
    setProcessing: (state: Partial<ProcessingState>) => void;

    // Results
    auditReport: AuditReport | null;
    setAuditReport: (report: AuditReport | null) => void;

    // Reset
    resetAuditor: () => void;
}

const initialFileState: FileUploadState = {
    file: null,
    parsed: null,
    status: 'idle',
};

const initialProcessingState: ProcessingState = {
    status: 'idle',
    progress: 0,
};

export const useAppStore = create<AppStore>((set) => ({
    // Navigation
    currentView: 'dashboard',
    setView: (view) => set({ currentView: view }),

    // Files
    quoteFile: { ...initialFileState },
    invoiceFile: { ...initialFileState },
    setQuoteFile: (state) =>
        set((prev) => ({ quoteFile: { ...prev.quoteFile, ...state } })),
    setInvoiceFile: (state) =>
        set((prev) => ({ invoiceFile: { ...prev.invoiceFile, ...state } })),

    // Processing
    processing: { ...initialProcessingState },
    setProcessing: (state) =>
        set((prev) => ({ processing: { ...prev.processing, ...state } })),

    // Results
    auditReport: null,
    setAuditReport: (report) => set({ auditReport: report }),

    // Reset
    resetAuditor: () =>
        set({
            quoteFile: { ...initialFileState },
            invoiceFile: { ...initialFileState },
            processing: { ...initialProcessingState },
            auditReport: null,
        }),
}));
