/* ============================================
   LogiCore AI – Application Root (Secured)
   ============================================ */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from '@/components/shared/Header';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { InvoiceAuditor } from '@/agents/invoice-auditor/InvoiceAuditor';
import { useAppStore } from '@/store/appStore';

const ACCESS_CODE = import.meta.env.VITE_ACCESS_CODE as string | undefined;
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const App: React.FC = () => {
    // --- SECURITY GATE LOGIC START ---
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [error, setError] = useState('');
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [lockoutEnd, setLockoutEnd] = useState<number | null>(null);
    const [lockoutRemaining, setLockoutRemaining] = useState(0);
    const lockoutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 1. Check session on load
    useEffect(() => {
        const sessionAuth = sessionStorage.getItem('logicore_auth');
        if (sessionAuth === 'true') {
            setIsAuthenticated(true);
        }
    }, []);

    // 2. Countdown timer for lockout
    useEffect(() => {
        if (lockoutEnd === null) {
            setLockoutRemaining(0);
            return;
        }

        const tick = () => {
            const remaining = lockoutEnd - Date.now();
            if (remaining <= 0) {
                setLockoutEnd(null);
                setLockoutRemaining(0);
                setFailedAttempts(0);
                setError('');
                if (lockoutTimerRef.current) {
                    clearInterval(lockoutTimerRef.current);
                    lockoutTimerRef.current = null;
                }
            } else {
                setLockoutRemaining(remaining);
            }
        };

        tick();
        lockoutTimerRef.current = setInterval(tick, 1000);

        return () => {
            if (lockoutTimerRef.current) {
                clearInterval(lockoutTimerRef.current);
                lockoutTimerRef.current = null;
            }
        };
    }, [lockoutEnd]);

    // 3. Login Handler
    const handleLogin = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();

            // Block if locked out
            if (lockoutEnd !== null && Date.now() < lockoutEnd) {
                return;
            }

            // Check against env var
            if (ACCESS_CODE && passwordInput === ACCESS_CODE) {
                sessionStorage.setItem('logicore_auth', 'true');
                setIsAuthenticated(true);
                setError('');
                setFailedAttempts(0);
                setLockoutEnd(null);
            } else {
                const newAttempts = failedAttempts + 1;
                setFailedAttempts(newAttempts);
                setPasswordInput('');

                if (newAttempts >= MAX_ATTEMPTS) {
                    setLockoutEnd(Date.now() + LOCKOUT_DURATION_MS);
                    setError(
                        `Too many failed attempts. Input disabled for 5 minutes.`
                    );
                } else {
                    setError(
                        `Invalid Access Code (${newAttempts}/${MAX_ATTEMPTS} attempts)`
                    );
                }
            }
        },
        [passwordInput, failedAttempts, lockoutEnd]
    );
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

    const isLockedOut = lockoutEnd !== null && Date.now() < lockoutEnd;

    const formatCountdown = (ms: number): string => {
        const totalSeconds = Math.ceil(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    // 4. RENDER: If not authenticated, show Login Screen
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
                {/* Dev mode warning banner */}
                {!ACCESS_CODE && (
                    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-amber-950 text-center py-2 px-4 text-sm font-semibold z-50">
                        ⚠ Development mode – set VITE_ACCESS_CODE in env
                    </div>
                )}

                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
                    <div className="bg-blue-600 p-6 text-center">
                        <h1 className="text-2xl font-bold text-white tracking-wide">LogiCore AI</h1>
                        <p className="text-blue-100 text-sm mt-1">Enterprise Logistics Operations</p>
                    </div>

                    <div className="p-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="access-code-input"
                                    className="block text-sm font-medium text-slate-700 mb-2"
                                >
                                    Secure Access Code
                                </label>
                                <input
                                    id="access-code-input"
                                    type="password"
                                    value={passwordInput}
                                    onChange={(e) => setPasswordInput(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Enter access code..."
                                    autoFocus
                                    disabled={isLockedOut}
                                />
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm font-medium text-center bg-red-50 p-2 rounded">
                                    <p>{error}</p>
                                    {isLockedOut && lockoutRemaining > 0 && (
                                        <p className="text-xs mt-1 font-mono">
                                            Retry in {formatCountdown(lockoutRemaining)}
                                        </p>
                                    )}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLockedOut}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Verify Identity
                            </button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                            <p className="text-xs text-slate-400">
                                Protected System. Authorized Personnel Only.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 5. RENDER: If authenticated, show application
    return (
        <div className="min-h-screen bg-slate-50">
            <Header />
            <main>{renderView()}</main>
        </div>
    );
};

export default App;