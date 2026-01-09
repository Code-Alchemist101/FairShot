import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { JobStatus, CompanyVerificationStatus } from '@prisma/client';


import { AiService } from '../ai/ai.service';

@Injectable()
export class JobsService {
    constructor(
        private prisma: PrismaService,
        private aiService: AiService
    ) { }

    async create(userId: string, createJobDto: CreateJobDto) {
        // Get company profile
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { company: true },
        });

        if (!user || !user.company) {
            throw new ForbiddenException('Only companies can post jobs');
        }

        // Check if company is verified
        if (user.company.verificationStatus !== CompanyVerificationStatus.VERIFIED) {
            throw new ForbiddenException('Company must be verified to post jobs');
        }

        // Create job
        const job = await this.prisma.job.create({
            data: {
                companyId: user.company.id,
                title: createJobDto.title,
                description: createJobDto.description,
                location: createJobDto.location,
                jobType: createJobDto.jobType,
                salaryMin: createJobDto.salaryMin,
                salaryMax: createJobDto.salaryMax,
                requiredSkills: createJobDto.requiredSkills,
                assessmentConfig: createJobDto.assessmentConfig,
                status: createJobDto.status || JobStatus.ACTIVE,
                publishedAt: createJobDto.status === JobStatus.DRAFT ? null : new Date(),
            },
            include: {
                company: {
                    include: {
                        user: {
                            select: {
                                email: true,
                            },
                        },
                    },
                },
            },
        });

        return job;
    }

    async findAll(filters?: { location?: string; jobType?: string; companyId?: string }) {
        return this.prisma.job.findMany({
            where: {
                status: JobStatus.ACTIVE,
                ...(filters?.location && { location: { contains: filters.location, mode: 'insensitive' } }),
                ...(filters?.jobType && { jobType: filters.jobType }),
                ...(filters?.companyId && { companyId: filters.companyId }),
            },
            include: {
                company: {
                    select: {
                        companyName: true,
                        logoUrl: true,
                        website: true,
                    },
                },
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
            orderBy: {
                publishedAt: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const job = await this.prisma.job.findUnique({
            where: { id },
            include: {
                company: {
                    select: {
                        companyName: true,
                        logoUrl: true,
                        website: true,
                        industry: true,
                        companySize: true,
                        userId: true, // Needed for permission checks too
                    },
                },
                _count: {
                    select: {
                        applications: true,
                    },
                },
                mcqQuestions: true,
                codingProblems: true,
            },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        return job;
    }

    async update(userId: string, jobId: string, updateJobDto: UpdateJobDto) {
        // Verify ownership
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: {
                company: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!job) {
            throw new NotFoundException('Job not found');
        }

        if (job.company.userId !== userId) {
            throw new ForbiddenException('You can only update your own jobs');
        }

        return this.prisma.job.update({
            where: { id: jobId },
            data: updateJobDto,
        });
    }

    async findByCompany(companyId: string) {
        return this.prisma.job.findMany({
            where: { companyId },
            include: {
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async generateQuestionsForJob(userId: string, jobId: string) {
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { company: true }
        });

        if (!job) throw new NotFoundException('Job not found');
        if (job.company.userId !== userId) throw new ForbiddenException('Unauthorized');

        // Call AI Service
        // Map requiredSkills (json) to string[]
        const skills = Array.isArray(job.requiredSkills) ? (job.requiredSkills as string[]) : [];

        return this.aiService.generateQuestions(job.title, skills, job.description);
    }

    async saveQuestionsForJob(userId: string, jobId: string, data: { mcqs: any[], coding: any[] }) {
        // 1. Verify Job exists
        // 1. Verify Job exists & Ownership
        const job = await this.prisma.job.findUnique({
            where: { id: jobId },
            include: { company: true }
        });

        if (!job) throw new NotFoundException('Job not found');
        if (job.company.userId !== userId) throw new ForbiddenException('Unauthorized');

        // 2. Transact save
        return this.prisma.$transaction(async (tx) => {
            // Save MCQs
            if (data.mcqs?.length) {
                await tx.mCQQuestion.createMany({
                    data: data.mcqs.map(q => ({
                        jobId,
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        explanation: q.explanation || '',
                        difficulty: q.difficulty || 'MEDIUM',
                        tags: q.tags || [],
                    }))
                });
            }

            // Save Coding Problems
            if (data.coding?.length) {
                for (const p of data.coding) {
                    await tx.codingProblem.create({
                        data: {
                            jobId,
                            title: p.title,
                            description: p.description,
                            difficulty: p.difficulty || 'MEDIUM',
                            tags: p.tags || [],
                            testCases: p.testCases || [],
                            timeLimitMs: 1000,
                            memoryLimitMB: 128
                        }
                    });
                }
            }
        });
    }
}
