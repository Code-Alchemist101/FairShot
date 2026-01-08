'use client';

import { CreditCard } from 'lucide-react';

interface BalanceCardProps {
    balance: number;
    loading?: boolean;
}

export function BalanceCard({ balance, loading = false }: BalanceCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-cyan-500/20 p-8 backdrop-blur-sm">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 blur-3xl" />

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
                        <CreditCard className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-300">Your Credit Balance</h3>
                </div>

                {loading ? (
                    <div className="animate-pulse">
                        <div className="h-16 w-32 bg-slate-700 rounded-lg" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            {balance}
                        </div>
                        <p className="text-slate-400 text-sm">Credits Available</p>
                    </div>
                )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
    );
}
