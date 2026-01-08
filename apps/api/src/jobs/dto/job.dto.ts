import { IsString, IsNotEmpty, IsArray, IsOptional, IsObject, IsEnum, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JobStatus } from '@prisma/client';

export class CreateJobDto {
    @ApiProperty({ example: 'Senior Full Stack Developer' })
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty({ example: 'We are looking for an experienced full stack developer...' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 'Remote' })
    @IsString()
    @IsNotEmpty()
    location: string;

    @ApiProperty({ example: 'Full-time' })
    @IsString()
    @IsNotEmpty()
    jobType: string;

    @ApiProperty({ example: 100000, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    salaryMin?: number;

    @ApiProperty({ example: 150000, required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    salaryMax?: number;

    @ApiProperty({ example: ['JavaScript', 'React', 'Node.js'] })
    @IsArray()
    @IsString({ each: true })
    requiredSkills: string[];

    @ApiProperty({ example: ['Remote', 'High Pay'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiProperty({ example: ['BS in CS', '3+ years experience'] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    qualifications?: string[];

    @ApiProperty({ example: 'We are a fast-growing startup...' })
    @IsOptional()
    @IsString()
    aboutCompany?: string;

    @ApiProperty({
        example: {
            modules: ['MCQ', 'CODING'],
            mcqCount: 10,
            codingCount: 2,
            timeLimit: 60,
            allowedTools: ['MDN', 'W3Schools']
        }
    })
    @IsObject()
    assessmentConfig: any;

    @ApiProperty({ required: false, enum: JobStatus })
    @IsOptional()
    @IsEnum(JobStatus)
    status?: JobStatus;
}

export class UpdateJobDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    location?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    jobType?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    salaryMin?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsInt()
    @Min(0)
    salaryMax?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    requiredSkills?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    qualifications?: string[];

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    aboutCompany?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsObject()
    assessmentConfig?: any;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(JobStatus)
    status?: JobStatus;
}
