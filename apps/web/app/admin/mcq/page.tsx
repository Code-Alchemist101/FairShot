'use client';

import { useState, useEffect } from 'react';
import { QuestionCard } from '@/components/admin/QuestionCard';
import { AddQuestionDialog } from '@/components/admin/AddQuestionDialog';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface MCQQuestion {
    id: string;
    question: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    tags: string[];
}

export default function QuestionBankPage() {
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await api.get('/admin/mcq');
            setQuestions(response.data.questions);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to fetch questions',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/admin/mcq/${id}`);
            toast({
                title: 'Success',
                description: 'Question deleted successfully',
            });
            fetchQuestions();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to delete question',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Question Bank</h1>
                    <p className="text-slate-400">
                        Manage MCQ questions for AI-generated assessments
                    </p>
                </div>
                <AddQuestionDialog onSuccess={fetchQuestions} />
            </div>

            {/* Questions Grid */}
            {questions.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-slate-400 text-lg mb-4">No questions yet</p>
                    <p className="text-slate-500 text-sm">
                        Click "Add Question" to create your first question
                    </p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {questions.map((question) => (
                        <QuestionCard
                            key={question.id}
                            id={question.id}
                            question={question.question}
                            difficulty={question.difficulty}
                            tags={question.tags}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
