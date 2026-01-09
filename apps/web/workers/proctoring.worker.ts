
import { io, Socket } from 'socket.io-client';

// Event types
type WorkerEvent =
    | { type: 'INIT_SESSION'; sessionId: string; url: string }
    | { type: 'EVENT'; event: any }
    | { type: 'STOP' };

interface ProctoringEvent {
    type: 'EYE_GAZE' | 'TAB_SWITCH' | 'MOUSE_MOVE' | 'FULLSCREEN_EXIT';
    timestamp: number;
    x?: number;
    y?: number;
}

let socket: Socket | null = null;
let eventBuffer: ProctoringEvent[] = [];
let batchInterval: NodeJS.Timeout | null = null;
let sessionId: string | null = null;
let lastGazeTime = 0;

// Smart Sampling Configuration
const GAZE_THRESHOLD_PX = 50; // Minimum movement to record
const MAX_GAZE_INTERVAL_MS = 1000; // Force record every 1s even if still
let lastRecordedGaze: { x: number, y: number } | null = null;

self.onmessage = (e: MessageEvent<WorkerEvent>) => {
    const { type } = e.data;

    if (type === 'INIT_SESSION') {
        const { sessionId: id, url } = e.data as any;
        sessionId = id;

        if (socket) socket.disconnect();

        socket = io(`${url}/proctoring`, {
            transports: ['websocket'],
            forceNew: true
        });

        socket.on('connect', () => {
            console.log('✅ Worker: Socket connected');
        });

        socket.on('proctoring-warning', (data) => {
            self.postMessage({ type: 'WARNING', payload: data });
        });

        socket.on('session-terminated', (data) => {
            self.postMessage({ type: 'TERMINATED', payload: data });
        });

        // Start batch upload
        if (batchInterval) clearInterval(batchInterval);
        batchInterval = setInterval(uploadBatch, 5000);
    }
    else if (type === 'EVENT') {
        const { event } = e.data as any;
        processEvent(event);
    }
    else if (type === 'STOP') {
        cleanup();
    }
};

function processEvent(event: ProctoringEvent) {
    // Smart Sampling for Gaze
    if (event.type === 'EYE_GAZE' && event.x !== undefined && event.y !== undefined) {
        const now = Date.now();

        // Always record if enough time passed
        const isTimeTrigger = now - lastGazeTime > MAX_GAZE_INTERVAL_MS;

        // Record if changed significantly
        let isMotionTrigger = false;
        if (lastRecordedGaze) {
            const dx = Math.abs(event.x - lastRecordedGaze.x);
            const dy = Math.abs(event.y - lastRecordedGaze.y);
            if (dx > GAZE_THRESHOLD_PX || dy > GAZE_THRESHOLD_PX) {
                isMotionTrigger = true;
            }
        } else {
            isMotionTrigger = true; // First point
        }

        if (isTimeTrigger || isMotionTrigger) {
            eventBuffer.push(event);
            lastRecordedGaze = { x: event.x, y: event.y };
            lastGazeTime = now;
        }
    } else {
        // Always record non-gaze events (Tab switch, etc)
        eventBuffer.push(event);
    }
}

function uploadBatch() {
    if (!socket || !sessionId || eventBuffer.length === 0) return;

    socket.emit('proctoring-batch', {
        sessionId,
        events: eventBuffer
    });

    eventBuffer = [];
}

function cleanup() {
    if (socket) socket.disconnect();
    if (batchInterval) clearInterval(batchInterval);
    socket = null;
    eventBuffer = [];
    console.log('🛑 Worker: Stopped');
}
