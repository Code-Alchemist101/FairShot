'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ArrowLeft, BookOpen, Lightbulb, HelpCircle, FileText, PlayCircle } from 'lucide-react';

export default function ResourcePackPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const [pack, setPack] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [startingAssessment, setStartingAssessment] = useState(false);
    const [applicationId, setApplicationId] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch resource pack
                const packResponse = await api.get(`/applications/resource-pack/${params.jobId}`);
                setPack(packResponse.data);

                // Fetch user's application to get ID
                const appsResponse = await api.get('/applications/my-applications');
                const myApp = appsResponse.data.find((app: any) => app.jobId === params.jobId);
                if (myApp) {
                    setApplicationId(myApp.id);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load study materials',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        if (params.jobId) {
            fetchData();
        }
    }, [params.jobId, toast]);

    const handleStartAssessment = async () => {
        if (!applicationId) {
            toast({
                title: 'Error',
                description: 'Application not found. Please apply first.',
                variant: 'destructive',
            });
            return;
        }

        setStartingAssessment(true);
        try {
            const response = await api.post(`/assessments/start/${applicationId}`);
            router.push(`/assessment/${response.data.id}`);
        } catch (error: any) {
            toast({
                title: 'Failed to start',
                description: error.response?.data?.message || 'Could not start assessment',
                variant: 'destructive',
            });
            setStartingAssessment(false);
        }
    };

    if (loading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!pack) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                <h1 className="text-2xl font-bold mb-4">Resource Pack Not Found</h1>
                <p className="text-muted-foreground mb-6">The study materials for this job haven't been generated yet.</p>
                <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Button>
                    <Button onClick={handleStartAssessment} disabled={startingAssessment || !applicationId}>
                        {startingAssessment ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting...
                            </>
                        ) : (
                            <>
                                <PlayCircle className="w-4 h-4 mr-2" /> Start Assessment
                            </>
                        )}
                    </Button>
                </div>

                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Study Resource Pack</h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        AI-curated materials to help you ace the assessment for {pack.job?.title}
                    </p>
                </div>

                <div className="grid gap-6">
                    {/* Exam Pattern */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Exam Pattern
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-line">
                                {pack.examPattern}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Required Skills */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-green-600" />
                                Key Concepts to Review
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(pack.requiredSkills) && pack.requiredSkills.map((skill: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-base py-1 px-3">
                                        {skill}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Prep Tips */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lightbulb className="w-5 h-5 text-yellow-600" />
                                Preparation Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {Array.isArray(pack.prepTips) && pack.prepTips.map((tip: string, index: number) => (
                                    <li key={index} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-sm font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="text-slate-700 dark:text-slate-300">{tip}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Sample Questions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-purple-600" />
                                Sample Questions
                            </CardTitle>
                            <CardDescription>Practice with these questions to test your knowledge</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {Array.isArray(pack.sampleQuestions) && pack.sampleQuestions.map((q: any, index: number) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left font-medium">
                                            {q.question || `Question ${index + 1}`}
                                        </AccordionTrigger>
                                        <AccordionContent className="space-y-4 pt-4">
                                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                                                <p className="font-semibold mb-2 text-sm text-slate-500 uppercase">Answer:</p>
                                                <p className="text-slate-700 dark:text-slate-300">{q.answer || 'Answer not provided'}</p>
                                            </div>
                                            {q.explanation && (
                                                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                                                    <p className="font-semibold mb-2 text-sm text-blue-600 dark:text-blue-400 uppercase">Explanation:</p>
                                                    <p className="text-blue-800 dark:text-blue-200">{q.explanation}</p>
                                                </div>
                                            )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
