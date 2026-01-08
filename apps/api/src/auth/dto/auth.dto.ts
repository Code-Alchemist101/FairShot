import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class RegisterDto {
    @ApiProperty({ example: 'student@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 8 })
    @IsString()
    @MinLength(8)
    password: string;

    @ApiProperty({ enum: UserRole, example: UserRole.STUDENT })
    @IsEnum(UserRole)
    role: UserRole;

    // Student-specific fields
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fullName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    skills?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    experience?: string;

    // Company-specific fields
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    companyName?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    website?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    industry?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    companySize?: string;
}

export class LoginDto {
    @ApiProperty({ example: 'student@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123' })
    @IsString()
    password: string;
}
