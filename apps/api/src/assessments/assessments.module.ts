import { Module } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { AssessmentsController } from './assessments.controller';
import { ReportsModule } from '../reports/reports.module';
import { PrismaService } from '../prisma/prisma.service';
import { Judge0Service } from '../judge0/judge0.service';

@Module({
    imports: [ReportsModule],
    providers: [AssessmentsService, PrismaService, Judge0Service],
    controllers: [AssessmentsController],
    exports: [AssessmentsService],
})
export class AssessmentsModule { }
