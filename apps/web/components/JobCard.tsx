'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, DollarSign, Users, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface JobCardProps {
    job: {
        id: string;
        title: string;
        description: string;
        location: string;
        jobType: string;
        salaryMin?: number;
        salaryMax?: number;
        requiredSkills: string[];
        company: {
            companyName: string;
            logoUrl?: string;
        };
        _count?: {
            applications: number;
        };
    };
    onApply?: (jobId: string) => void;
    showApplyButton?: boolean;
    isApplied?: boolean;
}

export function JobCard({ job, onApply, showApplyButton = true, isApplied = false }: JobCardProps) {
    const router = useRouter();

    const formatSalary = () => {
        if (!job.salaryMin && !job.salaryMax) return null;
        if (job.salaryMin && job.salaryMax) {
            return `₹${(job.salaryMin / 100000).toFixed(1)}L - ₹${(job.salaryMax / 100000).toFixed(1)}L`;
        }
        return job.salaryMin ? `₹${(job.salaryMin / 100000).toFixed(1)}L+` : null;
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        {job.company.logoUrl ? (
                            <img src={job.company.logoUrl} alt={job.company.companyName} className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-primary" />
                            </div>
                        )}
                        <div>
                            <CardTitle className="text-lg">{job.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1">
                                <Building2 className="w-3 h-3" />
                                {job.company.companyName}
                            </CardDescription>
                        </div>
                    </div>
                    {isApplied && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                            Applied
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.slice(0, 4).map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                        </Badge>
                    ))}
                    {job.requiredSkills.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                            +{job.requiredSkills.length - 4} more
                        </Badge>
                    )}
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-xs">
                            {job.jobType}
                        </Badge>
                    </div>
                    {formatSalary() && (
                        <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {formatSalary()}
                        </div>
                    )}
                    {job._count && (
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {job._count.applications} applicants
                        </div>
                    )}
                </div>
            </CardContent>

            {showApplyButton && (
                <CardFooter className="gap-3">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                    </Button>
                    <Button
                        onClick={() => onApply?.(job.id)}
                        disabled={isApplied}
                        className="flex-1"
                        variant={isApplied ? 'outline' : 'default'}
                    >
                        {isApplied ? 'Already Applied' : 'Apply Now'}
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
