'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Users, Briefcase, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CompanyView() {
    const { user } = useAuth();
    const router = useRouter();
    const [jobs, setJobs] = useState([]);
    const [credits, setCredits] = useState(user?.company?.creditsBalance || 0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
        fetchCredits();
    }, []);

    const fetchCredits = async () => {
        try {
            const response = await api.get('/users/me');
            if (response.data?.company?.creditsBalance !== undefined) {
                setCredits(response.data.company.creditsBalance);
            }
        } catch (error) {
            console.error('Failed to fetch credits:', error);
        }
    };

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs/company/my-jobs');
            setJobs(response.data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalApplicants = jobs.reduce((acc, job: any) => acc + (job._count?.applications || 0), 0);

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{jobs.length}</div>
                        <p className="text-xs text-muted-foreground">Currently live on the platform</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalApplicants}</div>
                        <p className="text-xs text-muted-foreground">Across all active jobs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{credits}</div>
                        <p className="text-xs text-muted-foreground mb-4">Credits used for new applications</p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => router.push('/company/billing')}
                        >
                            Manage Credits
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Active Jobs List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Your Jobs</h2>
                    <Button onClick={() => router.push('/company/post-job')}>
                        <Plus className="mr-2 h-4 w-4" /> Post New Job
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : jobs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">You haven't posted any jobs yet.</p>
                            <Button variant="link" onClick={() => router.push('/company/post-job')}>
                                Create your first job posting
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {jobs.map((job: any) => (
                            <Card key={job.id}>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle>{job.title}</CardTitle>
                                            <CardDescription>
                                                Posted on {new Date(job.createdAt).toLocaleDateString()} • {job.location} • {job.jobType}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">{job._count?.applications || 0}</div>
                                                <div className="text-xs text-muted-foreground">Applicants</div>
                                            </div>
                                            <Button variant="outline" onClick={() => router.push(`/company/job/${job.id}/applicants`)}>
                                                View Applicants
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
