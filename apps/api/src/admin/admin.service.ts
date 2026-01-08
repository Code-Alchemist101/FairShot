import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyVerificationStatus } from '@prisma/client';
import { CreateMCQDto, QuestionDifficulty } from './dto/create-mcq.dto';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getStats() {
        const [pendingCompanies, totalCompanies, totalStudents, totalJobs] = await Promise.all([
            this.prisma.company.count({
                where: { verificationStatus: CompanyVerificationStatus.PENDING },
            }),
            this.prisma.company.count(),
            this.prisma.student.count(),
            this.prisma.job.count(),
        ]);

        return {
            pendingCompanies,
            totalCompanies,
            totalStudents,
            totalJobs,
        };
    }

    async getCompanies(status?: CompanyVerificationStatus) {
        return this.prisma.company.findMany({
            where: status ? { verificationStatus: status } : undefined,
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async verifyCompany(id: string) {
        return this.prisma.company.update({
            where: { id },
            data: {
                verificationStatus: CompanyVerificationStatus.VERIFIED,
                verifiedAt: new Date(),
            },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });
    }

    async rejectCompany(id: string, reason: string) {
        return this.prisma.company.update({
            where: { id },
            data: {
                verificationStatus: CompanyVerificationStatus.REJECTED,
                rejectionReason: reason,
            },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });
    }

    // ============================================
    // MCQ QUESTION BANK MANAGEMENT
    // ============================================

    async createMCQ(dto: CreateMCQDto) {
        return this.prisma.mCQQuestion.create({
            data: {
                question: dto.question,
                options: dto.options,
                correctAnswer: dto.correctAnswer,
                explanation: dto.explanation,
                difficulty: dto.difficulty,
                tags: dto.tags,
            },
        });
    }

    async getMCQs(filters?: {
        difficulty?: QuestionDifficulty;
        tags?: string[];
        page?: number;
        limit?: number;
    }) {
        const page = filters?.page || 1;
        const limit = filters?.limit || 20;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (filters?.difficulty) {
            where.difficulty = filters.difficulty;
        }

        // Note: Filtering by tags in JSON requires raw query or custom logic
        // For now, we'll fetch all and filter in memory if tags are provided
        const questions = await this.prisma.mCQQuestion.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
            skip,
            take: limit,
        });

        const total = await this.prisma.mCQQuestion.count({ where });

        // Filter by tags if provided (in-memory filtering)
        let filteredQuestions = questions;
        if (filters?.tags && filters.tags.length > 0) {
            filteredQuestions = questions.filter((q) => {
                const questionTags = q.tags as string[];
                return filters.tags.some((tag) =>
                    questionTags.some((qt) => qt.toLowerCase().includes(tag.toLowerCase()))
                );
            });
        }

        return {
            questions: filteredQuestions,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async deleteMCQ(id: string) {
        const question = await this.prisma.mCQQuestion.findUnique({
            where: { id },
        });

        if (!question) {
            throw new NotFoundException('Question not found');
        }

        await this.prisma.mCQQuestion.delete({
            where: { id },
        });

        return { message: 'Question deleted successfully' };
    }
}
