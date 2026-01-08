import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
    constructor(
        private prisma: PrismaService,
        private aiService: AiService,
    ) { }

    async apply(userId: string, jobId: string) {
        // Get student profile
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });

        if (!user || !user.student) {
            throw new BadRequestException('Only students can apply to jobs');
        }

        // Check if job exists
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                company: true,
            },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        // Check if already applied
        const existingApplication = await this.prisma.application.findUnique({
            where: {
                studentId_jobId: {
                    studentId: user.student.id,
                    jobId: jobId,
                },
            },
        });

        if (existingApplication) {
            throw new ConflictException('You have already applied to this job');
        }

        // Check company credits
        if (job.company.creditsBalance < 1) {
            throw new BadRequestException('Company has insufficient credits. Please contact the company.');
        }

        // Use Prisma transaction to ensure atomicity
        const result = await this.prisma.$transaction(async (tx) => {
            // Deduct 1 credit from company
            await tx.company.update({
                where: { id: job.companyId },
                data: {
                    creditsBalance: {
                        decrement: 1,
                    },
                },
            });

            // Create application
            const application = await tx.application.create({
                data: {
                    studentId: user.student.id,
                    jobId: jobId,
                    status: ApplicationStatus.ASSESSMENT_PENDING,
                },
                include: {
                    job: {
                        include: {
                            company: {
                                select: {
                                    companyName: true,
                                    logoUrl: true,
                                },
                            },
                        },
                    },
                },
            });

            return application;
        });

        // Generate resource pack asynchronously (don't block the response)
        this.generateResourcePack(jobId, job).catch((error) => {
            console.error('Failed to generate resource pack:', error);
        });

        return result;
    }

    private async generateResourcePack(jobId: string, job: any) {
        // Check if resource pack already exists
        const existing = await this.prisma.resourcePack.findFirst({
            where: { jobId },
        });

        if (existing) {
            return existing; // Already generated
        }

        // Generate using AI
        const content = await this.aiService.generateResourcePack({
            jobTitle: job.title,
            skills: job.requiredSkills as string[],
            description: job.description,
        });

        // Save to database
        return this.prisma.resourcePack.create({
            data: {
                jobId: jobId,
                examPattern: content.examPattern,
                requiredSkills: content.requiredSkills as any,
                prepTips: content.prepTips as any,
                sampleQuestions: content.sampleQuestions,
            },
        });
    }

    async findByStudent(studentId: string) {
        return this.prisma.application.findMany({
            where: { studentId },
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                companyName: true,
                                logoUrl: true,
                            },
                        },
                        resourcePacks: true,
                    },
                },
                skillReport: {
                    select: {
                        id: true,
                    }
                },
            },
            orderBy: {
                appliedAt: 'desc',
            },
        });
    }

    async findByJob(jobId: string) {
        return this.prisma.application.findMany({
            where: { jobId },
            include: {
                student: {
                    include: {
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
                assessmentSessions: {
                    select: {
                        status: true,
                        score: true,
                    },
                    orderBy: {
                        startTime: 'desc',
                    },
                    take: 1,
                },
                skillReport: {
                    select: {
                        id: true,
                        overallScore: true,
                        integrityScore: true,
                    }
                },
            },
            orderBy: {
                appliedAt: 'desc',
            },
        });
    }

    async getResourcePack(jobId: string) {
        const resourcePack = await this.prisma.resourcePack.findFirst({
            where: { jobId },
        });

        if (!resourcePack) {
            throw new NotFoundException('Resource pack not yet generated');
        }

        return resourcePack;
    }

    async updateStatus(applicationId: string, status: ApplicationStatus) {
        return this.prisma.application.update({
            where: { id: applicationId },
            data: { status },
        });
    }
    async checkApplication(userId: string, jobId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { student: true },
        });

        if (!user || !user.student) {
            return { hasApplied: false };
        }

        const application = await this.prisma.application.findUnique({
            where: {
                studentId_jobId: {
                    studentId: user.student.id,
                    jobId: jobId,
                },
            },
            select: {
                status: true,
                appliedAt: true,
            },
        });

        return {
            hasApplied: !!application,
            status: application?.status,
            appliedAt: application?.appliedAt
        };
    }
}
