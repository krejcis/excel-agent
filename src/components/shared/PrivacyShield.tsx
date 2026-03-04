/* ============================================
   LogiCore AI – Privacy Shield Badge
   Always-visible security status indicator
   ============================================ */

import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const PrivacyShield: React.FC = () => {
    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/8 select-none">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold tracking-wide text-emerald-400 uppercase">
                Secure Mode: Local Processing Only
            </span>
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
        </div>
    );
};
