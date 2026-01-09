'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Users, Briefcase, CreditCard, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

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

    const activeJobs = jobs.filter((job: any) => job.status === 'ACTIVE');
    const draftJobs = jobs.filter((job: any) => job.status === 'DRAFT');
    const closedJobs = jobs.filter((job: any) => ['CLOSED', 'ARCHIVED'].includes(job.status));

    const totalApplicants = jobs.reduce((acc, job: any) => acc + (job._count?.applications || 0), 0);

    const handleStatusUpdate = async (jobId: string, newStatus: string) => {
        try {
            await api.put(`/jobs/${jobId}`, { status: newStatus });
            fetchJobs(); // Refresh list
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Stats Overview */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                <motion.div variants={item}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeJobs.length}</div>
                            <p className="text-xs text-muted-foreground">Currently live on the platform</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={item}>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalApplicants}</div>
                            <p className="text-xs text-muted-foreground">Across all jobs</p>
                        </CardContent>
                    </Card>
                </motion.div>
                <motion.div variants={item}>
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
                </motion.div>
            </motion.div>

            {/* Jobs Tabs */}
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
                ) : (
                    <Tabs defaultValue="active" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-4 max-w-md">
                            <TabsTrigger value="active">Active ({activeJobs.length})</TabsTrigger>
                            <TabsTrigger value="draft">Drafts ({draftJobs.length})</TabsTrigger>
                            <TabsTrigger value="closed">Closed ({closedJobs.length})</TabsTrigger>
                        </TabsList>

                        <TabsContent value="active">
                            <JobList
                                jobs={activeJobs}
                                type="active"
                                onStatusUpdate={handleStatusUpdate}
                                emptyMessage="No active jobs. Post one now!"
                                router={router}
                            />
                        </TabsContent>
                        <TabsContent value="draft">
                            <JobList
                                jobs={draftJobs}
                                type="draft"
                                onStatusUpdate={handleStatusUpdate}
                                emptyMessage="No draft jobs."
                                router={router}
                            />
                        </TabsContent>
                        <TabsContent value="closed">
                            <JobList
                                jobs={closedJobs}
                                type="closed"
                                onStatusUpdate={handleStatusUpdate}
                                emptyMessage="No closed or archived jobs."
                                router={router}
                            />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
}

function JobList({
    jobs,
    type,
    emptyMessage,
    onStatusUpdate,
    router
}: {
    jobs: any[],
    type: 'active' | 'draft' | 'closed',
    emptyMessage: string,
    onStatusUpdate: (id: string, status: string) => void,
    router: any
}) {
    if (jobs.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4">
            {jobs.map((job: any) => (
                <Card key={job.id}>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CardTitle>{job.title}</CardTitle>
                                        <Badge variant={job.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                            {job.status}
                                        </Badge>
                                    </div>
                                </div>
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
                                <Button variant="ghost" size="icon" onClick={() => router.push(`/company/jobs/${job.id}/edit`)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                {type === 'active' && (
                                    <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => onStatusUpdate(job.id, 'CLOSED')}>
                                        Close
                                    </Button>
                                )}
                                {type === 'draft' && (
                                    <Button variant="ghost" className="text-green-600 hover:text-green-700" onClick={() => onStatusUpdate(job.id, 'ACTIVE')}>
                                        Publish
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            ))}
        </div>
    );
}
