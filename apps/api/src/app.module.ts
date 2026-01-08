import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AiModule } from './ai/ai.module';
import { JobsModule } from './jobs/jobs.module';
import { ApplicationsModule } from './applications/applications.module';
import { Judge0Module } from './judge0/judge0.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { ProctoringModule } from './proctoring/proctoring.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'apps/api/.env',
    }),
    PrismaModule,
    AiModule,
    Judge0Module,
    AuthModule,
    UsersModule,
    JobsModule,
    ApplicationsModule,
    AssessmentsModule,
    ProctoringModule,
    ReportsModule,
    AdminModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

