'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, CheckCircle, AlertTriangle } from 'lucide-react';

interface CalibrationOverlayProps {
    onComplete: () => void;
    calibratePoint: (x: number, y: number) => Promise<void>;
    gazeRef: React.MutableRefObject<{ x: number; y: number }>;
}

export function CalibrationOverlay({ onComplete, calibratePoint, gazeRef }: CalibrationOverlayProps) {
    const [step, setStep] = useState(0); // 0-8: Training, 9: Validation
    const [clickCount, setClickCount] = useState(0);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [message, setMessage] = useState("Click each red dot 5 times while looking at it.");
    const dotRef = useRef<HTMLDivElement>(null);

    // 9-Point Grid Positions (Percentages)
    const points = [
        { x: 10, y: 10 }, { x: 50, y: 10 }, { x: 90, y: 10 },
        { x: 10, y: 50 }, { x: 50, y: 50 }, { x: 90, y: 50 },
        { x: 10, y: 90 }, { x: 50, y: 90 }, { x: 90, y: 90 },
    ];

    // High-performance Gaze Dot Animation
    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            if (dotRef.current) {
                const { x, y } = gazeRef.current;
                dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    const handlePointClick = async (index: number, e: React.MouseEvent) => {
        const { clientX, clientY } = e.nativeEvent;
        await calibratePoint(clientX, clientY);

        const newClickCount = clickCount + 1;
        setClickCount(newClickCount);

        // Required 5 clicks per point
        if (newClickCount >= 5) {
            setClickCount(0); // Reset for next point

            if (index < 8) {
                setStep(step + 1);
            } else {
                // Training done, move to Validation
                setStep(9);
                setMessage("Validation: Stare at the green target for 3 seconds.");
                startValidation();
            }
        }
    };

    const startValidation = async () => {
        // Wait 1s before starting to let eyes settle
        setTimeout(() => {
            const validationStart = Date.now();
            const measurements: number[] = [];

            // Center of screen
            const targetX = window.innerWidth / 2;
            const targetY = window.innerHeight / 2;

            const interval = setInterval(() => {
                const gaze = gazeRef.current;
                const distance = Math.hypot(gaze.x - targetX, gaze.y - targetY);
                measurements.push(distance);

                if (Date.now() - validationStart > 3000) {
                    clearInterval(interval);
                    const avgDistance = measurements.reduce((a, b) => a + b, 0) / measurements.length;

                    // Simple accuracy score: <100px error is 100%, >500px error is 0%
                    const score = Math.max(0, Math.min(100, 100 - (avgDistance - 100) / 4));
                    setAccuracy(Math.round(score));
                }
            }, 100);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-white">
            {/* Gaze Dot */}
            <div
                ref={dotRef}
                className="fixed top-0 left-0 w-4 h-4 bg-red-500 rounded-full pointer-events-none shadow-[0_0_10px_red] transition-transform duration-75 ease-out will-change-transform"
                style={{ zIndex: 60 }}
            />

            {/* Instruction */}
            <div className="absolute top-10 text-center">
                <h1 className="text-3xl font-bold mb-2">Eye Tracking Calibration</h1>
                <p className="text-xl text-gray-300">{message}</p>
            </div>

            {/* Training Points */}
            {step < 9 && (
                points.map((p, i) => (
                    <button
                        key={i}
                        disabled={i !== step}
                        onClick={(e) => handlePointClick(i, e)}
                        className={`absolute w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${i === step
                            ? 'bg-red-500 border-white scale-125 cursor-crosshair'
                            : i < step
                                ? 'bg-green-500 border-green-500 opacity-50'
                                : 'bg-gray-700 border-gray-700 opacity-30'
                            }`}
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            transform: 'translate(-50%, -50%)',
                            opacity: i === step ? 0.2 + (clickCount * 0.16) : undefined // Fade in as you click
                        }}
                    >
                        {/* Show click progress */}
                        {i === step && clickCount > 0 && <span className="text-xs font-bold text-white">{clickCount}</span>}
                    </button>
                ))
            )}

            {/* Validation Target */}
            {step === 9 && accuracy === null && (
                <div className="w-16 h-16 bg-green-500 rounded-full animate-ping" />
            )}

            {/* Result */}
            {accuracy !== null && (
                <Card className="p-8 bg-zinc-900 border-zinc-800 text-center space-y-6">
                    <div className="flex justify-center">
                        {accuracy >= 80 ? (
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        ) : (
                            <AlertTriangle className="w-16 h-16 text-yellow-500" />
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-2">Accuracy: {accuracy}%</h2>
                        <p className="text-zinc-400">
                            {accuracy >= 80
                                ? "Great! Your eye tracking is calibrated."
                                : "Calibration accuracy is too low. Please try again."}
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        {accuracy < 80 && (
                            <Button
                                variant="outline"
                                onClick={() => { setStep(0); setClickCount(0); setAccuracy(null); setMessage("Click each red dot 5 times while looking at it."); }}
                            >
                                Recalibrate
                            </Button>
                        )}
                        <Button
                            disabled={accuracy < 80}
                            onClick={onComplete}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            Start Assessment
                        </Button>
                    </div>
                </Card>
            )}
        </div>
    );
}
