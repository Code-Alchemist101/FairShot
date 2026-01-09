'use client';

import { CreditCard } from 'lucide-react';

interface BalanceCardProps {
    balance: number;
    loading?: boolean;
}

export function BalanceCard({ balance, loading = false }: BalanceCardProps) {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-card border shadow-sm p-8">
            {/* Background Glow - simplified for cleaner look */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent blur-3xl opacity-50" />

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                        <CreditCard className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-muted-foreground">Your Credit Balance</h3>
                </div>

                {loading ? (
                    <div className="animate-pulse">
                        <div className="h-16 w-32 bg-muted rounded-lg" />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="text-6xl font-bold text-foreground">
                            {balance}
                        </div>
                        <p className="text-muted-foreground text-sm">Credits Available</p>
                    </div>
                )}
            </div>

            {/* Decorative Elements */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
    );
}
