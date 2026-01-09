'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Target, CheckCircle, AlertTriangle } from 'lucide-react';

interface CalibrationOverlayProps {
    onComplete: () => void;
    calibratePoint: (x: number, y: number) => Promise<void>;
    gazeRef: React.MutableRefObject<{ x: number; y: number }>;
    isTracking: boolean;
}

export function CalibrationOverlay({ onComplete, calibratePoint, gazeRef, isTracking }: CalibrationOverlayProps) {
    const [step, setStep] = useState(-1); // -1: Pre-check, 0-8: Training, 9: Validation
    const [clickCount, setClickCount] = useState(0);
    const [accuracy, setAccuracy] = useState<number | null>(null);
    const [message, setMessage] = useState("");
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
                // Only move if tracking is active to prevent jumping at start
                if (isTracking || (x !== 0 && y !== 0)) {
                    dotRef.current.style.transform = `translate(${x}px, ${y}px)`;
                    dotRef.current.style.opacity = '1';
                } else {
                    dotRef.current.style.opacity = '0';
                }
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isTracking]);

    const startCalibration = () => {
        setStep(0);
        setMessage("Click each red dot 5 times while looking at it.");
    };

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
                className="fixed top-0 left-0 w-4 h-4 bg-red-500 rounded-full pointer-events-none shadow-[0_0_10px_red] transition-transform duration-75 ease-out will-change-transform opacity-0"
                style={{ zIndex: 60 }}
            />

            {/* Pre-check Screen */}
            {step === -1 && (
                <Card className="max-w-md w-full p-8 bg-zinc-950 border-zinc-800 space-y-6">
                    <div className="text-center space-y-2">
                        <Target className="w-12 h-12 text-purple-500 mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Calibration Setup</h1>
                        <p className="text-gray-400">Follow these steps for best results</p>
                    </div>

                    {!isTracking ? (
                        <div className="flex flex-col items-center justify-center py-6 space-y-4">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-400 animate-pulse">Initializing Camera & AI Models...</p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-4 text-sm text-gray-300">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center flex-shrink-0">1</div>
                                    <p>Sit comfortably about <strong>50cm (arm's length)</strong> from the screen.</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center flex-shrink-0">2</div>
                                    <p>Ensure your face is <strong>evenly lit</strong> (no bright windows behind you).</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center flex-shrink-0">3</div>
                                    <p>Keep your head <strong>still</strong> and move only your eyes.</p>
                                </div>
                            </div>

                            <Button onClick={startCalibration} className="w-full bg-purple-600 hover:bg-purple-700">
                                Start Calibration
                            </Button>
                        </>
                    )}
                </Card>
            )}

            {/* Instruction */}
            {step >= 0 && (
                <div className="absolute top-10 text-center">
                    <h1 className="text-3xl font-bold mb-2">Eye Tracking Calibration</h1>
                    <p className="text-xl text-gray-300">{message}</p>
                </div>
            )}

            {/* Training Points */}
            {step >= 0 && step < 9 && (
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
                        {accuracy >= 60 ? (
                            <CheckCircle className="w-16 h-16 text-green-500" />
                        ) : (
                            <AlertTriangle className="w-16 h-16 text-yellow-500" />
                        )}
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold mb-2">Accuracy: {accuracy}%</h2>
                        <p className="text-zinc-400">
                            {accuracy >= 60
                                ? "Great! Your eye tracking is calibrated."
                                : "Calibration accuracy is too low. Please try again."}
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        {accuracy < 60 && (
                            <Button
                                variant="outline"
                                onClick={() => { setStep(0); setClickCount(0); setAccuracy(null); setMessage("Click each red dot 5 times while looking at it."); }}
                            >
                                Recalibrate
                            </Button>
                        )}
                        <Button
                            disabled={accuracy < 60}
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
