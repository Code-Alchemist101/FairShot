'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, Plus, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

export default function PostJobPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [skills, setSkills] = useState<string[]>([]);
    const [currentSkill, setCurrentSkill] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        jobType: 'Full-time',
        salaryMin: '',
        salaryMax: '',
        timeLimit: '60',
        modules: ['CODING'] as string[],
    });

    const handleAddSkill = () => {
        if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
            setSkills([...skills, currentSkill.trim()]);
            setCurrentSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setSkills(skills.filter(skill => skill !== skillToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/jobs', {
                title: formData.title,
                description: formData.description,
                location: formData.location,
                jobType: formData.jobType,
                salaryMin: parseInt(formData.salaryMin),
                salaryMax: parseInt(formData.salaryMax),
                requiredSkills: skills,
                assessmentConfig: {
                    timeLimit: parseInt(formData.timeLimit),
                    modules: formData.modules,
                },
            });

            toast({
                title: 'Job Posted Successfully!',
                description: 'Candidates can now apply to this position.',
            });

            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: 'Failed to post job',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-3xl mx-auto space-y-6">
                <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                </Button>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold">Post a New Job</h1>
                    <p className="text-muted-foreground">Create a job listing and configure the assessment.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Details</CardTitle>
                            <CardDescription>Basic information about the role.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Job Title</Label>
                                <Input
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Senior Frontend Engineer"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    required
                                    value={formData.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the role, responsibilities, and requirements..."
                                    className="min-h-[150px]"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="location">Location</Label>
                                    <Input
                                        id="location"
                                        required
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        placeholder="e.g. Remote, New York"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jobType">Job Type</Label>
                                    <select
                                        id="jobType"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.jobType}
                                        onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Contract">Contract</option>
                                        <option value="Internship">Internship</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="salaryMin">Min Salary (Annual)</Label>
                                    <Input
                                        id="salaryMin"
                                        type="number"
                                        required
                                        value={formData.salaryMin}
                                        onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                                        placeholder="e.g. 100000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salaryMax">Max Salary (Annual)</Label>
                                    <Input
                                        id="salaryMax"
                                        type="number"
                                        required
                                        value={formData.salaryMax}
                                        onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                                        placeholder="e.g. 150000"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Required Skills</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={currentSkill}
                                        onChange={(e) => setCurrentSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                        placeholder="Add a skill (e.g. React, Node.js)"
                                    />
                                    <Button type="button" onClick={handleAddSkill} variant="secondary">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {skills.map((skill) => (
                                        <div key={skill} className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                            {skill}
                                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-destructive">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assessment Configuration</CardTitle>
                            <CardDescription>Configure the automated test for this role.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="timeLimit">Time Limit (Minutes)</Label>
                                <Input
                                    id="timeLimit"
                                    type="number"
                                    required
                                    value={formData.timeLimit}
                                    onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Modules</Label>
                                <div className="flex gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="coding"
                                            checked={formData.modules.includes('CODING')}
                                            onCheckedChange={(checked: boolean) => {
                                                if (checked) {
                                                    setFormData({ ...formData, modules: [...formData.modules, 'CODING'] });
                                                } else {
                                                    setFormData({ ...formData, modules: formData.modules.filter(m => m !== 'CODING') });
                                                }
                                            }}
                                        />
                                        <Label htmlFor="coding">Coding Challenges</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="mcq"
                                            checked={formData.modules.includes('MCQ')}
                                            onCheckedChange={(checked: boolean) => {
                                                if (checked) {
                                                    setFormData({ ...formData, modules: [...formData.modules, 'MCQ'] });
                                                } else {
                                                    setFormData({ ...formData, modules: formData.modules.filter(m => m !== 'MCQ') });
                                                }
                                            }}
                                        />
                                        <Label htmlFor="mcq">Multiple Choice Questions</Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Post Job
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
