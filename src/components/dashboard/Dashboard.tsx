/* ============================================
   LogiCore AI – Dashboard View
   Bento Grid of Agent Cards
   ============================================ */

import React from 'react';
import {
    Calculator,
    FileSearch,
    Database,
    Table,
    MessageSquareText,
    ArrowRight,
} from 'lucide-react';
import { AGENTS } from '@/config/agents';
import { useAppStore } from '@/store/appStore';
import { useLanguage } from '@/context/LanguageContext';
import type { AgentDefinition, AppView } from '@/types';

const iconMap: Record<string, React.ElementType> = {
    Calculator,
    FileSearch,
    Database,
    Table,
    MessageSquareText,
};

// Map agent IDs to their translation key prefix
const agentTranslationKeys: Record<string, string> = {
    'reward-calculator': 'agents.rewardCalculator',
    'invoice-auditor': 'agents.invoiceAuditor',
    'data-prepper': 'agents.dataPrepper',
    'rate-normalizer': 'agents.rateNormalizer',
    'ad-hoc-analyst': 'agents.adHocAnalyst',
};

const AgentCard: React.FC<{
    agent: AgentDefinition;
    onSelect: (id: AppView) => void;
    t: (key: string) => string;
}> = ({ agent, onSelect, t }) => {
    const Icon = iconMap[agent.icon] ?? FileSearch;
    const isAvailable = agent.status === 'available';
    const tKey = agentTranslationKeys[agent.id] ?? '';

    return (
        <button
            onClick={() => isAvailable && onSelect(agent.id)}
            disabled={!isAvailable}
            className={`
        group relative text-left w-full rounded-2xl p-6 transition-all duration-300
        enterprise-shadow
        ${isAvailable
                    ? 'bg-white hover:enterprise-shadow-lg hover:-translate-y-0.5 cursor-pointer'
                    : 'bg-white/60 cursor-default opacity-70'
                }
      `}
        >
            {/* Status Badge */}
            {agent.status === 'coming-soon' && (
                <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {t('agents.comingSoon')}
                    </span>
                </div>
            )}
            {agent.status === 'available' && (
                <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {t('agents.available')}
                    </span>
                </div>
            )}

            {/* Icon */}
            <div
                className={`
          w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300
          bg-gradient-to-br ${agent.color} shadow-lg
          ${isAvailable ? 'group-hover:scale-110' : ''}
        `}
            >
                <Icon className="w-6 h-6 text-white" />
            </div>

            {/* Content */}
            <h3 className="text-base font-bold text-slate-800 mb-0.5">{t(`${tKey}.name`)}</h3>
            <p className="text-xs font-medium text-slate-400 mb-2">{t(`${tKey}.subtitle`)}</p>
            <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-3">
                {t(`${tKey}.description`)}
            </p>

            {/* CTA */}
            {isAvailable && (
                <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:gap-2.5 transition-all">
                    <span>{t('agents.openAgent')}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </div>
            )}
        </button>
    );
};

export const Dashboard: React.FC = () => {
    const setView = useAppStore((s) => s.setView);
    const { t } = useLanguage();

    return (
        <div className="max-w-screen-xl mx-auto px-6 py-8 animate-[fade-in_0.5s_ease-out]">
            {/* Hero Section */}
            <div className="mb-10">
                <div className="flex items-start justify-between flex-wrap gap-4 mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {t('dashboard.title')}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1 max-w-xl">
                            {t('dashboard.subtitle')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Agent Grid (Bento) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                {AGENTS.map((agent) => (
                    <AgentCard
                        key={agent.id}
                        agent={agent}
                        onSelect={setView}
                        t={t}
                    />
                ))}
            </div>

            {/* Footer Note */}
            <div className="mt-10 text-center">
                <p className="text-xs text-slate-400">
                    {t('dashboard.footerNote')}
                </p>
            </div>
        </div>
    );
};
