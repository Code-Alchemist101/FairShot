import { IsString, IsArray, IsInt, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class MCQResponseDto {
    @ApiProperty({ description: 'Question ID' })
    @IsString()
    questionId: string;

    @ApiProperty({ description: 'Selected answer index (0-3)', minimum: 0, maximum: 3 })
    @IsInt()
    @Min(0)
    @Max(3)
    selectedAnswer: number;
}

export class SubmitMCQDto {
    @ApiProperty({ description: 'Assessment session ID' })
    @IsString()
    sessionId: string;

    @ApiProperty({ description: 'Array of question responses', type: [MCQResponseDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => MCQResponseDto)
    responses: MCQResponseDto[];
}
