'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, MapPin, Briefcase, DollarSign, Building, Globe } from 'lucide-react';

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    const [applicationStatus, setApplicationStatus] = useState<{ hasApplied: boolean, status?: string } | null>(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await api.get(`/jobs/${params.jobId}`);
                setJob(response.data);
            } catch (error) {
                console.error('Failed to fetch job:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load job details',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        const checkApplication = async () => {
            try {
                const response = await api.get(`/applications/check/${params.jobId}`);
                setApplicationStatus(response.data);
            } catch (error) {
                // Ignore 401/403 if not logged in
                // User not logged in or check failed
            }
        };

        if (params.jobId) {
            fetchJob();
            checkApplication();
        }
    }, [params.jobId, toast]);

    const handleApply = async () => {
        setApplying(true);
        try {
            await api.post(`/applications/apply/${params.jobId}`);
            toast({
                title: 'Application submitted!',
                description: 'Your resource pack is being generated. Check "My Applications" tab.',
            });
            // Update local state
            setApplicationStatus({ hasApplied: true, status: 'ASSESSMENT_PENDING' });
            // Optional: Redirect or stay
            // router.push('/dashboard'); 
        } catch (error: any) {
            toast({
                title: 'Application failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setApplying(false);
        }
    };

    const buttonContent = () => {
        if (applying) {
            return <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Applying...</>;
        }
        if (applicationStatus?.hasApplied) {
            return 'Applied ✅';
        }
        return 'Apply Now';
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
                <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>

                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                        <div className="flex items-start gap-4">
                            {job.company.logoUrl ? (
                                <img src={job.company.logoUrl} alt={job.company.companyName} className="w-16 h-16 rounded-lg object-cover" />
                            ) : (
                                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                    {job.company.companyName.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{job.title}</h1>
                                <div className="flex items-center gap-2 text-lg text-slate-600 dark:text-slate-300">
                                    <Building className="w-5 h-5" />
                                    {job.company.companyName}
                                </div>
                            </div>
                        </div>
                        <Button
                            size="lg"
                            onClick={handleApply}
                            disabled={applying || applicationStatus?.hasApplied}
                            variant={applicationStatus?.hasApplied ? "secondary" : "default"}
                        >
                            {buttonContent()}
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <MapPin className="w-5 h-5 text-slate-400" />
                            <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <Briefcase className="w-5 h-5 text-slate-400" />
                            <span>{job.jobType}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                            <DollarSign className="w-5 h-5 text-slate-400" />
                            <span>
                                {job.salaryMin && job.salaryMax
                                    ? `${job.currency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`
                                    : 'Salary not disclosed'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-4">About the Job</h2>
                            <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                {job.description}
                            </p>
                        </section>

                        {/* Qualifications Section */}
                        {job.qualifications && job.qualifications.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold mb-4">Qualifications</h2>
                                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300 ml-2">
                                    {(Array.isArray(job.qualifications) ? job.qualifications : JSON.parse(job.qualifications)).map((qual: string, index: number) => (
                                        <li key={index}>{qual}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section>
                            <h2 className="text-xl font-semibold mb-4">Required Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(job.tags) && job.tags.map((tag: string, index: number) => (
                                    <Badge key={`tag-${index}`} className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 border-none hover:bg-blue-200">
                                        {tag}
                                    </Badge>
                                ))}
                                {Array.isArray(job.requiredSkills) && job.requiredSkills.map((skill: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="px-3 py-1">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-4">About the Company</h2>
                            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-lg">
                                <h3 className="font-medium text-lg mb-2">{job.company.companyName}</h3>
                                {job.aboutCompany && (
                                    <p className="text-slate-600 dark:text-slate-300 mb-4 whitespace-pre-line">
                                        {job.aboutCompany}
                                    </p>
                                )}
                                <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-400">
                                    {job.company.industry && (
                                        <div>
                                            <span className="font-medium text-slate-900 dark:text-slate-200">Industry:</span> {job.company.industry}
                                        </div>
                                    )}
                                    {job.company.companySize && (
                                        <div>
                                            <span className="font-medium text-slate-900 dark:text-slate-200">Size:</span> {job.company.companySize} employees
                                        </div>
                                    )}
                                    {job.company.website && (
                                        <div className="col-span-2">
                                            <a href={job.company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                                <Globe className="w-4 h-4" /> Visit Website
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
