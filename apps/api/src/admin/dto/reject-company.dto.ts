import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectCompanyDto {
    @ApiProperty({
        description: 'Reason for rejecting the company verification',
        example: 'Invalid business registration documents',
        minLength: 10,
    })
    @IsString()
    @MinLength(10, { message: 'Rejection reason must be at least 10 characters' })
    reason: string;
}
