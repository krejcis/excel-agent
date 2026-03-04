/* ============================================
   LogiCore AI – Application Root (Secured)
   ============================================ */

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/shared/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { InvoiceAuditor } from '@/agents/invoice-auditor/InvoiceAuditor';
import { useAppStore } from '@/store/appStore';

const App: React.FC = () => {
    // --- SECURITY GATE LOGIC START ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');

    // 1. Check session on load (aby nemusel zadávat heslo při refresh)
    useEffect(() => {
        const sessionAuth = sessionStorage.getItem('logicore_auth');
        if (sessionAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    // 2. Login Handler
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === 'LogiCore2026') {
            sessionStorage.setItem('logicore_auth', 'true');
            setIsAuthenticated(true);
            setError('');
        } else {
            setError('Invalid Access Code');
            setPasswordInput('');
        }
    };
    // --- SECURITY GATE LOGIC END ---

    const currentView = useAppStore((s) => s.currentView);

    const renderView = () => {
        switch (currentView) {
            case 'invoice-auditor':
                return <InvoiceAuditor />;
            case 'data-prepper':
            case 'rate-normalizer':
            case 'ad-hoc-analyst':
                return (
                    <div className="max-w-screen-xl mx-auto px-6 py-20 text-center">
                        <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 inline-block">
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Agent Under Construction</h3>
                            <p className="text-slate-500 text-sm">
                                This module is currently in development phase.
                            </p>
                        </div>
                    </div>
                );
            default:
                return <Dashboard />;
        }
    };

    // 3. RENDER: Pokud není přihlášen, ukaž Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-blue-600 p-6 text-center">
                        <h1 className="text-2xl font-bold text-white tracking-wide">LogiCore AI</h1>
                        <p className="text-blue-100 text-sm mt-1">Enterprise Logistics Operations</p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Secure Access Code
                                </label>
                                <input
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Enter access code..."
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                            >
                                Verify Identity
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400">
                                Protected System. Local Processing Mode Active.
                                <br />Authorized Personnel Only.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 4. RENDER: Pokud je přihlášen, ukaž aplikaci
    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main>{renderView()}</main>
        </div>
    );
};

export default App;