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
import { motion, AnimatePresence } from 'framer-motion';

const questionVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

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
        <div className="flex flex-col h-full bg-background p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                        Question {currentIndex + 1} of {questions.length}
                    </h2>
                    <Badge className={`${difficultyColors[currentQuestion.difficulty as keyof typeof difficultyColors]} border`}>
                        {currentQuestion.difficulty}
                    </Badge>
                    {readonly && (
                        <Badge variant="outline" className="border-blue-500/50 text-blue-500">
                            Review Mode
                        </Badge>
                    )}
                </div>
                <div className="flex gap-2">
                    {currentQuestion.tags.map((tag, index) => (
                        <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
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
                        className={`h-2 flex-1 rounded-full transition-colors duration-300 ${answers[q.id] !== undefined
                            ? 'bg-primary'
                            : index === currentIndex
                                ? 'bg-primary/50'
                                : 'bg-muted'
                            }`}
                    />
                ))}
            </div>

            {/* Question */}
            <div className="flex-1 overflow-y-auto mb-6 relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        variants={questionVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ duration: 0.1 }}
                    >
                        <div className="bg-card border shadow-sm rounded-xl p-6 mb-6">
                            <p className="text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                {currentQuestion.question}
                            </p>
                        </div>

                        {/* Options */}
                        <RadioGroup
                            value={answers[currentQuestion.id]?.toString()}
                            onValueChange={(value) => handleAnswerSelect(parseInt(value, 10))}
                            className="space-y-3"
                            disabled={readonly}
                        >
                            {currentQuestion.options.map((option, index) => (
                                <motion.div
                                    key={index}
                                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all ${readonly ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:bg-accent hover:border-accent'
                                        } ${answers[currentQuestion.id] === index
                                            ? 'bg-primary/10 border-primary ring-1 ring-primary'
                                            : 'bg-card border-input'
                                        }`}
                                    onClick={() => handleAnswerSelect(index)}
                                >
                                    <RadioGroupItem
                                        value={index.toString()}
                                        id={`option-${currentQuestion.id}-${index}`}
                                        className="text-primary pointer-events-none" // Make pointer events none to ensure parent click captures it
                                        disabled={readonly}
                                    />
                                    <Label
                                        htmlFor={`option-${currentQuestion.id}-${index}`}
                                        className={`flex-1 ${readonly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {option}
                                    </Label>
                                </motion.div>
                            ))}
                        </RadioGroup>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between pt-4 border-t mt-auto">
                <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentIndex === 0}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                </Button>

                <div className="flex gap-3">
                    {currentIndex < questions.length - 1 ? (
                        <Button
                            onClick={handleNext}
                        >
                            Next
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : readonly ? (
                        <div className="text-muted-foreground text-sm flex items-center">
                            Quiz already submitted
                        </div>
                    ) : (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    disabled={!allAnswered || submitting}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Submit Quiz?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to submit your quiz? You won't be able to change your answers after submission.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Review Answers
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleSubmit}
                                        className="bg-green-600 hover:bg-green-700"
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
                <p className="text-center text-muted-foreground text-sm mt-4">
                    {questions.filter(q => answers[q.id] !== undefined).length} of {questions.length} questions answered
                </p>
            )}
        </div>
    );
}
