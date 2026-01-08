'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface MCQQuestion {
    id: string;
    question: string;
    options: string[];
    difficulty: string;
    tags: string[];
}

interface QuizComponentProps {
    questions: MCQQuestion[];
    onSubmit: (answers: Record<string, number>) => Promise<void>;
    readonly?: boolean;
    existingAnswers?: Record<string, number>;
}

const difficultyColors = {
    EASY: 'bg-green-500/10 text-green-400 border-green-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    HARD: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function QuizComponent({
    questions,
    onSubmit,
    readonly = false,
    answers,
    onAnswerSelect
}: {
    questions: MCQQuestion[];
    onSubmit: (answers: Record<string, number>) => Promise<void>;
    readonly?: boolean;
    answers: Record<string, number>;
    onAnswerSelect: (questionId: string, answerIndex: number) => void;
}) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [submitting, setSubmitting] = useState(false);

    const currentQuestion = questions[currentIndex];
    const allAnswered = questions.every(q => answers[q.id] !== undefined);

    const handleAnswerSelect = (answerIndex: number) => {
        if (readonly) return;
        onAnswerSelect(currentQuestion.id, answerIndex);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            await onSubmit(answers);
        } finally {
            setSubmitting(false);
        }
    };

    if (!currentQuestion) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-slate-400">No questions available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-900 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-white">
                        Question {currentIndex + 1} of {questions.length}
                    </h2>
                    <Badge className={`${difficultyColors[currentQuestion.difficulty as keyof typeof difficultyColors]} border`}>
                        {currentQuestion.difficulty}
                    </Badge>
                    {readonly && (
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 border">
                            Review Mode
                        </Badge>
                    )}
                </div>
                <div className="flex gap-2">
                    {currentQuestion.tags.map((tag, index) => (
                        <Badge
                            key={index}
                            className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 border"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Progress Indicator */}
            <div className="flex gap-2 mb-6">
                {questions.map((q, index) => (
                    <div
                        key={q.id}
                        className={`h-2 flex-1 rounded-full ${answers[q.id] !== undefined
                            ? 'bg-cyan-500'
                            : index === currentIndex
                                ? 'bg-slate-600'
                                : 'bg-slate-700'
                            }`}
                    />
                ))}
            </div>

            {/* Question */}
            <div className="flex-1 overflow-y-auto mb-6">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
                    <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                        {currentQuestion.question}
                    </p>
                </div>

                {/* Options */}
                <RadioGroup
                    key={currentQuestion.id}
                    value={answers[currentQuestion.id]?.toString()}
                    onValueChange={(value) => handleAnswerSelect(parseInt(value, 10))}
                    className="space-y-3"
                    disabled={readonly}
                >
                    {currentQuestion.options.map((option, index) => (
                        <div
                            key={index}
                            className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${readonly ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'
                                } ${answers[currentQuestion.id] === index
                                    ? 'bg-cyan-500/10 border-cyan-500/40'
                                    : 'bg-slate-800/30 border-slate-700 hover:border-slate-600'
                                }`}
                        >
                            <RadioGroupItem
                                value={index.toString()}
                                id={`option-${currentQuestion.id}-${index}`}
                                className="border-slate-600 text-cyan-500"
                                disabled={readonly}
                            />
                            <Label
                                htmlFor={`option-${currentQuestion.id}-${index}`}
                                className={`flex-1 text-white ${readonly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                                {option}
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                <div className="flex gap-3">
                    {currentIndex < questions.length - 1 ? (
                        <Button
                            onClick={handleNext}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : readonly ? (
                        <div className="text-slate-400 text-sm">
                            Quiz already submitted
                        </div>
                    ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    disabled={!allAnswered || submitting}
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-slate-700">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-white">Submit Quiz?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-slate-400">
                                        Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                                        Review Answers
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleSubmit}
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        Submit
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {/* Answer Status */}
            {!allAnswered && (
                <p className="text-center text-slate-400 text-sm mt-4">
                    {questions.filter(q => answers[q.id] !== undefined).length} of {questions.length} questions answered
                </p>
            )}
        </div>
    );
}
