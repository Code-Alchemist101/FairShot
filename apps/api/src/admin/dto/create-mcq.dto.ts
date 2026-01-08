import { IsString, IsArray, IsInt, IsEnum, IsOptional, MinLength, ArrayMinSize, ArrayMaxSize, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum QuestionDifficulty {
    EASY = 'EASY',
    MEDIUM = 'MEDIUM',
    HARD = 'HARD',
}

export class CreateMCQDto {
    @ApiProperty({ description: 'Question text (Markdown supported)', minimum: 10 })
    @IsString()
    @MinLength(10, { message: 'Question must be at least 10 characters long' })
    question: string;

    @ApiProperty({ description: 'Array of exactly 4 options', type: [String] })
    @IsArray()
    @ArrayMinSize(4, { message: 'Must provide exactly 4 options' })
    @ArrayMaxSize(4, { message: 'Must provide exactly 4 options' })
    @IsString({ each: true })
    options: string[];

    @ApiProperty({ description: 'Index of correct answer (0-3)', minimum: 0, maximum: 3 })
    @IsInt()
    @Min(0, { message: 'Correct answer must be between 0 and 3' })
    @Max(3, { message: 'Correct answer must be between 0 and 3' })
    correctAnswer: number;

    @ApiPropertyOptional({ description: 'Explanation for the correct answer' })
    @IsOptional()
    @IsString()
    explanation?: string;

    @ApiProperty({ description: 'Difficulty level', enum: QuestionDifficulty })
    @IsEnum(QuestionDifficulty, { message: 'Difficulty must be EASY, MEDIUM, or HARD' })
    difficulty: QuestionDifficulty;

    @ApiProperty({ description: 'Tags for categorization', type: [String] })
    @IsArray()
    @IsString({ each: true })
    tags: string[];
}
