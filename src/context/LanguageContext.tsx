/* ============================================
   LogiCore AI – Language Context (i18n)
   Custom implementation without external deps.
   Default language: 'de' (primary market: Austria)
   ============================================ */

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { translations, type Language, type TranslationMap } from '@/translations';

// ── Types ───────────────────────────────────

interface LanguageContextValue {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

// ── Context ─────────────────────────────────

const LanguageContext = createContext<LanguageContextValue | null>(null);

// ── Provider ────────────────────────────────

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('de');

    /**
     * Resolve a dot-notation key (e.g. 'login.title') against
     * the current language's translation map.
     * Returns the key itself as fallback if the path is not found.
     */
    const t = useCallback(
        (key: string): string => {
            const parts = key.split('.');
            let current: TranslationMap | string = translations[language];

            for (const part of parts) {
                if (typeof current === 'string') {
                    // Reached a string before resolving all key segments
                    return key;
                }
                const next: TranslationMap[string] | undefined = current[part];
                if (next === undefined) {
                    return key;
                }
                current = next;
            }

            return typeof current === 'string' ? current : key;
        },
        [language],
    );

    const value = useMemo<LanguageContextValue>(
        () => ({ language, setLanguage, t }),
        [language, t],
    );

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// ── Hook ────────────────────────────────────

export const useLanguage = (): LanguageContextValue => {
    const ctx = useContext(LanguageContext);
    if (ctx === null) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return ctx;
};
