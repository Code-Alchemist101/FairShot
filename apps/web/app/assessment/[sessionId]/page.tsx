'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CodeEditor } from '@/components/assessment/CodeEditor';
import { BrowserMock } from '@/components/assessment/BrowserMock';
import { useRef } from 'react';
import { QuizComponent } from '@/components/assessment/QuizComponent';
import { CalibrationOverlay } from '@/components/assessment/CalibrationOverlay';
import { useProctoring } from '@/hooks/useProctoring';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Play, Clock, Loader2, FileCode, Globe, ClipboardList } from 'lucide-react';

export default function AssessmentPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const { toast } = useToast();

    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('console.log(\"Hello World\");');
    const [timeRemaining, setTimeRemaining] = useState(3600);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [quizSubmitted, setQuizSubmitted] = useState(false);
    const [codeSubmitted, setCodeSubmitted] = useState(false);
    const [activeTab, setActiveTab] = useState('problem');
    const [isCalibrated, setIsCalibrated] = useState(false);
    const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
    const gazeRef = useRef({ x: 0, y: 0 });

    const { isTracking, warning, calibratePoint } = useProctoring({
        sessionId,
        enabled: true,
        onGazeUpdate: (x, y) => {
            gazeRef.current = { x, y };
        }
    });

    // Fetch session data
    useEffect(() => {
        fetchSession();
    }, [sessionId]);

    const fetchSession = async () => {
        try {
            const response = await api.get(`/assessments/session/${sessionId}`);
            setSession(response.data);

            // Check if quiz already submitted
            if (response.data.mcqResponses?.length > 0) {
                const hasAnswers = response.data.mcqResponses.some((r: any) => r.selectedAnswer !== null);
                setQuizSubmitted(hasAnswers);

                // Initialize local answers
                const existing = response.data.mcqResponses.reduce((acc: any, r: any) => {
                    if (r.selectedAnswer !== null) acc[r.question.id] = r.selectedAnswer;
                    return acc;
                }, {});
                setQuizAnswers(prev => ({ ...prev, ...existing }));
            }

            // Check if code already submitted
            if (response.data.codeSubmissions?.length > 0) {
                setCodeSubmitted(true);
            }

            // Set default tab based on available modules
            const hasMCQ = response.data.mcqResponses?.length > 0;
            const hasCoding = response.data.application?.job?.assessmentConfig?.modules?.includes('CODING');

            if (hasMCQ && !hasCoding) {
                setActiveTab('quiz');
            }

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch session:', error);
            toast({
                title: 'Error',
                description: 'Failed to load assessment session',
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    // Timer Logic
    useEffect(() => {
        if (!session || !session.startTime) return;

        const calculateTimeLeft = () => {
            const startTime = new Date(session.startTime).getTime();
            const durationMs = (session.durationMinutes || 60) * 60 * 1000;
            const endTime = startTime + durationMs;
            const now = Date.now();
            const diff = Math.floor((endTime - now) / 1000);
            return Math.max(0, diff);
        };

        // Initialize timer
        setTimeRemaining(calculateTimeLeft());

        // Don't start countdown until calibration passed
        if (!isCalibrated) return;

        const interval = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeRemaining(left);

            // Auto-submit if time runs out
            if (left <= 0 && !submitting) {
                handleFinishTest();
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [session, isCalibrated, submitting]);

    // Hide webgazer UI
    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = `
      #webgazerVideoFeed,
      #webgazerVideoContainer,
      #webgazerFaceOverlay,
      #webgazerFaceFeedbackBox {
        display: none !important;
        visibility: hidden !important;
      }
    `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const handleRunCode = async () => {
        setSubmitting(true);
        setResult(null);

        try {
            const response = await api.post('/assessments/submit', {
                sessionId,
                problemId: null,
                code,
                language: 'javascript',
            });

            setResult(response.data.result);
            setCodeSubmitted(true);

            toast({
                title: 'Code Executed',
                description: 'Your code has been run successfully',
            });
        } catch (error: any) {
            console.error('Submission error:', error);
            setResult({
                status: 'Error',
                error: error.response?.data?.message || error.message || 'Submission failed',
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuizSubmit = async (answers: Record<string, number>) => {
        try {
            const responses = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
                questionId,
                selectedAnswer,
            }));

            await api.post('/assessments/submit-mcq', {
                sessionId,
                responses,
            });

            setQuizSubmitted(true);

            toast({
                title: 'Quiz Submitted!',
                description: 'Your answers have been recorded successfully',
            });

            // Refresh session to get updated data
            fetchSession();
        } catch (error: any) {
            console.error('Quiz submission error:', error);
            toast({
                title: 'Submission Failed',
                description: error.response?.data?.message || 'Failed to submit quiz',
                variant: 'destructive',
            });
            throw error;
        }
    };

    const handleFinishTest = async () => {
        const hasMCQ = session?.mcqResponses?.length > 0;
        const hasCoding = session?.application?.job?.assessmentConfig?.modules?.includes('CODING');

        // Warn if modules not attempted
        const warnings = [];
        if (hasMCQ && !quizSubmitted) {
            warnings.push('Quiz not submitted');
        }
        if (hasCoding && !codeSubmitted) {
            warnings.push('Code not submitted');
        }

        let confirmMessage = 'Are you sure you want to finish the test? This cannot be undone.';
        if (warnings.length > 0) {
            confirmMessage = `Warning: ${warnings.join(', ')}. Are you sure you want to finish the test?`;
        }

        if (!window.confirm(confirmMessage)) {
            return;
        }

        try {
            await api.post(`/assessments/complete/${sessionId}`);

            toast({
                title: 'Assessment Complete!',
                description: 'Your assessment has been submitted successfully',
            });

            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1500);
        } catch (error) {
            console.error('Failed to finish test:', error);
            toast({
                title: 'Submission Failed',
                description: 'Failed to submit assessment. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <div className="h-screen w-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
        );
    }

    const hasMCQ = session?.mcqResponses?.length > 0;
    const hasCoding = session?.application?.job?.assessmentConfig?.modules?.includes('CODING');

    return (
        <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden">
            {/* Calibration Overlay - blocks everything until passed */}
            {!isCalibrated && (
                <CalibrationOverlay
                    onComplete={() => setIsCalibrated(true)}
                    calibratePoint={calibratePoint}
                    gazeRef={gazeRef}
                />
            )}

            {/* Header */}
            <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-white">
                        {session?.application?.job?.title || 'Assessment'}
                    </h1>
                    {isTracking && (
                        <span className="text-xs text-green-400 flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Proctoring Active
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-lg">{formatTime(timeRemaining)}</span>
                    </div>

                    {hasCoding && (
                        <Button onClick={handleRunCode} disabled={submitting} variant="secondary" className="mr-2">
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Running...
                                </>
                            ) : (
                                <>
                                    <Play className="w-4 h-4 mr-2" />
                                    Run Code
                                </>
                            )}
                        </Button>
                    )}

                    <Button onClick={handleFinishTest} variant="destructive">
                        Finish Test
                    </Button>
                </div>
            </div>

            {/* Warning */}
            {warning && (
                <div className="m-4 p-3 bg-red-900/30 border border-red-700 rounded text-white">
                    {warning}
                </div>
            )}

            {/* Main Content with Tabs */}
            <div className="flex-1 p-4 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="bg-slate-800 border-slate-700">
                        {hasCoding && (
                            <TabsTrigger value="problem" className="data-[state=active]:bg-slate-700">
                                <FileCode className="w-4 h-4 mr-2" />
                                Problem
                            </TabsTrigger>
                        )}
                        {hasMCQ && (
                            <TabsTrigger value="quiz" className="data-[state=active]:bg-slate-700">
                                <ClipboardList className="w-4 h-4 mr-2" />
                                Quiz {quizSubmitted && '✓'}
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="browser" className="data-[state=active]:bg-slate-700">
                            <Globe className="w-4 h-4 mr-2" />
                            Resources
                        </TabsTrigger>
                    </TabsList>

                    {/* Problem Tab */}
                    {hasCoding && (
                        <TabsContent value="problem" className="flex-1 mt-4 overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 h-full">
                                {/* Problem Description */}
                                <div className="col-span-4 overflow-auto">
                                    <Card className="h-full bg-slate-800 border-slate-700">
                                        <CardHeader>
                                            <CardTitle className="text-white">Problem Description</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-white space-y-4">
                                            <div>
                                                <p className="text-sm">Given an array of integers <code className="bg-slate-700 px-1 rounded">nums</code> and an integer <code className="bg-slate-700 px-1 rounded">target</code>, return indices of the two numbers that add up to target.</p>
                                            </div>

                                            <div>
                                                <h3 className="font-semibold mb-2 text-sm">Example:</h3>
                                                <pre className="bg-slate-900 p-2 rounded text-xs">
                                                    {`Input: nums = [2,7,11,15], target = 9
Output: [0,1]`}
                                                </pre>
                                            </div>

                                            {result && (
                                                <div className="mt-4">
                                                    <h3 className="font-semibold mb-2 text-sm">Result:</h3>
                                                    <div className={`p-3 rounded text-sm ${result.status === 'Accepted' ? 'bg-green-900/30 border border-green-700' : 'bg-red-900/30 border border-red-700'}`}>
                                                        <p className="font-medium">{result.status}</p>
                                                        {result.output && (
                                                            <pre className="mt-2 text-xs bg-slate-900 p-2 rounded overflow-auto">
                                                                {result.output}
                                                            </pre>
                                                        )}
                                                        {result.error && (
                                                            <pre className="mt-2 text-xs bg-red-950 p-2 rounded overflow-auto text-red-300">
                                                                {result.error}
                                                            </pre>
                                                        )}
                                                        {result.time && <p className="text-xs mt-2">Time: {result.time}s</p>}
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Code Editor */}
                                <div className="col-span-8 overflow-hidden">
                                    <Card className="h-full bg-slate-800 border-slate-700">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-white text-sm">Code Editor</CardTitle>
                                        </CardHeader>
                                        <CardContent className="h-[calc(100%-4rem)]">
                                            <CodeEditor
                                                code={code}
                                                onChange={(value) => setCode(value || '')}
                                                language="javascript"
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </TabsContent>
                    )}

                    {/* Quiz Tab */}
                    {hasMCQ && (
                        <TabsContent value="quiz" className="flex-1 mt-4 overflow-hidden">
                            <Card className="h-full bg-slate-800 border-slate-700">
                                <CardContent className="h-full p-0">
                                    <QuizComponent
                                        questions={session.mcqResponses.map((r: any) => r.question)}
                                        onSubmit={handleQuizSubmit}
                                        readonly={quizSubmitted}
                                        answers={quizAnswers}
                                        onAnswerSelect={(qId, aIdx) => {
                                            setQuizAnswers(prev => ({ ...prev, [qId]: aIdx }));
                                        }}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    {/* Browser Tab */}
                    <TabsContent value="browser" className="flex-1 mt-4 overflow-hidden">
                        <Card className="h-full bg-slate-800 border-slate-700">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white text-sm">Allowed Resources</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[calc(100%-4rem)]">
                                <BrowserMock initialUrl="https://www.w3schools.com" />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
