'use client';

import { useState, useEffect } from 'react';
import { BalanceCard } from '@/components/billing/BalanceCard';
import { PricingCard } from '@/components/billing/PricingCard';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

const PRICING_PACKAGES = [
    {
        id: 'STARTER',
        title: 'Starter Pack',
        price: 50,
        credits: 10,
        features: [
            'Post up to 10 job listings',
            'Basic applicant screening',
            'Email support',
            'Verified company badge',
        ],
        isPopular: false,
    },
    {
        id: 'PRO',
        title: 'Pro Pack',
        price: 200,
        credits: 50,
        features: [
            'Post up to 50 job listings',
            'Advanced AI screening',
            'Priority support',
            'Featured job listings',
            'Analytics dashboard',
        ],
        isPopular: true,
    },
];

export default function BillingPage() {
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchCompanyData();
    }, []);

    const fetchCompanyData = async () => {
        try {
            // Fetch user data which includes company info
            const response = await api.get('/users/me');
            setCompany(response.data.company);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to fetch company data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (packageId: string) => {
        setPurchaseLoading(packageId);
        try {
            const response = await api.post('/payments/create-session', { packageId });

            // Redirect to Stripe checkout
            window.location.href = response.data.url;
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create checkout session',
                variant: 'destructive',
            });
            setPurchaseLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">Billing & Credits</h1>
                <p className="text-slate-400">
                    Manage your credits and purchase more to post job listings
                </p>
            </div>

            {/* Balance Card */}
            <BalanceCard balance={company?.creditsBalance || 0} />

            {/* Pricing Section */}
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Purchase More Credits</h2>
                    <p className="text-slate-400">
                        Choose a package that fits your hiring needs
                    </p>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl">
                    {PRICING_PACKAGES.map((pkg) => (
                        <PricingCard
                            key={pkg.id}
                            title={pkg.title}
                            price={pkg.price}
                            credits={pkg.credits}
                            features={pkg.features}
                            isPopular={pkg.isPopular}
                            onBuy={() => handleBuy(pkg.id)}
                            loading={purchaseLoading === pkg.id}
                        />
                    ))}
                </div>
            </div>

            {/* Transaction History Placeholder */}
            <div className="mt-12 p-8 rounded-2xl border border-slate-700 bg-slate-800/30">
                <h3 className="text-xl font-semibold text-white mb-2">Transaction History</h3>
                <p className="text-slate-400 text-sm">
                    Your payment history will appear here. Coming soon!
                </p>
            </div>
        </div>
    );
}
