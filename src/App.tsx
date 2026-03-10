/* ============================================
   LogiCore AI – Application Root
   ============================================ */

import React from 'react';
import { Header } from '@/components/shared/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { InvoiceAuditor } from '@/agents/invoice-auditor/InvoiceAuditor';
import { RewardCalculator } from '@/agents/reward-calculator/RewardCalculator';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/context/LanguageContext';

const App: React.FC = () => {
    const { t } = useLanguage();
    const currentView = useAppStore((s) => s.currentView);

    const renderView = () => {
        switch (currentView) {
            case 'reward-calculator':
                return <RewardCalculator />;
            case 'invoice-auditor':
                return <InvoiceAuditor />;
            case 'data-prepper':
            case 'rate-normalizer':
            case 'ad-hoc-analyst':
                return (
                    <div className="max-w-screen-xl mx-auto px-6 py-20 text-center">
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 inline-block">
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">{t('agents.underConstruction')}</h3>
                            <p className="text-slate-500 text-sm">
                                {t('agents.underConstructionDesc')}
                            </p>
                        </div>
                    </div>
                );
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main>{renderView()}</main>
        </div>
    );
};

export default App;