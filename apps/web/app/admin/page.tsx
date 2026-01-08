'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Building, Users, Briefcase, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        pendingCompanies: 0,
        totalCompanies: 0,
        totalStudents: 0,
        totalJobs: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Pending Verifications',
            value: stats.pendingCompanies,
            icon: AlertCircle,
            color: 'from-yellow-400 to-orange-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
            textColor: 'text-yellow-400',
        },
        {
            title: 'Total Companies',
            value: stats.totalCompanies,
            icon: Building,
            color: 'from-blue-400 to-cyan-500',
            bgColor: 'bg-cyan-500/10',
            borderColor: 'border-cyan-500/20',
            textColor: 'text-cyan-400',
        },
        {
            title: 'Total Students',
            value: stats.totalStudents,
            icon: Users,
            color: 'from-purple-400 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
            textColor: 'text-purple-400',
        },
        {
            title: 'Active Jobs',
            value: stats.totalJobs,
            icon: Briefcase,
            color: 'from-green-400 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20',
            textColor: 'text-green-400',
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome, Administrator</h1>
                <p className="text-slate-400">
                    You have full control over the FairShot platform. Monitor activity and manage verifications.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <Card
                            key={stat.title}
                            className={`bg-slate-950 border ${stat.borderColor} hover:shadow-lg hover:shadow-${stat.textColor}/5 transition-all`}
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-slate-400">
                                    {stat.title}
                                </CardTitle>
                                <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                                    <Icon className={`w-4 h-4 ${stat.textColor}`} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={`text-3xl font-bold ${stat.textColor}`}>
                                    {stat.value}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <Card className="bg-slate-950 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <a
                        href="/admin/companies"
                        className="block p-4 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-cyan-500/20 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">Review Company Verifications</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    {stats.pendingCompanies} companies waiting for approval
                                </p>
                            </div>
                            <div className="text-cyan-400">→</div>
                        </div>
                    </a>

                    <a
                        href="/admin/mcq"
                        className="block p-4 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-800 hover:border-purple-500/20 transition-all"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-medium">Manage Question Bank</h3>
                                <p className="text-slate-400 text-sm mt-1">
                                    Add or edit MCQ questions for assessments
                                </p>
                            </div>
                            <div className="text-purple-400">→</div>
                        </div>
                    </a>
                </CardContent>
            </Card>

            {/* System Status */}
            <Card className="bg-slate-950 border-slate-800">
                <CardHeader>
                    <CardTitle className="text-white">System Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">API Status</span>
                            <span className="text-green-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Online
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Database</span>
                            <span className="text-green-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Connected
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Proctoring Service</span>
                            <span className="text-green-400 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Active
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
