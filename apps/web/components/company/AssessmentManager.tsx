'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, Database, Trash2, Save, FileCode, CheckCircle, Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface AssessmentManagerProps {
    jobId: string;
    initialMcqs: any[];
    initialCoding: any[];
    onUpdate: () => void;
}

export function AssessmentManager({ jobId, initialMcqs, initialCoding, onUpdate }: AssessmentManagerProps) {
    const { toast } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<{ mcqs: any[], coding: any[] }>({ mcqs: [], coding: [] });

    // Existing questions (displayed in list)
    // We rely on parent to pass updated initial* props after save

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            const response = await api.post(`/jobs/${jobId}/generate-questions`);
            setGeneratedQuestions(response.data);
            setReviewModalOpen(true);
        } catch (error) {
            toast({
                title: 'Generation Failed',
                description: 'AI could not generate questions at this time.',
                variant: 'destructive'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.post(`/jobs/${jobId}/save-questions`, generatedQuestions);
            toast({
                title: 'Saved!',
                description: 'Questions have been added to the assessment pool.',
            });
            setReviewModalOpen(false);
            onUpdate(); // Trigger refresh in parent
        } catch (error) {
            toast({
                title: 'Save Failed',
                description: 'Could not save the questions.',
                variant: 'destructive'
            });
        }
    };

    const removeGeneratedMcq = (index: number) => {
        setGeneratedQuestions(prev => ({
            ...prev,
            mcqs: prev.mcqs.filter((_, i) => i !== index)
        }));
    };

    const removeGeneratedCoding = (index: number) => {
        setGeneratedQuestions(prev => ({
            ...prev,
            coding: prev.coding.filter((_, i) => i !== index)
        }));
    };

    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [manualType, setManualType] = useState<'MCQ' | 'CODING'>('MCQ');

    // Manual Entry State
    const [newMcq, setNewMcq] = useState({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', difficulty: 'MEDIUM' });
    const [newCoding, setNewCoding] = useState({ title: '', description: '', testInput: '', testOutput: '', difficulty: 'MEDIUM' });

    const handleAddManual = () => {
        if (manualType === 'MCQ') {
            if (!newMcq.question || newMcq.options.some(o => !o)) return;
            setGeneratedQuestions(prev => ({
                ...prev,
                mcqs: [...prev.mcqs, { ...newMcq, tags: ['Manual'] }]
            }));
            setReviewModalOpen(true);
            setManualModalOpen(false);
            setNewMcq({ question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '', difficulty: 'MEDIUM' });
        } else {
            if (!newCoding.title || !newCoding.description) return;
            setGeneratedQuestions(prev => ({
                ...prev,
                coding: [...prev.coding, {
                    ...newCoding,
                    tags: ['Manual'],
                    testCases: [{ input: newCoding.testInput, expectedOutput: newCoding.testOutput }]
                }]
            }));
            setReviewModalOpen(true);
            setManualModalOpen(false);
            setNewCoding({ title: '', description: '', testInput: '', testOutput: '', difficulty: 'MEDIUM' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Assessment Questions</h2>
                    <p className="text-sm text-muted-foreground">Manage the pool of questions used for candidates.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setManualModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Manually
                    </Button>
                    <Button onClick={handleGenerate} disabled={isGenerating}>
                        {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Generate with AI
                    </Button>
                </div>
            </div>

            {/* Existing Questions List */}
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-blue-500" />
                            Question Pool ({initialMcqs.length} MCQ + {initialCoding.length} Coding)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {initialMcqs.length === 0 && initialCoding.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed">
                                No questions yet. Generate with AI or add manually!
                            </div>
                        )}

                        {initialMcqs.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Multiple Choice</h3>
                                {initialMcqs.map((q, i) => (
                                    <div key={q.id || i} className="p-3 border rounded-md text-sm flex justify-between items-start bg-slate-50/50">
                                        <div>
                                            <span className="font-medium mr-2">{i + 1}.</span>
                                            {q.question}
                                            <div className="flex gap-2 mt-1">
                                                {q.tags?.map((t: string) => <Badge key={t} variant="secondary" className="text-[10px] h-5">{t}</Badge>)}
                                                <Badge variant="outline" className="text-[10px] h-5">{q.difficulty}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {initialCoding.length > 0 && (
                            <div className="space-y-2 pt-4 border-t">
                                <h3 className="font-semibold text-sm text-slate-500 uppercase tracking-wider">Coding Problems</h3>
                                {initialCoding.map((p, i) => (
                                    <div key={p.id || i} className="p-3 border rounded-md text-sm flex justify-between items-start bg-slate-50/50">
                                        <div className="w-full">
                                            <div className="flex items-center gap-2 mb-1">
                                                <FileCode className="w-4 h-4 text-purple-500" />
                                                <span className="font-medium">{p.title}</span>
                                            </div>
                                            <p className="text-slate-500 line-clamp-2 text-xs mb-2">{p.description}</p>
                                            <div className="flex gap-2">
                                                {p.tags?.map((t: string) => <Badge key={t} variant="secondary" className="text-[10px] h-5">{t}</Badge>)}
                                                <Badge variant="outline" className="text-[10px] h-5">{p.difficulty}</Badge>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Manual Entry Modal */}
            <Dialog open={manualModalOpen} onOpenChange={setManualModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Manual Question</DialogTitle>
                        <DialogDescription>Create a custom question for this job.</DialogDescription>
                    </DialogHeader>

                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={manualType === 'MCQ' ? 'default' : 'outline'}
                            onClick={() => setManualType('MCQ')}
                            className="flex-1"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Multiple Choice
                        </Button>
                        <Button
                            variant={manualType === 'CODING' ? 'default' : 'outline'}
                            onClick={() => setManualType('CODING')}
                            className="flex-1"
                        >
                            <FileCode className="w-4 h-4 mr-2" /> Coding Problem
                        </Button>
                    </div>

                    {manualType === 'MCQ' ? (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium">Question</label>
                                <Input
                                    value={newMcq.question}
                                    onChange={(e) => setNewMcq({ ...newMcq, question: e.target.value })}
                                    placeholder="Enter your question here..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Options (Select Correct)</label>
                                {newMcq.options.map((opt, i) => (
                                    <div key={i} className="flex gap-2">
                                        <div
                                            className={`w-6 flex items-center justify-center border rounded cursor-pointer ${newMcq.correctAnswer === i ? 'bg-green-500 text-white border-green-500' : 'bg-slate-100'}`}
                                            onClick={() => setNewMcq({ ...newMcq, correctAnswer: i })}
                                        >
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <Input
                                            value={opt}
                                            onChange={(e) => {
                                                const newOpts = [...newMcq.options];
                                                newOpts[i] = e.target.value;
                                                setNewMcq({ ...newMcq, options: newOpts });
                                            }}
                                            placeholder={`Option ${String.fromCharCode(65 + i)}`}
                                            className="flex-1 h-8 text-sm"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div>
                                <label className="text-xs font-medium">Explanation</label>
                                <Textarea
                                    value={newMcq.explanation}
                                    onChange={(e) => setNewMcq({ ...newMcq, explanation: e.target.value })}
                                    placeholder="Why is this the answer?"
                                    className="h-20"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-medium">Title</label>
                                <Input
                                    value={newCoding.title}
                                    onChange={(e) => setNewCoding({ ...newCoding, title: e.target.value })}
                                    placeholder="Function Name (e.g., twoSum)"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium">Description</label>
                                <Textarea
                                    value={newCoding.description}
                                    onChange={(e) => setNewCoding({ ...newCoding, description: e.target.value })}
                                    placeholder="Problem statement..."
                                    className="h-32"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium">Sample Input</label>
                                    <Input
                                        value={newCoding.testInput}
                                        onChange={(e) => setNewCoding({ ...newCoding, testInput: e.target.value })}
                                        placeholder="'hello'"
                                        className="font-mono text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium">Expected Output</label>
                                    <Input
                                        value={newCoding.testOutput}
                                        onChange={(e) => setNewCoding({ ...newCoding, testOutput: e.target.value })}
                                        placeholder="'olleh'"
                                        className="font-mono text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setManualModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddManual}>Add to Review</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Review Modal */}
            <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review Questions</DialogTitle>
                        <DialogDescription>
                            Review the questions (AI Generated or Manual) before saving.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <section>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                Pending MCQs ({generatedQuestions.mcqs.length})
                            </h3>
                            <div className="space-y-3">
                                {generatedQuestions.mcqs.map((q, i) => (
                                    <div key={i} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 group">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="font-medium flex gap-2">
                                                    {q.question}
                                                    {q.tags?.includes('Manual') && <Badge variant="secondary" className="h-5 text-[10px]">Manual</Badge>}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 pl-4 text-sm text-slate-600">
                                                    {q.options.map((opt: string, idx: number) => (
                                                        <div key={idx} className={`p-1 px-2 rounded ${idx === q.correctAnswer ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : ''}`}>
                                                            {String.fromCharCode(65 + idx)}) {opt}
                                                        </div>
                                                    ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground italic mt-2">Exp: {q.explanation}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-red-500 opacity-50 group-hover:opacity-100" onClick={() => removeGeneratedMcq(i)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="pt-4 border-t">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                Pending Coding Problems ({generatedQuestions.coding.length})
                            </h3>
                            <div className="space-y-3">
                                {generatedQuestions.coding.map((p, i) => (
                                    <div key={i} className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 group">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="space-y-2 flex-1">
                                                <div className="font-medium flex gap-2">
                                                    {p.title}
                                                    {p.tags?.includes('Manual') && <Badge variant="secondary" className="h-5 text-[10px]">Manual</Badge>}
                                                </div>
                                                <p className="text-sm text-slate-600 whitespace-pre-line">{p.description}</p>
                                                <div className="bg-slate-100 dark:bg-black p-2 rounded text-xs font-mono">
                                                    Input: {p.testCases?.[0]?.input} | Output: {p.testCases?.[0]?.expectedOutput}
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="text-red-500 opacity-50 group-hover:opacity-100" onClick={() => removeGeneratedCoding(i)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setReviewModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} className="gap-2">
                            <Save className="w-4 h-4" /> Save Everything
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
