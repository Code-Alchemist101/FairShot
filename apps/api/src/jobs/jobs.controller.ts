import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto } from './dto/job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
    constructor(private jobsService: JobsService) { }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new job (Company only, must be verified)' })
    async create(@Request() req, @Body() createJobDto: CreateJobDto) {
        return this.jobsService.create(req.user.userId, createJobDto);
    }

    @Get()
    @ApiOperation({ summary: 'List all active jobs' })
    @ApiQuery({ name: 'location', required: false })
    @ApiQuery({ name: 'jobType', required: false })
    @ApiQuery({ name: 'companyId', required: false })
    async findAll(
        @Query('location') location?: string,
        @Query('jobType') jobType?: string,
        @Query('companyId') companyId?: string,
    ) {
        return this.jobsService.findAll({ location, jobType, companyId });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get job by ID' })
    async findOne(@Param('id') id: string) {
        return this.jobsService.findOne(id);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update job (Owner only)' })
    async update(
        @Request() req,
        @Param('id') id: string,
        @Body() updateJobDto: UpdateJobDto,
    ) {
        return this.jobsService.update(req.user.userId, id, updateJobDto);
    }

    @Get('company/my-jobs')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all jobs for current company' })
    async getMyJobs(@Request() req) {
        const user = await this.jobsService['prisma'].user.findUnique({
            where: { id: req.user.userId },
            include: { company: true },
        });
        return this.jobsService.findByCompany(user.company.id);
    }
}
