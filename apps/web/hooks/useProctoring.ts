'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface ProctoringEvent {
    type: 'EYE_GAZE' | 'TAB_SWITCH' | 'MOUSE_MOVE' | 'FULLSCREEN_EXIT';
    timestamp: number;
    x?: number;
    y?: number;
}

interface UseProctoringOptions {
    sessionId: string;
    enabled?: boolean;
}

export function useProctoring({ sessionId, enabled = true }: UseProctoringOptions) {
    const [isTracking, setIsTracking] = useState(false);
    const [warning, setWarning] = useState('');
    const socketRef = useRef<Socket | null>(null);
    const eventsRef = useRef<ProctoringEvent[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (!enabled || typeof window === 'undefined') return;

        // Initialize WebSocket
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';
        socketRef.current = io(`${wsUrl}/proctoring`, {
            transports: ['websocket'],
        });



        socketRef.current.on('proctoring-warning', (data: { message: string; riskScore: number }) => {
            setWarning(data.message);
            setTimeout(() => setWarning(''), 5000);
        });

        // Initialize WebGazer (client-side only)
        const initWebGazer = async () => {
            try {
                const webgazer = (await import('webgazer')).default;
                let lastGazeTime = 0;

                await webgazer
                    .setGazeListener((data: any) => {
                        const now = Date.now();
                        // Throttle: capture only if 200ms (5 FPS) has passed
                        if (data && now - lastGazeTime > 200) {
                            lastGazeTime = now;
                            eventsRef.current.push({
                                type: 'EYE_GAZE',
                                timestamp: now,
                                x: data.x,
                                y: data.y,
                            });
                        }
                    })
                    .begin();

                // Hide video preview and prediction points
                webgazer.showVideoPreview(false);
                webgazer.showPredictionPoints(false);

                setIsTracking(true);
            } catch (error) {
                console.error('Failed to initialize WebGazer:', error);
            }
        };

        initWebGazer();

        // Listen for tab switches
        const handleVisibilityChange = () => {
            if (document.hidden) {
                eventsRef.current.push({
                    type: 'TAB_SWITCH',
                    timestamp: Date.now(),
                });
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Listen for fullscreen exits
        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                eventsRef.current.push({
                    type: 'FULLSCREEN_EXIT',
                    timestamp: Date.now(),
                });
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);

        // Send batch every 5 seconds
        intervalRef.current = setInterval(() => {
            if (eventsRef.current.length > 0 && socketRef.current) {
                socketRef.current.emit('proctoring-batch', {
                    sessionId,
                    events: eventsRef.current,
                });

                eventsRef.current = [];
            }
        }, 5000);

        // Cleanup
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }

            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);

            if (socketRef.current) {
                socketRef.current.disconnect();
            }

            // Stop WebGazer safely
            if (typeof window !== 'undefined') {
                import('webgazer').then((module) => {
                    try {
                        if (module.default && typeof module.default.end === 'function') {
                            module.default.end();
                        }
                    } catch (error) {
                        console.debug('WebGazer cleanup skipped:', error);
                    }
                }).catch(() => { });
            }
        };
    }, [sessionId, enabled]);

    return {
        isTracking,
        warning,
        clearWarning: () => setWarning(''),
    };
}
