import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AiModule } from '../ai/ai.module';

@Module({
    imports: [AiModule],
    controllers: [ReportsController],
    providers: [ReportsService, PrismaService],
    exports: [ReportsService],
})
export class ReportsModule { }
