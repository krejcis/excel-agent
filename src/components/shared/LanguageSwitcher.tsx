/* ============================================
   LogiCore AI – Language Switcher
   Toggle between CS and DE languages.
   Designed to sit in the header alongside badges.
   ============================================ */

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { Language } from '@/translations';

const LANGUAGES: { code: Language; label: string }[] = [
    { code: 'cs', label: 'CS' },
    { code: 'de', label: 'DE' },
];

export const LanguageSwitcher: React.FC = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-0.5 rounded-full border border-slate-500/30 bg-slate-500/8 overflow-hidden select-none">
            {LANGUAGES.map((lang) => {
                const isActive = language === lang.code;
                return (
                    <button
                        key={lang.code}
                        onClick={() => setLanguage(lang.code)}
                        className={`
                            px-2.5 py-1.5 text-xs tracking-wide uppercase transition-all duration-200
                            ${isActive
                                ? 'font-bold text-white bg-blue-600/70'
                                : 'font-semibold text-slate-400 hover:text-slate-200'
                            }
                        `}
                    >
                        {lang.label}
                    </button>
                );
            })}
        </div>
    );
};
