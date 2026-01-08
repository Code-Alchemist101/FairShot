'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function PaymentCancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <div className="max-w-md w-full space-y-8 text-center">
                {/* Warning Icon */}
                <div className="flex justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-3xl rounded-full" />
                        <div className="relative bg-yellow-500/10 border border-yellow-500/20 rounded-full p-6">
                            <AlertTriangle className="w-20 h-20 text-yellow-500" />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <h1 className="text-4xl font-bold text-white">Payment Cancelled</h1>
                    <p className="text-slate-400 text-lg">
                        Your payment was not completed.
                    </p>
                    <p className="text-slate-500 text-sm">
                        No charges were made to your account. You can try again whenever you're ready.
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    <button
                        onClick={() => router.push('/company/billing')}
                        className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white py-6 text-base font-semibold rounded-md transition-all duration-300"
                    >
                        Try Again
                    </button>
                    <Button
                        onClick={() => router.push('/dashboard')}
                        variant="outline"
                        className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 py-6"
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    );
}
