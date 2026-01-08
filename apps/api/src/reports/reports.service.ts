import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { AssessmentStatus } from '@prisma/client';

@Injectable()
export class ReportsService {
    private readonly logger = new Logger(ReportsService.name);

    constructor(
        private prisma: PrismaService,
        private aiService: AiService,
    ) { }

    async generateReport(sessionId: string) {
        this.logger.log(`Generating report for session ${sessionId}`);

        const session = await this.prisma.assessmentSession.findUnique({
            where: { id: sessionId },
            include: {
                application: {
                    include: {
                        job: true,
                    },
                },
                student: true,
                codeSubmissions: true,
                proctoringEvents: true,
            },
        });

        if (!session) {
            throw new NotFoundException('Session not found');
        }

        // 1. Calculate Integrity Score
        // Base: 100
        // -5 per HIGH RISK batch (we'll simulate this logic for now as riskScore is aggregated)
        // -2 per TAB_SWITCH event
        let integrityScore = 100;
        let tabSwitches = 0;
        let highRiskBatches = 0;

        // Analyze proctoring events
        // Events are stored as JSONB batches
        session.proctoringEvents.forEach(batch => {
            if (batch.riskScore > 0.7) highRiskBatches++; // Assuming 0-1 scale

            const events = batch.events as any[];
            if (Array.isArray(events)) {
                tabSwitches += events.filter(e => e.type === 'TAB_SWITCH').length;
            }
        });

        integrityScore -= (highRiskBatches * 5);
        integrityScore -= (tabSwitches * 2);
        integrityScore = Math.max(0, Math.min(100, integrityScore));

        // 2. Calculate Coding Score
        const completedSubmissions = session.codeSubmissions.filter(s => s.status === 'COMPLETED');
        const codingScore = session.codeSubmissions.length > 0
            ? (completedSubmissions.length / session.codeSubmissions.length) * 100
            : 0;

        // 3. AI Analysis
        const aiFeedback = await this.aiService.generateAssessmentFeedback({
            jobTitle: session.application.job.title,
            codingScore,
            integrityScore,
            tabSwitches,
            submissions: session.codeSubmissions.map(s => ({
                status: s.status,
                time: s.executionTimeMs,
                passed: s.testCasesPassed === s.testCasesTotal
            }))
        });

        // 4. Save Report
        const report = await this.prisma.skillReport.create({
            data: {
                applicationId: session.applicationId,
                studentId: session.studentId,
                overallScore: (codingScore + integrityScore) / 2, // Simple average for MVP
                integrityScore,
                codeCorrectness: codingScore,
                communicationClarity: aiFeedback.communicationClarity || 80, // Placeholder
                debuggingApproach: 75, // Placeholder
                toolUsageEfficiency: 85, // Placeholder
                strengths: aiFeedback.strengths,
                weaknesses: aiFeedback.weaknesses,
                improvementTips: aiFeedback.improvementTips,
                isShortlisted: (codingScore + integrityScore) / 2 > 70, // Auto-shortlist if > 70%
            },
        });

        // Update session with scores
        await this.prisma.assessmentSession.update({
            where: { id: sessionId },
            data: {
                score: report.overallScore,
                integrityScore: report.integrityScore,
                codingScore: report.codeCorrectness,
            }
        });

        // Update Application status to COMPLETED
        await this.prisma.application.update({
            where: { id: session.applicationId },
            data: {
                status: 'ASSESSMENT_COMPLETED',
            },
        });

        return report;
    }

    async getReport(id: string) {
        const report = await this.prisma.skillReport.findUnique({
            where: { id },
            include: {
                student: {
                    include: {
                        user: true
                    }
                },
                application: {
                    include: {
                        job: true
                    }
                }
            }
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        return report;
    }

    async getReportByApplication(applicationId: string) {
        const report = await this.prisma.skillReport.findUnique({
            where: { applicationId },
            include: {
                student: {
                    include: {
                        user: true
                    }
                },
                application: {
                    include: {
                        job: true
                    }
                }
            }
        });

        if (!report) {
            throw new NotFoundException('Report not found');
        }

        return report;
    }
    async verifyCompanyAccess(report: any, userId: string): Promise<boolean> {
        const company = await this.prisma.company.findUnique({
            where: { userId },
        });

        if (!company) return false;

        return report.application.job.companyId === company.id;
    }
}
