/* ============================================
   LogiCore AI – File Dropzone Component
   Drag-and-drop Excel file upload
   ============================================ */

import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface FileDropzoneProps {
    label: string;
    sublabel?: string;
    onFileAccepted: (file: File) => void;
    status: 'idle' | 'uploading' | 'parsing' | 'ready' | 'error';
    fileName?: string;
    error?: string;
    disabled?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
    label,
    sublabel,
    onFileAccepted,
    status,
    fileName,
    error,
    disabled = false,
}) => {
    const { t } = useLanguage();
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isProcessing = status === 'uploading' || status === 'parsing';
    const isReady = status === 'ready';
    const isError = status === 'error';

    const onDragOver = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (!disabled && !isProcessing) setIsDragActive(true);
        },
        [disabled, isProcessing]
    );

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    }, []);

    const handleFile = useCallback(
        (file: File) => {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                onFileAccepted(file);
            }
        },
        [onFileAccepted]
    );

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragActive(false);
            if (disabled || isProcessing) return;
            const files = Array.from(e.dataTransfer.files);
            if (files[0]) handleFile(files[0]);
        },
        [disabled, isProcessing, handleFile]
    );

    const onFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files?.[0]) handleFile(files[0]);
            // Reset input so same file can be re-selected
            e.target.value = '';
        },
        [handleFile]
    );

    const getBorderColor = () => {
        if (isDragActive) return 'border-blue-400 bg-blue-50/50';
        if (isReady) return 'border-emerald-300 bg-emerald-50/30';
        if (isError) return 'border-red-300 bg-red-50/30';
        return 'border-slate-200 hover:border-slate-300 bg-white';
    };

    return (
        <div
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => !disabled && !isProcessing && fileInputRef.current?.click()}
            className={`
        relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer
        enterprise-shadow
        ${getBorderColor()}
        ${disabled || isProcessing ? 'opacity-60 cursor-not-allowed' : ''}
      `}
        >
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx,.xls"
                onChange={onFileInputChange}
                disabled={disabled || isProcessing}
            />

            <div className="flex flex-col items-center gap-3">
                {/* Icon */}
                <div
                    className={`p-3 rounded-xl transition-colors ${isReady
                            ? 'bg-emerald-100 text-emerald-600'
                            : isError
                                ? 'bg-red-100 text-red-600'
                                : 'bg-slate-100 text-slate-500'
                        }`}
                >
                    {isProcessing ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                    ) : isReady ? (
                        <CheckCircle2 className="w-6 h-6" />
                    ) : isError ? (
                        <AlertCircle className="w-6 h-6" />
                    ) : (
                        <Upload className="w-6 h-6" />
                    )}
                </div>

                {/* Labels */}
                <div>
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    {sublabel && (
                        <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
                    )}
                </div>

                {/* Status */}
                {isProcessing && (
                    <p className="text-xs text-blue-600 font-medium">{t('invoiceAuditor.processing')}</p>
                )}
                {isReady && fileName && (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span className="max-w-[200px] truncate">{fileName}</span>
                    </div>
                )}
                {isError && error && (
                    <p className="text-xs text-red-600 font-medium">{error}</p>
                )}
                {!isProcessing && !isReady && !isError && (
                    <p className="text-xs text-slate-400">
                        {t('invoiceAuditor.dragAndDrop')}
                    </p>
                )}
            </div>
        </div>
    );
};
