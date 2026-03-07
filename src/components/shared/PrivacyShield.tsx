/* ============================================
   LogiCore AI – Status Badges (Header)
   Replaced false compliance claims with
   verified-only indicators.
   ============================================ */

import React from 'react';
import { Lock, Tag } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const PrivacyShield: React.FC = () => {
    const { t } = useLanguage();

    return (
        <div className="flex items-center gap-3">
            {/* Version badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-500/30 bg-slate-500/8 select-none">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
                    v0.2.0-beta
                </span>
            </div>

            {/* HTTPS badge — Vercel provides this automatically */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-400/30 bg-blue-500/8 select-none">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold tracking-wide text-blue-400 uppercase">
                    {t('header.httpsEncrypted')}
                </span>
            </div>
        </div>
    );
};
