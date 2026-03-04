/* ============================================
   LogiCore AI – Application Header
   ============================================ */

import React from 'react';
import { Container, ArrowLeft } from 'lucide-react';
import { PrivacyShield } from './PrivacyShield';
import { useAppStore } from '@/store/appStore';
import type { AppView } from '@/types';

export const Header: React.FC = () => {
    const currentView = useAppStore((s) => s.currentView);
    const setView = useAppStore((s) => s.setView);

    const showBack = currentView !== 'dashboard';

    return (
        <header className="gradient-header border-b border-white/5">
            <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
                {/* Left: Logo & Nav */}
                <div className="flex items-center gap-4">
                    {showBack && (
                        <button
                            onClick={() => setView('dashboard' as AppView)}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm mr-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </button>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg shadow-blue-900/30">
                            <Container className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold text-white tracking-tight leading-none">
                                LogiCore AI
                            </h1>
                            <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                                Logistics Operations
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Privacy Shield */}
                <PrivacyShield />
            </div>
        </header>
    );
};
