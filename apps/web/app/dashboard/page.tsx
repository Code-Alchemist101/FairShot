'use client';

import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { StudentView } from '@/components/dashboard/StudentView';
import { CompanyView } from '@/components/dashboard/CompanyView';

import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const { user, logout } = useAuth();

    if (!user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="border-b bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">FairShot</h1>
                        <p className="text-sm text-muted-foreground">
                            Welcome, {user?.student?.fullName || user?.company?.companyName || user?.email}!
                        </p>
                    </div>
                    <Button onClick={() => { logout(); window.location.href = '/login'; }} variant="outline">
                        Logout
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 py-8">
                {user?.role === 'COMPANY' ? <CompanyView /> : <StudentView />}
            </div>
        </div>
    );
}
