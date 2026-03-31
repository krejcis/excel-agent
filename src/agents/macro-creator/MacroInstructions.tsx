/* ============================================
   LogiCore AI – Macro Instructions
   How-to guide for inserting generated macros
   into Excel (VBA) or Excel Online (Office Scripts).
   ============================================ */

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface MacroInstructionsProps {
    type: 'vba' | 'officescript';
}

// Inline keyboard shortcut badge
const Kbd: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <code className="inline-block px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-xs font-mono font-semibold">
        {children}
    </code>
);

export const MacroInstructions: React.FC<MacroInstructionsProps> = ({
    type,
}) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'withDev' | 'withoutDev'>(
        'withDev'
    );

    return (
        <div className="bg-white rounded-xl enterprise-shadow p-5">
            <div className="flex items-center gap-2 mb-4">
                <BookOpen className="w-4.5 h-4.5 text-violet-600" />
                <h3 className="text-sm font-bold text-slate-800">
                    {t('macroCreator.instructionsTitle')}
                </h3>
            </div>

            {type === 'vba' ? (
                <VbaInstructions
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    t={t}
                />
            ) : (
                <OfficeScriptInstructions t={t} />
            )}
        </div>
    );
};

// ── VBA Instructions (two tabs) ───────────────

const VbaInstructions: React.FC<{
    activeTab: 'withDev' | 'withoutDev';
    setActiveTab: (tab: 'withDev' | 'withoutDev') => void;
    t: (key: string) => string;
}> = ({ activeTab, setActiveTab, t }) => (
    <div>
        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 text-xs font-medium mb-4 w-fit">
            <button
                onClick={() => setActiveTab('withDev')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === 'withDev'
                        ? 'bg-white text-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                }`}
            >
                {t('macroCreator.instructions.vba.withDevTab')}
            </button>
            <button
                onClick={() => setActiveTab('withoutDev')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeTab === 'withoutDev'
                        ? 'bg-white text-slate-700 shadow-sm'
                        : 'text-slate-400 hover:text-slate-600'
                }`}
            >
                {t('macroCreator.instructions.vba.withoutDevTab')}
            </button>
        </div>

        {activeTab === 'withDev' ? (
            <VbaWithDevTab t={t} />
        ) : (
            <VbaWithoutDevTab t={t} />
        )}
    </div>
);

// Steps when user already has the Developer tab visible
const VbaWithDevTab: React.FC<{ t: (key: string) => string }> = ({ t }) => {
    const steps = t('macroCreator.instructions.vba.withDevSteps').split('|');
    return (
        <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
            {steps.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                    {renderStepWithKbd(step.trim())}
                </li>
            ))}
        </ol>
    );
};

// Steps to enable Developer tab + usage
const VbaWithoutDevTab: React.FC<{ t: (key: string) => string }> = ({ t }) => {
    const enableSteps = t('macroCreator.instructions.vba.enableDevTab').split(
        '|'
    );
    const altShortcut = t('macroCreator.instructions.vba.altShortcut');

    return (
        <div className="space-y-3 text-sm text-slate-600">
            <ol className="space-y-2 list-decimal list-inside">
                {enableSteps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                        {renderStepWithKbd(step.trim())}
                    </li>
                ))}
            </ol>
            <p className="text-slate-500 text-xs mt-2">
                {renderStepWithKbd(altShortcut)}
            </p>
        </div>
    );
};

// ── Office Script Instructions ────────────────

const OfficeScriptInstructions: React.FC<{ t: (key: string) => string }> = ({
    t,
}) => {
    const steps = t('macroCreator.instructions.officescript.steps').split('|');
    const note = t('macroCreator.instructions.officescript.note');

    return (
        <div className="space-y-3">
            <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
                {steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                        {renderStepWithKbd(step.trim())}
                    </li>
                ))}
            </ol>
            <div className="mt-3 p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700">
                {note}
            </div>
        </div>
    );
};

// ── Helpers ───────────────────────────────────

/**
 * Renders text, converting segments wrapped in backticks to <Kbd> badges.
 * E.g. "Press `Alt+F11` to open" → "Press <Kbd>Alt+F11</Kbd> to open"
 */
function renderStepWithKbd(text: string): React.ReactNode {
    const parts = text.split(/`([^`]+)`/);
    return parts.map((part, i) =>
        i % 2 === 1 ? <Kbd key={i}>{part}</Kbd> : <span key={i}>{part}</span>
    );
}
