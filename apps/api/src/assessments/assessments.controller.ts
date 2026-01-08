import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { SubmitCodeDto } from './dto/assessment.dto';
import { SubmitMCQDto } from './dto/submit-mcq.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('assessments')
@Controller('assessments')
export class AssessmentsController {
    constructor(private assessmentsService: AssessmentsService) { }

    @Post('start/:applicationId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STUDENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Start an assessment session (Student only)' })
    async startSession(@Request() req, @Param('applicationId') applicationId: string) {
        return this.assessmentsService.startSession(req.user.userId, applicationId);
    }

    @Post('submit')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STUDENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit code for execution (Student only)' })
    async submitCode(@Request() req, @Body() submitCodeDto: SubmitCodeDto) {
        return this.assessmentsService.submitCode(req.user.userId, submitCodeDto);
    }

    @Post('submit-mcq')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STUDENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit MCQ quiz answers (Student only)' })
    async submitMCQ(@Request() req, @Body() dto: SubmitMCQDto) {
        return this.assessmentsService.submitMCQ(req.user.userId, dto.sessionId, dto.responses);
    }

    @Post('complete/:sessionId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STUDENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Complete an assessment session (Student only)' })
    async completeSession(@Request() req, @Param('sessionId') sessionId: string) {
        return this.assessmentsService.completeSession(req.user.userId, sessionId);
    }

    @Get('session/:sessionId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STUDENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get assessment session details (Student only)' })
    async getSession(@Request() req, @Param('sessionId') sessionId: string) {
        return this.assessmentsService.getSession(req.user.userId, sessionId);
    }
}
