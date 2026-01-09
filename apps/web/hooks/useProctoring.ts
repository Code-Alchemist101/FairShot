'use client';

import { useEffect, useRef, useState } from 'react';

interface ProctoringEvent {
    type: 'EYE_GAZE' | 'TAB_SWITCH' | 'MOUSE_MOVE' | 'FULLSCREEN_EXIT';
    timestamp: number;
    x?: number;
    y?: number;
}

interface UseProctoringOptions {
    sessionId: string;
    enabled?: boolean;
    onGazeUpdate?: (x: number, y: number) => void;
}

export function useProctoring({ sessionId, enabled = true, onGazeUpdate }: UseProctoringOptions) {
    const [isTracking, setIsTracking] = useState(false);
    const [warning, setWarning] = useState('');
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;

        // Initialize Worker
        if (!workerRef.current) {
            workerRef.current = new Worker(new URL('../workers/proctoring.worker.ts', import.meta.url));

            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
            workerRef.current.postMessage({
                type: 'INIT_SESSION',
                sessionId,
                url: wsUrl
            });

            workerRef.current.onmessage = (e) => {
                const { type, payload } = e.data;
                if (type === 'WARNING') {
                    setWarning(payload.message);
                    setTimeout(() => setWarning(''), 5000);
                } else if (type === 'TERMINATED') {
                    alert(`Assessment Terminated: ${payload.reason}`);
                    window.location.href = '/dashboard';
                }
            };
        }

        // Initialize WebGazer (client-side only behavior)
        const initWebGazer = async () => {
            try {
                // Request camera (light check)
                try {
                    await navigator.mediaDevices.getUserMedia({ video: true });
                } catch (err) {
                    console.error('Camera permission denied:', err);
                    setWarning('Camera access required for proctoring. Please enable it.');
                    return;
                }

                const webgazer = (await import('webgazer')).default;

                // We keep the listener simple: just forward data to worker
                await webgazer
                    .setGazeListener((data: any) => {
                        if (data) {
                            // Forward RAW data to worker for sampling
                            if (workerRef.current) {
                                workerRef.current.postMessage({
                                    type: 'EVENT',
                                    event: {
                                        type: 'EYE_GAZE',
                                        timestamp: Date.now(),
                                        x: data.x,
                                        y: data.y,
                                    }
                                });
                            }

                            // UI Update (Visuals only, no logic)
                            if (onGazeUpdate) onGazeUpdate(data.x, data.y);
                        }
                    })
                    .begin();

                webgazer.showVideoPreview(false);
                webgazer.showPredictionPoints(false);
                setIsTracking(true);
            } catch (error) {
                console.error('Failed to initialize WebGazer:', error);
            }
        };

        if (enabled) {
            initWebGazer();
        }

        // Event Listeners for Worker
        const handleVisibilityChange = () => {
            if (document.hidden && workerRef.current) {
                workerRef.current.postMessage({
                    type: 'EVENT',
                    event: { type: 'TAB_SWITCH', timestamp: Date.now() }
                });
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement && workerRef.current) {
                workerRef.current.postMessage({
                    type: 'EVENT',
                    event: { type: 'FULLSCREEN_EXIT', timestamp: Date.now() }
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);

            // Cleanup Worker
            if (workerRef.current) {
                workerRef.current.postMessage({ type: 'STOP' });
                workerRef.current.terminate();
                workerRef.current = null;
            }

            // Cleanup WebGazer
            if (typeof window !== 'undefined') {
                import('webgazer').then((module) => {
                    try {
                        if (module.default?.end) module.default.end();
                    } catch (e) { /* ignore */ }
                }).catch(() => { });
            }
        };
    }, [sessionId, enabled]);

    return {
        isTracking,
        warning,
        clearWarning: () => setWarning(''),
        calibratePoint: async (x: number, y: number) => {
            if (typeof window !== 'undefined') {
                const webgazer = (await import('webgazer')).default;
                webgazer.recordScreenPosition(x, y, 'click');
            }
        }
    };
}
