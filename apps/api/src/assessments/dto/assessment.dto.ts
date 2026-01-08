import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubmitCodeDto {
    @ApiProperty({ example: 'session_id_here' })
    @IsString()
    @IsNotEmpty()
    sessionId: string;

    @ApiProperty({ example: 'problem_id_here', required: false })
    @IsOptional()
    @IsString()
    problemId?: string;

    @ApiProperty({ example: 'console.log("Hello World");' })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ example: 'javascript' })
    @IsString()
    @IsNotEmpty()
    language: string;

    @ApiProperty({ example: '', required: false })
    @IsOptional()
    @IsString()
    stdin?: string;
}
