'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CompanyTable } from '@/components/admin/CompanyTable';
import { RejectDialog } from '@/components/admin/RejectDialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

interface Company {
    id: string;
    name: string;
    website: string | null;
    verificationStatus: VerificationStatus;
    rejectionReason: string | null;
    createdAt: string;
    user: {
        email: string;
    };
}

export default function AdminCompaniesPage() {
    const [activeTab, setActiveTab] = useState<VerificationStatus>('PENDING');
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState<{ id: string; name: string } | null>(null);
    const { toast } = useToast();

    const fetchCompanies = async (status: VerificationStatus) => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/companies?status=${status}`);
            setCompanies(response.data);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to fetch companies',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies(activeTab);
    }, [activeTab]);

    const handleApprove = async (id: string, name: string) => {
        setActionLoading(true);
        try {
            await api.patch(`/admin/companies/${id}/verify`);
            toast({
                title: 'Company Verified',
                description: `${name} has been successfully verified.`,
            });
            // Refresh the list
            fetchCompanies(activeTab);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to verify company',
                variant: 'destructive',
            });
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectClick = (id: string, name: string) => {
        setSelectedCompany({ id, name });
        setRejectDialogOpen(true);
    };

    const handleRejectConfirm = async (reason: string) => {
        if (!selectedCompany) return;

        setActionLoading(true);
        try {
            await api.patch(`/admin/companies/${selectedCompany.id}/reject`, { reason });
            toast({
                title: 'Company Rejected',
                description: `${selectedCompany.name} has been rejected.`,
            });
            setRejectDialogOpen(false);
            setSelectedCompany(null);
            // Refresh the list
            fetchCompanies(activeTab);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to reject company',
                variant: 'destructive',
            });
        } finally {
            setActionLoading(false);
        }
    };

    const getTabCount = (status: VerificationStatus) => {
        // This would ideally come from the stats endpoint
        return companies.filter(c => c.verificationStatus === status).length;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white">Verification Queue</h1>
                <p className="text-slate-400 mt-2">
                    Review and manage company verification requests
                </p>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as VerificationStatus)}>
                <TabsList className="bg-slate-800 border-slate-700">
                    <TabsTrigger value="PENDING" className="data-[state=active]:bg-slate-700">
                        Pending
                    </TabsTrigger>
                    <TabsTrigger value="VERIFIED" className="data-[state=active]:bg-slate-700">
                        Verified
                    </TabsTrigger>
                    <TabsTrigger value="REJECTED" className="data-[state=active]:bg-slate-700">
                        Rejected
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="PENDING" className="mt-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                        </div>
                    ) : (
                        <CompanyTable
                            companies={companies}
                            onApprove={handleApprove}
                            onReject={handleRejectClick}
                            loading={actionLoading}
                        />
                    )}
                </TabsContent>

                <TabsContent value="VERIFIED" className="mt-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                        </div>
                    ) : (
                        <CompanyTable
                            companies={companies}
                            onApprove={handleApprove}
                            onReject={handleRejectClick}
                            loading={actionLoading}
                        />
                    )}
                </TabsContent>

                <TabsContent value="REJECTED" className="mt-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                        </div>
                    ) : (
                        <CompanyTable
                            companies={companies}
                            onApprove={handleApprove}
                            onReject={handleRejectClick}
                            loading={actionLoading}
                        />
                    )}
                </TabsContent>
            </Tabs>

            {/* Reject Dialog */}
            <RejectDialog
                open={rejectDialogOpen}
                onOpenChange={setRejectDialogOpen}
                companyName={selectedCompany?.name || ''}
                onConfirm={handleRejectConfirm}
                loading={actionLoading}
            />
        </div>
    );
}
