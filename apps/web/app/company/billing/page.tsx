'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BalanceCard } from '@/components/billing/BalanceCard';
import { PricingCard } from '@/components/billing/PricingCard';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/api';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

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
    const [transactions, setTransactions] = useState([]);
    const [company, setCompany] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        fetchCompanyData();
        fetchTransactions();
    }, []);

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/payments/history');
            setTransactions(response.data);
        } catch (error) {
            console.error('Failed to fetch transactions', error);
        }
    };

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
        <div className="space-y-8 p-8 max-w-7xl mx-auto">
            <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
                className="text-slate-400 hover:text-white pl-0"
            >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Button>

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

            {/* Transaction History */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">Transaction History</h2>
                <div className="rounded-md border border-slate-700 bg-slate-800/30 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-800/50">
                            <TableRow className="border-slate-700 hover:bg-transparent">
                                <TableHead className="text-slate-300">Date</TableHead>
                                <TableHead className="text-slate-300">Description</TableHead>
                                <TableHead className="text-slate-300">Amount</TableHead>
                                <TableHead className="text-slate-300">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.length === 0 ? (
                                <TableRow className="border-slate-700 hover:bg-transparent">
                                    <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                                        No purchase history found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.map((tx: any) => (
                                    <TableRow key={tx.id} className="border-slate-700 hover:bg-slate-800/50">
                                        <TableCell className="text-slate-300">
                                            {new Date(tx.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-slate-300 font-medium">
                                            {tx.description}
                                        </TableCell>
                                        <TableCell className="text-slate-300">
                                            {tx.currency} {tx.amount.toFixed(2)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={tx.status === 'COMPLETED' ? 'default' : 'secondary'}
                                                className={tx.status === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : ''}
                                            >
                                                {tx.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
