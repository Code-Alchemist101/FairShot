'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function StudentView() {
    const { toast } = useToast();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await api.get('/jobs');
            setJobs(response.data);
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchApplications = async () => {
        try {
            const response = await api.get('/applications/my-applications');
            setApplications(response.data);
        } catch (error) {
            console.error('Failed to fetch applications:', error);
        }
    };

    const handleApply = async (jobId: string) => {
        setApplying(jobId);
        try {
            await api.post(`/applications/apply/${jobId}`);
            toast({
                title: 'Application submitted!',
                description: 'Your resource pack is being generated. Check "My Applications" tab.',
            });
            fetchApplications();
            fetchJobs();
        } catch (error: any) {
            toast({
                title: 'Application failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setApplying(null);
        }
    };

    const appliedJobIds = applications.map((app: any) => app.jobId);

    return (
        <Tabs defaultValue="browse" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="browse">Browse Jobs</TabsTrigger>
                <TabsTrigger value="applications">My Applications ({applications.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">Available Jobs</h2>
                    <p className="text-muted-foreground">Find your next opportunity and apply with confidence</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : jobs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">No jobs available at the moment. Check back soon!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {jobs.map((job: any) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onApply={handleApply}
                                isApplied={appliedJobIds.includes(job.id)}
                                showApplyButton={true}
                            />
                        ))}
                    </div>
                )}
            </TabsContent>

            <TabsContent value="applications" className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold mb-2">My Applications</h2>
                    <p className="text-muted-foreground">Track your applications and access study materials</p>
                </div>

                {applications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">You haven't applied to any jobs yet. Browse jobs to get started!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {applications.map((application: any) => (
                            <Card key={application.id}>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle>{application.job.title}</CardTitle>
                                            <CardDescription>{application.job.company.companyName}</CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-muted-foreground">Status</div>
                                            <div className="text-sm font-semibold">{application.status.replace(/_/g, ' ')}</div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => window.location.href = `/jobs/${application.job.id}`}
                                        >
                                            View Job
                                        </Button>
                                        {application.status === 'ASSESSMENT_PENDING' && (
                                            <Button
                                                onClick={async () => {
                                                    try {
                                                        const response = await api.post(`/assessments/start/${application.id}`);
                                                        window.location.href = `/assessment/${response.data.id}`;
                                                    } catch (error: any) {
                                                        toast({
                                                            title: 'Failed to start assessment',
                                                            description: error.response?.data?.message || 'Please try again',
                                                            variant: 'destructive',
                                                        });
                                                    }
                                                }}
                                                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                                            >
                                                Start Assessment
                                            </Button>
                                        )}
                                        {application.job.resourcePacks?.length > 0 && (
                                            <Button
                                                onClick={() => window.location.href = `/resource-pack/${application.job.id}`}
                                            >
                                                Study Now
                                            </Button>
                                        )}
                                        {application.status === 'ASSESSMENT_COMPLETED' && application.skillReport && (
                                            <Button
                                                onClick={() => window.location.href = `/report/${application.skillReport.id}`}
                                                variant="secondary"
                                            >
                                                View Report
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}
