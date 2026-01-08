import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ProctoringEventData {
    type: 'EYE_GAZE' | 'TAB_SWITCH' | 'MOUSE_MOVE' | 'FULLSCREEN_EXIT';
    timestamp: number;
    x?: number;
    y?: number;
    [key: string]: any;
}

@Injectable()
export class ProctoringService {
    private readonly logger = new Logger(ProctoringService.name);

    constructor(private prisma: PrismaService) { }

    /**
     * Save a batch of proctoring events
     * CRITICAL: Creates a SINGLE row with events stored in JSONB array
     */
    async saveBatch(sessionId: string, events: ProctoringEventData[]) {
        // Analyze risk score
        const riskScore = this.analyzeRisk(events);
        const tabSwitches = events.filter((e) => e.type === 'TAB_SWITCH').length;

        // Retrieve current session to get warning count
        const session = await this.prisma.assessmentSession.findUnique({
            where: { id: sessionId },
            select: { warningCount: true, status: true, applicationId: true }
        });

        if (!session) {
            throw new Error('Session not found');
        }

        // Calculate new warning count
        const newWarningCount = session.warningCount + tabSwitches;
        let shouldTerminate = false;

        // Check if limit exceeded (Max 3 allowed, 4th kills it)
        if (newWarningCount > 3 && session.status !== 'TERMINATED' && session.status !== 'COMPLETED') {
            shouldTerminate = true;
            await this.prisma.$transaction([
                this.prisma.assessmentSession.update({
                    where: { id: sessionId },
                    data: {
                        status: 'TERMINATED',
                        terminatedReason: 'Excessive Tab Switching',
                        endTime: new Date(),
                    }
                }),
                this.prisma.application.update({
                    where: { id: session.applicationId },
                    data: { status: 'REJECTED' }
                })
            ]);
            this.logger.warn(`Session ${sessionId} TERMINATED due to excessive tab switching.`);
        } else if (tabSwitches > 0) {
            // Just update count if not terminating
            await this.prisma.assessmentSession.update({
                where: { id: sessionId },
                data: { warningCount: newWarningCount }
            });
        }

        // Create single ProctoringEvent row with all events in JSONB
        await this.prisma.proctoringEvent.create({
            data: {
                sessionId,
                events, // Prisma will store this as JSONB
                riskScore,
            },
        });

        this.logger.log(`Saved batch of ${events.length} events for session ${sessionId}. Warnings: ${newWarningCount}`);

        return {
            saved: true,
            eventCount: events.length,
            riskScore,
            shouldWarn: riskScore > 50,
            shouldTerminate,
            warningCount: newWarningCount,
            details: {
                tabSwitches,
                fullscreenExits: events.filter((e) => e.type === 'FULLSCREEN_EXIT').length
            }
        };
    }

    /**
     * Analyze risk score based on event patterns
     * Returns a score from 0-100 (higher = more suspicious)
     */
    analyzeRisk(events: ProctoringEventData[]): number {
        const tabSwitches = events.filter((e) => e.type === 'TAB_SWITCH').length;
        const fullscreenExits = events.filter((e) => e.type === 'FULLSCREEN_EXIT').length;

        let score = 0;

        // High risk: fullscreen exits (30 points each)
        score += fullscreenExits * 30;

        // Medium risk: tab switches (10 points each)
        score += tabSwitches * 10;

        // Cap at 100
        return Math.min(score, 100);
    }

    /**
     * Get all proctoring events for a session
     */
    async getSessionEvents(sessionId: string) {
        return this.prisma.proctoringEvent.findMany({
            where: { sessionId },
            orderBy: { batchTimestamp: 'asc' },
        });
    }

    /**
     * Get risk summary for a session
     */
    async getSessionRiskSummary(sessionId: string) {
        const events = await this.prisma.proctoringEvent.findMany({
            where: { sessionId },
        });

        const totalEvents = events.reduce((sum, e) => sum + (e.events as any[]).length, 0);
        const averageRiskScore = events.length > 0
            ? events.reduce((sum, e) => sum + e.riskScore, 0) / events.length
            : 0;
        const highRiskBatches = events.filter((e) => e.riskScore > 50).length;

        return {
            totalBatches: events.length,
            totalEvents,
            averageRiskScore,
            highRiskBatches,
            overallRisk: averageRiskScore > 50 ? 'HIGH' : averageRiskScore > 25 ? 'MEDIUM' : 'LOW',
        };
    }
}
