'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AddQuestionDialogProps {
    onSuccess: () => void;
}

interface FormData {
    question: string;
    option1: string;
    option2: string;
    option3: string;
    option4: string;
    correctAnswer: string;
    explanation: string;
    difficulty: string;
    tags: string;
}

export function AddQuestionDialog({ onSuccess }: AddQuestionDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>();
    const { toast } = useToast();

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const payload = {
                question: data.question,
                options: [data.option1, data.option2, data.option3, data.option4],
                correctAnswer: parseInt(data.correctAnswer, 10),
                explanation: data.explanation || undefined,
                difficulty: data.difficulty,
                tags: data.tags.split(',').map(t => t.trim()).filter(t => t),
            };

            await api.post('/admin/mcq', payload);

            toast({
                title: 'Success',
                description: 'Question created successfully',
            });

            reset();
            setOpen(false);
            onSuccess();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to create question',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white text-2xl">Add New Question</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                    {/* Question */}
                    <div className="space-y-2">
                        <Label htmlFor="question" className="text-white">
                            Question (Markdown supported)
                        </Label>
                        <Textarea
                            id="question"
                            {...register('question', { required: 'Question is required', minLength: { value: 10, message: 'Minimum 10 characters' } })}
                            rows={5}
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="Enter your question..."
                        />
                        {errors.question && (
                            <p className="text-red-400 text-sm">{errors.question.message}</p>
                        )}
                    </div>

                    {/* Options */}
                    <div className="space-y-4">
                        <Label className="text-white">Options</Label>
                        {[1, 2, 3, 4].map((num) => (
                            <div key={num} className="space-y-1">
                                <Label htmlFor={`option${num}`} className="text-slate-400 text-sm">
                                    Option {num}
                                </Label>
                                <Input
                                    id={`option${num}`}
                                    {...register(`option${num}` as any, { required: `Option ${num} is required` })}
                                    className="bg-slate-800 border-slate-700 text-white"
                                    placeholder={`Enter option ${num}...`}
                                />
                                {errors[`option${num}` as keyof FormData] && (
                                    <p className="text-red-400 text-sm">{errors[`option${num}` as keyof FormData]?.message}</p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Correct Answer */}
                    <div className="space-y-2">
                        <Label className="text-white">Correct Answer</Label>
                        <RadioGroup
                            onValueChange={(value) => setValue('correctAnswer', value)}
                            className="space-y-2"
                        >
                            {[0, 1, 2, 3].map((index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value={index.toString()}
                                        id={`answer-${index}`}
                                        className="border-slate-600 text-cyan-500"
                                    />
                                    <Label htmlFor={`answer-${index}`} className="text-slate-300 cursor-pointer">
                                        Option {index + 1}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {errors.correctAnswer && (
                            <p className="text-red-400 text-sm">{errors.correctAnswer.message}</p>
                        )}
                    </div>

                    {/* Explanation */}
                    <div className="space-y-2">
                        <Label htmlFor="explanation" className="text-white">
                            Explanation (Optional)
                        </Label>
                        <Textarea
                            id="explanation"
                            {...register('explanation')}
                            rows={3}
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="Explain why this is the correct answer..."
                        />
                    </div>

                    {/* Difficulty */}
                    <div className="space-y-2">
                        <Label htmlFor="difficulty" className="text-white">
                            Difficulty
                        </Label>
                        <Select onValueChange={(value) => setValue('difficulty', value)}>
                            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                                <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700">
                                <SelectItem value="EASY" className="text-white">Easy</SelectItem>
                                <SelectItem value="MEDIUM" className="text-white">Medium</SelectItem>
                                <SelectItem value="HARD" className="text-white">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.difficulty && (
                            <p className="text-red-400 text-sm">{errors.difficulty.message}</p>
                        )}
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label htmlFor="tags" className="text-white">
                            Tags (comma-separated)
                        </Label>
                        <Input
                            id="tags"
                            {...register('tags', { required: 'At least one tag is required' })}
                            className="bg-slate-800 border-slate-700 text-white"
                            placeholder="React, Hooks, useState"
                        />
                        {errors.tags && (
                            <p className="text-red-400 text-sm">{errors.tags.message}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                        >
                            {loading ? 'Creating...' : 'Create Question'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
