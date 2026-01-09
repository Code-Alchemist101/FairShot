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
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

export default function AssessmentPage() {
    const params = useParams();
    const sessionId = params.sessionId as string;
    const { toast } = useToast();

    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [code, setCode] = useState('// Write your code here\n');
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

    const activeProblem = session?.codeSubmissions?.[0]?.problem;
    const activeSubmission = session?.codeSubmissions?.[0];

    // Initialize code from saved submission
    useEffect(() => {
        if (activeSubmission?.code) {
            setCode(activeSubmission.code);
        }
    }, [activeSubmission]);

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
        <div className="h-screen w-screen bg-background flex flex-col overflow-hidden text-foreground">
            {/* Calibration Overlay - blocks everything until passed */}
            {!isCalibrated && (
                <CalibrationOverlay
                    onComplete={() => setIsCalibrated(true)}
                    calibratePoint={calibratePoint}
                    gazeRef={gazeRef}
                    isTracking={isTracking}
                />
            )}

            {/* Header */}
            <div className="bg-card border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold">
                        {session?.application?.job?.title || 'Assessment'}
                    </h1>
                    {isTracking && (
                        <span className="text-xs text-green-500 font-medium flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Proctoring Active
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-lg font-medium text-foreground">{formatTime(timeRemaining)}</span>
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
            <AnimatePresence>
                {warning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="m-4 mb-0 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive flex items-center justify-center font-medium"
                    >
                        {warning}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content with Tabs */}
            <div className="flex-1 p-4 overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                    <TabsList className="bg-muted/50 border self-start mb-2">
                        {hasCoding && (
                            <TabsTrigger value="problem" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <FileCode className="w-4 h-4 mr-2" />
                                Problem
                            </TabsTrigger>
                        )}
                        {hasMCQ && (
                            <TabsTrigger value="quiz" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <ClipboardList className="w-4 h-4 mr-2" />
                                Quiz {quizSubmitted && '✓'}
                            </TabsTrigger>
                        )}
                        <TabsTrigger value="browser" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
                            <Globe className="w-4 h-4 mr-2" />
                            Resources
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 relative overflow-hidden rounded-xl border bg-card shadow-sm">
                        <AnimatePresence>
                            {/* Problem Tab */}
                            {hasCoding && activeTab === 'problem' && (
                                <motion.div
                                    key="problem"
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.1 }} // Snappier transition
                                    className="absolute inset-0 flex flex-col"
                                >
                                    <TabsContent value="problem" className="flex-1 m-0 h-full p-0">
                                        <div className="grid grid-cols-12 h-full divide-x">
                                            {/* Problem Description */}
                                            <div className="col-span-4 h-full overflow-hidden flex flex-col bg-card/50">
                                                <div className="p-4 border-b bg-muted/20">
                                                    <h2 className="font-semibold text-lg">
                                                        {activeProblem?.title || 'Problem Description'}
                                                    </h2>
                                                </div>
                                                <div className="flex-1 overflow-auto p-4 space-y-4">
                                                    <div>
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                                                            {activeProblem?.description || 'No description available.'}
                                                        </p>
                                                    </div>

                                                    {activeProblem?.testCases && Array.isArray(activeProblem.testCases) && activeProblem.testCases.length > 0 && (
                                                        <div className="bg-muted/30 rounded-lg p-3 border">
                                                            <h3 className="font-semibold mb-2 text-xs uppercase tracking-wider text-muted-foreground">Example</h3>
                                                            <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
                                                                {`Input: ${activeProblem.testCases[0].input}\nOutput: ${activeProblem.testCases[0].expectedOutput}`}
                                                            </pre>
                                                        </div>
                                                    )}

                                                    {result && (
                                                        <div className="mt-4">
                                                            <h3 className="font-semibold mb-2 text-sm">Execution Result</h3>
                                                            <div className={`p-3 rounded-lg text-sm border ${result.status === 'Accepted' || result.status === 'COMPLETED' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400'}`}>
                                                                <p className="font-bold flex items-center justify-between">
                                                                    {result.status}
                                                                    {result.time && <span className="text-xs font-normal opacity-70">{result.time}s</span>}
                                                                </p>
                                                                {result.output && (
                                                                    <div className="mt-2 text-xs bg-background/50 p-2 rounded border overflow-auto">
                                                                        <span className="opacity-50 block mb-1">Output:</span>
                                                                        <pre>{result.output}</pre>
                                                                    </div>
                                                                )}
                                                                {result.error && (
                                                                    <div className="mt-2 text-xs bg-background/50 p-2 rounded border border-red-500/20 overflow-auto text-red-600 dark:text-red-400">
                                                                        <span className="opacity-50 block mb-1">Error:</span>
                                                                        <pre>{result.error}</pre>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Code Editor */}
                                            <div className="col-span-8 h-full flex flex-col bg-[#1e1e1e]">
                                                <div className="h-full">
                                                    <CodeEditor
                                                        code={code}
                                                        onChange={(value) => setCode(value || '')}
                                                        language={activeSubmission?.language || "javascript"}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </motion.div>
                            )}

                            {/* Quiz Tab */}
                            {hasMCQ && activeTab === 'quiz' && (
                                <motion.div
                                    key="quiz"
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.1 }}
                                    className="absolute inset-0 flex flex-col"
                                >
                                    <TabsContent value="quiz" className="flex-1 m-0 h-full">
                                        <QuizComponent
                                            questions={session.mcqResponses.map((r: any) => r.question)}
                                            onSubmit={handleQuizSubmit}
                                            readonly={quizSubmitted}
                                            answers={quizAnswers}
                                            onAnswerSelect={(qId, aIdx) => {
                                                setQuizAnswers(prev => ({ ...prev, [qId]: aIdx }));
                                            }}
                                        />
                                    </TabsContent>
                                </motion.div>
                            )}

                            {/* Browser Tab */}
                            {activeTab === 'browser' && (
                                <motion.div
                                    key="browser"
                                    variants={pageVariants}
                                    initial="initial"
                                    animate="animate"
                                    exit="exit"
                                    transition={{ duration: 0.1 }}
                                    className="absolute inset-0 flex flex-col"
                                >
                                    <TabsContent value="browser" className="flex-1 m-0 h-full flex flex-col p-4 bg-muted/10">
                                        <div className="mb-2 text-sm text-muted-foreground flex items-center gap-2">
                                            <Globe className="w-4 h-4" />
                                            <span>Allowed resources for this assessment. URL bar is disabled.</span>
                                        </div>
                                        <div className="flex-1 border rounded-lg overflow-hidden shadow-sm bg-white">
                                            <BrowserMock initialUrl="https://www.w3schools.com" />
                                        </div>
                                    </TabsContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
