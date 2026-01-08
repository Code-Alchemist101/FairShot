import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { JobStatus, CompanyVerificationStatus } from '@prisma/client';

@Injectable()
export class JobsService {
    constructor(private prisma: PrismaService) { }

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
        return this.prisma.job.create({
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
                status: JobStatus.ACTIVE,
                publishedAt: new Date(),
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
                    },
                },
                _count: {
                    select: {
                        applications: true,
                    },
                },
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
}
