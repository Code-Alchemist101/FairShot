import { Controller, Get, Post, Param, UseGuards, Request, Body } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole, ApplicationStatus } from '@prisma/client';

@ApiTags('applications')
@Controller('applications')
export class ApplicationsController {
    constructor(private applicationsService: ApplicationsService) { }

    @Post('apply/:jobId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STUDENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Apply to a job (Student only, deducts 1 credit from company)' })
    async apply(@Request() req, @Param('jobId') jobId: string) {
        return this.applicationsService.apply(req.user.userId, jobId);
    }

    @Get('my-applications')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STUDENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all applications for current student' })
    async getMyApplications(@Request() req) {
        const user = await this.applicationsService['prisma'].user.findUnique({
            where: { id: req.user.userId },
            include: { student: true },
        });
        return this.applicationsService.findByStudent(user.student.id);
    }

    @Get('job/:jobId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all applications for a job (Company only)' })
    async getJobApplications(@Param('jobId') jobId: string) {
        return this.applicationsService.findByJob(jobId);
    }

    @Get('resource-pack/:jobId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.STUDENT)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get resource pack for a job (Student only)' })
    async getResourcePack(@Param('jobId') jobId: string) {
        return this.applicationsService.getResourcePack(jobId);
    }

    @Post(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update application status (Company only)' })
    async updateStatus(@Param('id') id: string, @Body() body: { status: ApplicationStatus }) {
        return this.applicationsService.updateStatus(id, body.status);
    }
}
