import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PackageId {
    STARTER = 'STARTER',
    PRO = 'PRO',
}

export class CreateCheckoutDto {
    @ApiProperty({
        description: 'Package ID for credit purchase',
        enum: PackageId,
        example: 'STARTER',
    })
    @IsEnum(PackageId)
    packageId: PackageId;
}
