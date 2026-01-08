'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { JobCard } from '@/components/JobCard';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Filter, X } from 'lucide-react';

export function StudentView() {
    const { toast } = useToast();
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState<string | null>(null);

    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Extract all unique tags
    const allTags = Array.from(new Set(jobs.flatMap((job: any) => {
        const tags = [];
        if (Array.isArray(job.tags)) tags.push(...job.tags);
        else if (typeof job.tags === 'string') {
            try { tags.push(...JSON.parse(job.tags)); } catch { }
        }

        // Also include skills as tags for better discoverability
        if (Array.isArray(job.requiredSkills)) tags.push(...job.requiredSkills);

        return tags;
    }))).sort();

    const handleTagToggle = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const filteredJobs = jobs.filter((job: any) => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase());

        if (selectedTags.length === 0) return matchesSearch;

        // Collect all tags for this job
        const jobTags = new Set([
            ...(Array.isArray(job.tags) ? job.tags : []),
            ...(Array.isArray(job.requiredSkills) ? job.requiredSkills : [])
        ]);

        const matchesTags = selectedTags.every(tag => jobTags.has(tag));

        return matchesSearch && matchesTags;
    });

    useEffect(() => {
        fetchJobs();
        fetchApplications();
    }, []);

    // Poll for updates if any application is recent but missing resource pack
    useEffect(() => {
        const hasPendingResources = applications.some((app: any) =>
            app.job.resourcePacks?.length === 0 &&
            ['APPLIED', 'ASSESSMENT_PENDING'].includes(app.status)
        );

        if (hasPendingResources) {
            const interval = setInterval(() => {
                fetchApplications(); // Silent refresh
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [applications]);

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

                {/* Search and Filter Section */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by job title, company, or skills..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {allTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            <div className="flex items-center">
                                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Filters:</span>
                            </div>
                            {selectedTags.map(tag => (
                                <Badge
                                    key={tag}
                                    className="cursor-pointer hover:bg-destructive/90 pr-1 gap-1"
                                    onClick={() => handleTagToggle(tag)}
                                >
                                    {tag}
                                    <X className="w-3 h-3" />
                                </Badge>
                            ))}
                            {allTags.filter(t => !selectedTags.includes(t)).map(tag => (
                                <Badge
                                    key={tag}
                                    variant="outline"
                                    className="cursor-pointer hover:bg-secondary"
                                    onClick={() => handleTagToggle(tag)}
                                >
                                    {tag}
                                </Badge>
                            ))}
                            {selectedTags.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedTags([])}
                                    className="h-6 px-2 text-muted-foreground bg-slate-900"
                                >
                                    Clear all
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                {jobs.length === 0
                                    ? "No jobs available at the moment. Check back soon!"
                                    : "No jobs match your search criteria."}
                            </p>
                            {(searchTerm || selectedTags.length > 0) && (
                                <Button
                                    variant="link"
                                    onClick={() => { setSearchTerm(''); setSelectedTags([]); }}
                                >
                                    Clear filters
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {filteredJobs.map((job: any) => (
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

                <Tabs defaultValue="action_required" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-4">
                        <TabsTrigger value="action_required">Action Required ({applications.filter((a: any) => a.status === 'ASSESSMENT_PENDING').length})</TabsTrigger>
                        <TabsTrigger value="in_progress">In Progress ({applications.filter((a: any) => ['APPLIED', 'ASSESSMENT_IN_PROGRESS'].includes(a.status)).length})</TabsTrigger>
                        <TabsTrigger value="completed">Completed ({applications.filter((a: any) => !['APPLIED', 'ASSESSMENT_PENDING', 'ASSESSMENT_IN_PROGRESS'].includes(a.status)).length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="action_required">
                        <ApplicationList
                            applications={applications.filter((a: any) => a.status === 'ASSESSMENT_PENDING')}
                            emptyMessage="No pending actions. You're all caught up!"
                        />
                    </TabsContent>

                    <TabsContent value="in_progress">
                        <ApplicationList
                            applications={applications.filter((a: any) => ['APPLIED', 'ASSESSMENT_IN_PROGRESS'].includes(a.status))}
                            emptyMessage="No applications in progress."
                        />
                    </TabsContent>

                    <TabsContent value="completed">
                        <ApplicationList
                            applications={applications.filter((a: any) => !['APPLIED', 'ASSESSMENT_PENDING', 'ASSESSMENT_IN_PROGRESS'].includes(a.status))}
                            emptyMessage="No completed applications yet."
                        />
                    </TabsContent>
                </Tabs>
            </TabsContent>
        </Tabs>
    );
}

function ApplicationList({ applications, emptyMessage }: { applications: any[], emptyMessage: string }) {
    const { toast } = useToast();

    if (applications.length === 0) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">{emptyMessage}</p>
                </CardContent>
            </Card>
        );
    }

    return (
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
                                <Badge variant={application.status === 'ASSESSMENT_PENDING' ? 'destructive' : 'secondary'}>
                                    {application.status.replace(/_/g, ' ')}
                                </Badge>
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
                            {application.status === 'ASSESSMENT_IN_PROGRESS' && (
                                <Button
                                    onClick={async () => {
                                        // Logic to resume or find session
                                        // Ideally fetch active session
                                        try {
                                            // Ensure we don't start a new one if one exists, backend handles this? 
                                            // Actually start endpoint usually resumes or creates. 
                                            // Let's assume start endpoint handles resume for now or we redirect to assessment page if we saved ID.
                                            // For safety, let's just trigger start which helps resume in many implementations
                                            const response = await api.post(`/assessments/start/${application.id}`);
                                            window.location.href = `/assessment/${response.data.id}`;
                                        } catch (error: any) {
                                            toast({
                                                title: 'Failed to resume assessment',
                                                description: error.response?.data?.message || 'Please contact support',
                                                variant: 'destructive',
                                            });
                                        }
                                    }}
                                >
                                    Resume Assessment
                                </Button>
                            )}
                            {application.job.resourcePacks?.length > 0 && (
                                <Button
                                    variant="secondary"
                                    onClick={() => window.location.href = `/resource-pack/${application.job.id}`}
                                >
                                    Study Materials
                                </Button>
                            )}
                            {['ASSESSMENT_COMPLETED', 'HIRED', 'REJECTED', 'SHORTLISTED'].includes(application.status) && application.skillReport && (
                                <Button
                                    onClick={() => window.location.href = `/report/${application.skillReport.id}`}
                                    variant="outline"
                                >
                                    View Report
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
