import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
    email: string;
    password: string;
    role: UserRole;
    // Student-specific fields
    fullName?: string;
    phone?: string;
    skills?: string[];
    experience?: string;
    // Company-specific fields
    companyName?: string;
    website?: string;
    industry?: string;
    companySize?: string;
}

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: createUserDto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const passwordHash = await bcrypt.hash(createUserDto.password, 10);

        // Create user with role-specific profile
        if (createUserDto.role === UserRole.STUDENT) {
            return this.prisma.user.create({
                data: {
                    email: createUserDto.email,
                    passwordHash,
                    role: UserRole.STUDENT,
                    student: {
                        create: {
                            fullName: createUserDto.fullName || '',
                            phone: createUserDto.phone,
                            skills: createUserDto.skills || [],
                            experience: createUserDto.experience || 'Fresher',
                        },
                    },
                },
                include: {
                    student: true,
                },
            });
        } else if (createUserDto.role === UserRole.COMPANY) {
            return this.prisma.user.create({
                data: {
                    email: createUserDto.email,
                    passwordHash,
                    role: UserRole.COMPANY,
                    company: {
                        create: {
                            companyName: createUserDto.companyName || '',
                            website: createUserDto.website || '',
                            industry: createUserDto.industry,
                            companySize: createUserDto.companySize,
                        },
                    },
                },
                include: {
                    company: true,
                },
            });
        }

        // For ADMIN role (simple user creation)
        return this.prisma.user.create({
            data: {
                email: createUserDto.email,
                passwordHash,
                role: createUserDto.role,
            },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
            include: {
                student: true,
                company: true,
            },
        });
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                student: true,
                company: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async updateStudent(userId: string, data: Partial<CreateUserDto>) {
        const user = await this.findById(userId);

        if (user.role !== UserRole.STUDENT || !user.student) {
            throw new ConflictException('User is not a student');
        }

        return this.prisma.student.update({
            where: { userId },
            data: {
                fullName: data.fullName,
                phone: data.phone,
                skills: data.skills,
                experience: data.experience,
            },
        });
    }

    async updateCompany(userId: string, data: Partial<CreateUserDto>) {
        const user = await this.findById(userId);

        if (user.role !== UserRole.COMPANY || !user.company) {
            throw new ConflictException('User is not a company');
        }

        return this.prisma.company.update({
            where: { userId },
            data: {
                companyName: data.companyName,
                website: data.website,
                industry: data.industry,
                companySize: data.companySize,
            },
        });
    }
}
