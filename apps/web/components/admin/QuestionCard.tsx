'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
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

interface QuestionCardProps {
    id: string;
    question: string;
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    tags: string[];
    onDelete: (id: string) => void;
}

const difficultyColors = {
    EASY: 'bg-green-500/10 text-green-400 border-green-500/20',
    MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    HARD: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export function QuestionCard({ id, question, difficulty, tags, onDelete }: QuestionCardProps) {
    // Truncate question to 100 characters
    const truncatedQuestion = question.length > 100 ? question.substring(0, 100) + '...' : question;

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-all duration-300">
            <div className="space-y-4">
                {/* Question Text */}
                <p className="text-white text-base leading-relaxed">{truncatedQuestion}</p>

                {/* Difficulty and Tags */}
                <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={`${difficultyColors[difficulty]} border`}>
                        {difficulty}
                    </Badge>
                    {tags.map((tag, index) => (
                        <Badge
                            key={index}
                            className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20 border"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>

                {/* Delete Button */}
                <div className="flex justify-end">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-slate-900 border-slate-700">
                            <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Question?</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                    This action cannot be undone. This will permanently delete the question from the database.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-800 text-white border-slate-700 hover:bg-slate-700">
                                    Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => onDelete(id)}
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
