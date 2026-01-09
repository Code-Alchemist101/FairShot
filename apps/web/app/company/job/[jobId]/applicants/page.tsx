'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, CheckCircle, XCircle, FileText, Users, Sparkles } from 'lucide-react';
import { AssessmentManager } from '@/components/company/AssessmentManager';

export default function JobApplicantsPage({ params }: { params: { jobId: string } }) {
    const router = useRouter();
    const { toast } = useToast();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [job, setJob] = useState<any>(null); // Full job details including questions

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [applicantsRes, jobRes] = await Promise.all([
                api.get(`/applications/job/${params.jobId}`),
                api.get(`/jobs/${params.jobId}`)
            ]);
            setApplicants(applicantsRes.data);
            setJob(jobRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load job data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (applicationId: string, status: 'SHORTLISTED' | 'REJECTED') => {
        try {
            await api.post(`/applications/${applicationId}/status`, { status });
            toast({
                title: 'Status Updated',
                description: `Candidate has been ${status.toLowerCase()}.`,
            });
            fetchData(); // Refresh list
        } catch (error) {
            toast({
                title: 'Update Failed',
                description: 'Could not update application status.',
                variant: 'destructive',
            });
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600 font-bold';
        if (score >= 50) return 'text-yellow-600 font-medium';
        return 'text-red-600';
    };

    const getIntegrityColor = (score: number) => {
        if (score >= 90) return 'bg-green-100 text-green-800';
        if (score >= 70) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>

                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">{job?.title}</h1>
                        <p className="text-muted-foreground">{job?.company?.companyName} • {applicants.length} Candidates</p>
                    </div>
                </div>

                <Tabs defaultValue="applicants" className="space-y-6">
                    <TabsList>
                        <TabsTrigger value="applicants" className="flex items-center gap-2">
                            <Users className="w-4 h-4" /> Applicants
                        </TabsTrigger>
                        <TabsTrigger value="assessment" className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> Assessment
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="applicants">
                        <Card>
                            <CardHeader>
                                <CardTitle>Candidate List</CardTitle>
                                <CardDescription>Review assessments and manage hiring decisions.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {applicants.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No applicants yet.
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Candidate</TableHead>
                                                <TableHead>Applied Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Integrity Score</TableHead>
                                                <TableHead>Overall Score</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {applicants.map((app: any) => (
                                                <TableRow key={app.id}>
                                                    <TableCell>
                                                        <div className="font-medium">{app.student.user.fullName || app.student.user.email}</div>
                                                        <div className="text-xs text-muted-foreground">{app.student.user.email}</div>
                                                    </TableCell>
                                                    <TableCell>{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                                                    <TableCell>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${app.status === 'SHORTLISTED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-slate-100 text-slate-700 border-slate-200'
                                                            }`}>
                                                            {app.status.replace(/_/g, ' ')}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {app.skillReport ? (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntegrityColor(app.skillReport.integrityScore)}`}>
                                                                {app.skillReport.integrityScore}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">N/A</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {app.skillReport ? (
                                                            <span className={getScoreColor(app.skillReport.overallScore)}>
                                                                {app.skillReport.overallScore}%
                                                            </span>
                                                        ) : (
                                                            <span className="text-muted-foreground text-xs">Pending</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        {app.skillReport && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => window.open(`/report/${app.skillReport.id}`, '_blank')}
                                                            >
                                                                <FileText className="w-4 h-4 mr-1" /> Report
                                                            </Button>
                                                        )}
                                                        {!['APPLIED', 'ASSESSMENT_PENDING', 'ASSESSMENT_IN_PROGRESS', 'SHORTLISTED', 'REJECTED', 'HIRED'].includes(app.status) && (
                                                            <>
                                                                <Button
                                                                    variant="default"
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700"
                                                                    onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                                                                >
                                                                    <XCircle className="w-4 h-4" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="assessment">
                        <AssessmentManager
                            jobId={params.jobId}
                            initialMcqs={job?.mcqQuestions || []}
                            initialCoding={job?.codingProblems || []}
                            onUpdate={fetchData}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
