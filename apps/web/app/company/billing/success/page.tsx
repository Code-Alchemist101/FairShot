'use client';

import { useEffect, useState, Suspense } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [creditsAdded, setCreditsAdded] = useState(0);

    useEffect(() => {
        const verifyPayment = async () => {
            const sessionId = searchParams.get('session_id');
            if (!sessionId) {
                setStatus('error');
                return;
            }

            try {
                const response = await api.get(`/payments/verify-session?sessionId=${sessionId}`);
                if (response.data.status === 'success') {
                    setCreditsAdded(response.data.credits);
                    setStatus('success');
                    toast({
                        title: 'Payment Verified',
                        description: `${response.data.credits} credits have been added to your account.`,
                    });
                } else {
                    setStatus('error'); // Or pending
                }
            } catch (error) {
                console.error('Verification failed:', error);
                setStatus('error');
            }
        };

        verifyPayment();
    }, [searchParams, toast]);

    if (status === 'verifying') {
        return (
            <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Verifying Payment...</h2>
                <p className="text-slate-400">Please wait while we confirm your transaction.</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="max-w-md w-full space-y-8 text-center">
                <div className="flex justify-center">
                    <AlertCircle className="w-20 h-20 text-red-500" />
                </div>
                <div className="space-y-4">
                    <h1 className="text-3xl font-bold text-white">Verification Failed</h1>
                    <p className="text-slate-400">
                        We couldn't verify your payment automatically. If you were charged, please contact support.
                    </p>
                </div>
                <Button onClick={() => router.push('/company/billing')} variant="outline" className="w-full">
                    Return to Billing
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-md w-full space-y-8 text-center">
            {/* Success Icon */}
            <div className="flex justify-center">
                <div className="relative">
                    <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full" />
                    <div className="relative bg-green-500/10 border border-green-500/20 rounded-full p-6">
                        <CheckCircle className="w-20 h-20 text-green-500" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
                <h1 className="text-4xl font-bold text-white">Payment Successful!</h1>
                <p className="text-slate-400 text-lg">
                    {creditsAdded > 0 ? `${creditsAdded} credits` : 'Credits'} have been added to your account.
                </p>
                <p className="text-slate-500 text-sm">
                    You can now use your credits to post job listings and find the best candidates.
                </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
                <Button
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-6 text-base font-semibold"
                >
                    Return to Dashboard
                </Button>
                <Button
                    onClick={() => router.push('/company/billing')}
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-800 py-6"
                >
                    View Billing
                </Button>
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-8">
            <Suspense fallback={<Loader2 className="w-8 h-8 animate-spin" />}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
