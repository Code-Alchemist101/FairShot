'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface AssessmentTimerProps {
    startTime: string | Date;
    durationMinutes: number;
    isCalibrated: boolean;
    submitting: boolean;
    onTimeExpire: () => void;
}

export function AssessmentTimer({ startTime, durationMinutes, isCalibrated, submitting, onTimeExpire }: AssessmentTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(3600);

    useEffect(() => {
        if (!startTime) return;

        const calculateTimeLeft = () => {
            const start = new Date(startTime).getTime();
            const durationMs = (durationMinutes || 60) * 60 * 1000;
            const endTime = start + durationMs;
            const now = Date.now();
            const diff = Math.floor((endTime - now) / 1000);
            return Math.max(0, diff);
        };

        // Initialize timer
        const initialTime = calculateTimeLeft();
        setTimeRemaining(initialTime);

        // Don't start countdown until calibration passed
        if (!isCalibrated) return;

        const interval = setInterval(() => {
            const left = calculateTimeLeft();
            setTimeRemaining(left);

            // Auto-submit if time runs out
            if (left <= 0 && !submitting) {
                onTimeExpire();
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [startTime, durationMinutes, isCalibrated, submitting, onTimeExpire]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-2 text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md border">
            <Clock className="w-4 h-4" />
            <span className="font-mono text-lg font-medium text-foreground">{formatTime(timeRemaining)}</span>
        </div>
    );
}
