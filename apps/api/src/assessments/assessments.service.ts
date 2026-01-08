import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Judge0Service } from '../judge0/judge0.service';
import { ReportsService } from '../reports/reports.service';
import { AssessmentStatus, CodeSubmissionStatus } from '@prisma/client';

@Injectable()
export class AssessmentsService {
    constructor(
        private prisma: PrismaService,
        private judge0Service: Judge0Service,
        private reportsService: ReportsService,
    ) { }

    /**
     * Start an assessment session for an application
     */
    async startSession(userId: string, applicationId: string) {
        // Verify application exists and belongs to user
        const application = await this.prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                student: {
                    include: {
                        user: true,
                    },
                },
                job: true,
            },
        });

        if (!application) {
            throw new NotFoundException('Application not found');
        }

        if (application.student.userId !== userId) {
            throw new ForbiddenException('This application does not belong to you');
        }

        // Check if session already exists
        const existingSession = await this.prisma.assessmentSession.findFirst({
            where: { applicationId },
            include: {
                mcqResponses: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                question: true,
                                options: true,
                                difficulty: true,
                                tags: true,
                                // Exclude correctAnswer from frontend
                            },
                        },
                    },
                },
            },
        });

        if (existingSession) {
            return existingSession; // Return existing session with MCQ responses
        }

        // Create new session
        const session = await this.prisma.assessmentSession.create({
            data: {
                applicationId,
                studentId: application.studentId,
                status: AssessmentStatus.IN_PROGRESS,
                startTime: new Date(),
            },
            include: {
                application: {
                    include: {
                        job: true,
                    },
                },
            },
        });

        // Check if assessment includes MCQ module
        const assessmentConfig = application.job.assessmentConfig as any;
        if (assessmentConfig?.modules?.includes('MCQ')) {
            // Fetch all question IDs
            const allQuestions = await this.prisma.mCQQuestion.findMany({
                select: { id: true },
            });

            if (allQuestions.length > 0) {
                // Shuffle and select 5 random questions
                const shuffled = allQuestions.sort(() => 0.5 - Math.random());
                const selectedIds = shuffled.slice(0, Math.min(5, allQuestions.length)).map(q => q.id);

                // Create MCQResponse records for selected questions
                await Promise.all(
                    selectedIds.map(questionId =>
                        this.prisma.mCQResponse.create({
                            data: {
                                sessionId: session.id,
                                questionId,
                            },
                        })
                    )
                );
            }
        }

        // Fetch session with MCQ responses
        const sessionWithMCQ = await this.prisma.assessmentSession.findUnique({
            where: { id: session.id },
            include: {
                application: {
                    include: {
                        job: true,
                    },
                },
                mcqResponses: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                question: true,
                                options: true,
                                difficulty: true,
                                tags: true,
                                // Exclude correctAnswer from frontend
                            },
                        },
                    },
                },
            },
        });

        return sessionWithMCQ;
    }

    /**
     * Submit code for execution
     */
    async submitCode(userId: string, submitCodeDto: any) {
        const { sessionId, problemId, code, language, stdin } = submitCodeDto;

        // Verify session belongs to user
        const session = await this.prisma.assessmentSession.findUnique({
            where: { id: sessionId },
            include: {
                student: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!session) {
            throw new NotFoundException('Assessment session not found');
        }

        if (session.student.userId !== userId) {
            throw new ForbiddenException('This session does not belong to you');
        }

        if (session.status !== AssessmentStatus.IN_PROGRESS) {
            throw new BadRequestException('Assessment session is not in progress');
        }

        // Get language ID
        const languageId = this.judge0Service.getLanguageId(language);

        // Submit to Judge0
        const result = await this.judge0Service.executeAndWait(code, languageId, stdin);

        // Determine status based on Judge0 result
        let status: CodeSubmissionStatus;
        if (result.status.id === 3) {
            status = CodeSubmissionStatus.COMPLETED;
        } else if (result.status.id === 5) {
            status = CodeSubmissionStatus.TIME_LIMIT_EXCEEDED;
        } else if (result.status.id === 6) {
            status = CodeSubmissionStatus.ERROR;
        } else {
            status = CodeSubmissionStatus.ERROR;
        }

        // Get problem to determine test cases (optional for testing)
        let problem = null;
        let testCasesTotal = 1;

        if (problemId) {
            problem = await this.prisma.codingProblem.findUnique({
                where: { id: problemId },
            });
            testCasesTotal = problem?.testCases ? (problem.testCases as any[]).length : 1;
        }

        // Save submission
        const submission = await this.prisma.codeSubmission.create({
            data: {
                sessionId,
                problemId: problemId || null,
                code,
                language,
                status,
                stdout: result.stdout || null,
                stderr: result.stderr || null,
                compileOutput: result.compile_output || null,
                executionTimeMs: result.time ? Math.round(parseFloat(result.time) * 1000) : null,
                memoryUsedKB: result.memory || null,
                testCasesTotal,
                testCasesPassed: status === CodeSubmissionStatus.COMPLETED ? testCasesTotal : 0,
            },
        });

        return {
            submission,
            result: {
                status: result.status.description,
                output: result.stdout,
                error: result.stderr || result.compile_output,
                time: result.time,
                memory: result.memory,
            },
        };
    }

    /**
     * Submit MCQ quiz answers
     */
    async submitMCQ(userId: string, sessionId: string, responses: Array<{ questionId: string, selectedAnswer: number }>) {
        // Verify session belongs to user
        const session = await this.prisma.assessmentSession.findUnique({
            where: { id: sessionId },
            include: {
                student: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!session) {
            throw new NotFoundException('Assessment session not found');
        }

        if (session.student.userId !== userId) {
            throw new ForbiddenException('This session does not belong to you');
        }

        if (session.status !== AssessmentStatus.IN_PROGRESS) {
            throw new BadRequestException('Assessment session is not in progress');
        }

        // Process each response
        const updatedResponses = await Promise.all(
            responses.map(async (response) => {
                // Fetch the question to get correct answer
                const question = await this.prisma.mCQQuestion.findUnique({
                    where: { id: response.questionId },
                });

                if (!question) {
                    throw new NotFoundException(`Question ${response.questionId} not found`);
                }

                // Find the MCQResponse record
                const mcqResponse = await this.prisma.mCQResponse.findFirst({
                    where: {
                        sessionId,
                        questionId: response.questionId,
                    },
                });

                if (!mcqResponse) {
                    throw new NotFoundException(`MCQ response for question ${response.questionId} not found`);
                }

                // Calculate if answer is correct
                const isCorrect = response.selectedAnswer === question.correctAnswer;

                // Update the MCQResponse record
                return this.prisma.mCQResponse.update({
                    where: { id: mcqResponse.id },
                    data: {
                        selectedAnswer: response.selectedAnswer,
                        isCorrect,
                        answeredAt: new Date(),
                    },
                });
            })
        );

        // Calculate score
        const correctCount = updatedResponses.filter(r => r.isCorrect).length;
        const totalCount = updatedResponses.length;
        const mcqScore = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

        return {
            responses: updatedResponses,
            score: mcqScore,
            correct: correctCount,
            total: totalCount,
        };
    }

    /**
     * Complete an assessment session
     */
    async completeSession(userId: string, sessionId: string) {
        // Verify session belongs to user
        const session = await this.prisma.assessmentSession.findUnique({
            where: { id: sessionId },
            include: {
                student: {
                    include: {
                        user: true,
                    },
                },
                codeSubmissions: true,
                mcqResponses: true,
            },
        });

        if (!session) {
            throw new NotFoundException('Assessment session not found');
        }

        if (session.student.userId !== userId) {
            throw new ForbiddenException('This session does not belong to you');
        }

        // Calculate coding score (simple: percentage of completed submissions)
        const completedCount = session.codeSubmissions.filter(
            (s) => s.status === CodeSubmissionStatus.COMPLETED,
        ).length;
        const codingScore = session.codeSubmissions.length > 0
            ? (completedCount / session.codeSubmissions.length) * 100
            : 0;

        // Calculate MCQ score
        const correctMCQCount = session.mcqResponses.filter(r => r.isCorrect).length;
        const mcqScore = session.mcqResponses.length > 0
            ? (correctMCQCount / session.mcqResponses.length) * 100
            : 0;

        // Calculate total score (weighted average: 50% coding, 50% MCQ)
        let totalScore = codingScore;
        if (session.mcqResponses.length > 0 && session.codeSubmissions.length > 0) {
            // Both modules present
            totalScore = (codingScore * 0.5) + (mcqScore * 0.5);
        } else if (session.mcqResponses.length > 0) {
            // Only MCQ
            totalScore = mcqScore;
        }

        // Update session
        const updatedSession = await this.prisma.assessmentSession.update({
            where: { id: sessionId },
            data: {
                status: AssessmentStatus.COMPLETED,
                endTime: new Date(),
                codingScore,
                mcqScore,
                score: totalScore,
            },
        });

        // Trigger async grading/analysis
        await this.reportsService.generateReport(sessionId);

        return updatedSession;
    }

    /**
     * Get session details
     */
    async getSession(userId: string, sessionId: string) {
        const session = await this.prisma.assessmentSession.findUnique({
            where: { id: sessionId },
            include: {
                student: {
                    include: {
                        user: true,
                    },
                },
                application: {
                    include: {
                        job: true,
                    },
                },
                codeSubmissions: {
                    orderBy: {
                        submittedAt: 'desc',
                    },
                },
                mcqResponses: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                question: true,
                                options: true,
                                difficulty: true,
                                tags: true,
                                // Exclude correctAnswer from frontend
                            },
                        },
                    },
                },
            },
        });

        if (!session) {
            throw new NotFoundException('Assessment session not found');
        }

        if (session.student.userId !== userId) {
            throw new ForbiddenException('This session does not belong to you');
        }

        return session;
    }
}
