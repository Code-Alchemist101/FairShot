'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle, ShieldCheck, ShieldAlert, ArrowLeft } from 'lucide-react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
} from 'recharts';

export default function ReportPage() {
    const params = useParams();
    const reportId = params.reportId as string;
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await api.get(`/reports/${reportId}`);
                setReport(response.data);
            } catch (error) {
                console.error('Failed to fetch report:', error);
            } finally {
                setLoading(false);
            }
        };

        if (reportId) {
            fetchReport();
        }
    }, [reportId]);

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!report) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <h1 className="text-2xl font-bold mb-4">Report Not Found</h1>
                <Button onClick={() => window.location.href = '/dashboard'}>Return to Dashboard</Button>
            </div>
        );
    }

    const chartData = [
        { subject: 'Coding', A: report.codeCorrectness || 0, fullMark: 100 },
        { subject: 'Integrity', A: report.integrityScore || 0, fullMark: 100 },
        { subject: 'Debugging', A: report.debuggingApproach || 75, fullMark: 100 },
        { subject: 'Communication', A: report.communicationClarity || 80, fullMark: 100 },
        { subject: 'Tool Usage', A: report.toolUsageEfficiency || 85, fullMark: 100 },
    ];

    const isVerified = report.integrityScore > 80;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <Button variant="ghost" onClick={() => window.location.href = '/dashboard'} className="mb-2 pl-0 hover:bg-transparent">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                        </Button>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Skill Assessment Report</h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            {report.application.job.title} • {new Date(report.generatedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isVerified ? 'bg-green-100 border-green-200 text-green-700' : 'bg-red-100 border-red-200 text-red-700'}`}>
                        {isVerified ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
                        <span className="font-semibold">{isVerified ? 'Verified Authentic' : 'Integrity Flagged'}</span>
                    </div>
                </div>

                {/* Top Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Overall Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-slate-900 dark:text-white">
                                {Math.round(report.overallScore)}<span className="text-xl text-slate-400">/100</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Integrity Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-4xl font-bold ${report.integrityScore > 80 ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.round(report.integrityScore)}<span className="text-xl text-slate-400">/100</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500">Percentile</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-blue-600">
                                Top {Math.round(100 - (report.percentile || 50))}%
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Radar Chart */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle>Skill Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                    <PolarGrid />
                                    <PolarAngleAxis dataKey="subject" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                    <Radar
                                        name="Student"
                                        dataKey="A"
                                        stroke="#2563eb"
                                        fill="#2563eb"
                                        fillOpacity={0.6}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* AI Feedback */}
                    <Card className="lg:col-span-2">
                        <CardHeader>
                            <CardTitle>AI Performance Analysis</CardTitle>
                            <CardDescription>Generated based on your code execution and behavior</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-semibold text-green-600 flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-4 h-4" /> Strengths
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    {report.strengths}
                                </p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-amber-600 flex items-center gap-2 mb-2">
                                    <AlertTriangle className="w-4 h-4" /> Areas for Improvement
                                </h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    {report.weaknesses}
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">💡 Actionable Tips</h3>
                                <p className="text-slate-600 dark:text-slate-300 text-sm">
                                    {report.improvementTips}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
