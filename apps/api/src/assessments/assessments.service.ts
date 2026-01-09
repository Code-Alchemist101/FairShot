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
                codeSubmissions: {
                    include: {
                        problem: true
                    },
                    orderBy: {
                        submittedAt: 'asc'
                    }
                }
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

        // Update Application status to IN_PROGRESS
        await this.prisma.application.update({
            where: { id: applicationId },
            data: { status: 'ASSESSMENT_IN_PROGRESS' },
        });

        // Check if assessment includes MCQ module
        const assessmentConfig = application.job.assessmentConfig as any;
        if (assessmentConfig?.modules?.includes('MCQ')) {
            // Logic to pick relevant questions
            // Priority 1: Questions specifically linked to this Job (jobId)
            // Priority 2: Questions matching Job's required skills/tags
            // Priority 3: Random fallback

            const jobSkills = [
                ...(Array.isArray(application.job.requiredSkills) ? application.job.requiredSkills as string[] : []),
                ...(Array.isArray(application.job.tags) ? application.job.tags as string[] : []),
            ].map(s => s.toLowerCase());

            // Fetch potential questions (Job-specific OR General pool)
            const candidates = await this.prisma.mCQQuestion.findMany({
                where: {
                    OR: [
                        { jobId: application.job.id },
                        { jobId: null } // General pool
                    ]
                },
                select: { id: true, tags: true, jobId: true }
            });

            if (candidates.length > 0) {
                // Score candidates
                const scored = candidates.map(q => {
                    let score = 0;

                    // Job Specific: Highest priority (Absolute Override)
                    if (q.jobId === application.job.id) score += 10000;

                    // Skill Match: +10 per match
                    if (Array.isArray(q.tags)) {
                        const qTags = (q.tags as string[]).map(t => t.toLowerCase());
                        const matches = qTags.filter(t => jobSkills.includes(t)).length;
                        score += matches * 10;
                    }

                    return { ...q, score, random: Math.random() };
                });

                // Sort: Score DESC, then Random
                scored.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return b.random - a.random;
                });

                // Select top 5
                const selectedIds = scored.slice(0, 5).map(q => q.id);

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



        // Check if assessment includes CODING module
        if (assessmentConfig?.modules?.includes('CODING')) {
            // Logic to pick relevant questions
            // Priority 1: Questions specifically linked to this Job (jobId)
            // Priority 2: Questions matching Job's required skills/tags
            // Priority 3: Random fallback

            const jobSkills = [
                ...(Array.isArray(application.job.requiredSkills) ? application.job.requiredSkills as string[] : []),
                ...(Array.isArray(application.job.tags) ? application.job.tags as string[] : []),
            ].map(s => s.toLowerCase());

            // Fetch potential problems (Job-specific OR General pool)
            const candidates = await this.prisma.codingProblem.findMany({
                where: {
                    OR: [
                        { jobId: application.job.id },
                        { jobId: null } // General pool
                    ]
                },
                select: { id: true, tags: true, jobId: true, testCases: true }
            });

            if (candidates.length > 0) {
                // Score candidates
                const scored = candidates.map(p => {
                    let score = 0;

                    // Job Specific: Highest priority (Absolute Override)
                    if (p.jobId === application.job.id) score += 10000;

                    // Skill Match: +10 per match
                    if (Array.isArray(p.tags)) {
                        const pTags = (p.tags as string[]).map(t => t.toLowerCase());
                        const matches = pTags.filter(t => jobSkills.includes(t)).length;
                        score += matches * 10;
                    }

                    return { ...p, score, random: Math.random() };
                });

                // Sort: Score DESC, then Random
                scored.sort((a, b) => {
                    if (b.score !== a.score) return b.score - a.score;
                    return b.random - a.random;
                });

                // Select top 2 (or config count)
                const count = assessmentConfig.codingCount || 2;
                const selectedProblems = scored.slice(0, count);

                // Create CodeSubmission records (Assignments)
                await Promise.all(
                    selectedProblems.map(p =>
                        this.prisma.codeSubmission.create({
                            data: {
                                sessionId: session.id,
                                problemId: p.id,
                                code: '// Write your solution here...',
                                language: 'javascript', // Default
                                testCasesTotal: Array.isArray(p.testCases) ? p.testCases.length : 0,
                                status: 'QUEUED',
                            },
                        })
                    )
                );
            }
        }

        // Fetch session with MCQ responses AND Code Submissions
        const sessionWithAssignments = await this.prisma.assessmentSession.findUnique({
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
                // Include assigned coding problems
                codeSubmissions: {
                    include: {
                        problem: true
                    },
                    orderBy: {
                        submittedAt: 'asc' // Show in order assigned
                    }
                }
            },
        });

        return sessionWithAssignments;
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

        // Update Application status to COMPLETED
        await this.prisma.application.update({
            where: { id: session.applicationId },
            data: { status: 'ASSESSMENT_COMPLETED' },
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
                    include: {
                        problem: true,
                    },
                    orderBy: {
                        submittedAt: 'asc', // Changed to ASC to keep assignment order stable
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
