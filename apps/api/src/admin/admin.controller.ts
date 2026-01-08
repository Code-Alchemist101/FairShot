import { Controller, Get, Post, Delete, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CompanyVerificationStatus } from '@prisma/client';
import { RejectCompanyDto } from './dto/reject-company.dto';
import { CreateMCQDto, QuestionDifficulty } from './dto/create-mcq.dto';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    @ApiOperation({ summary: 'Get admin dashboard statistics' })
    async getStats() {
        return this.adminService.getStats();
    }

    @Get('companies')
    @ApiOperation({ summary: 'Get companies filtered by verification status' })
    @ApiQuery({
        name: 'status',
        required: false,
        enum: CompanyVerificationStatus,
        description: 'Filter companies by verification status',
    })
    async getCompanies(@Query('status') status?: CompanyVerificationStatus) {
        return this.adminService.getCompanies(status);
    }

    @Patch('companies/:id/verify')
    @ApiOperation({ summary: 'Verify a company' })
    @ApiParam({ name: 'id', description: 'Company ID' })
    async verifyCompany(@Param('id') id: string) {
        return this.adminService.verifyCompany(id);
    }

    @Patch('companies/:id/reject')
    @ApiOperation({ summary: 'Reject a company with reason' })
    @ApiParam({ name: 'id', description: 'Company ID' })
    async rejectCompany(@Param('id') id: string, @Body() dto: RejectCompanyDto) {
        return this.adminService.rejectCompany(id, dto.reason);
    }

    // ============================================
    // MCQ QUESTION BANK ENDPOINTS
    // ============================================

    @Post('mcq')
    @ApiOperation({ summary: 'Create a new MCQ question' })
    async createMCQ(@Body() dto: CreateMCQDto) {
        return this.adminService.createMCQ(dto);
    }

    @Get('mcq')
    @ApiOperation({ summary: 'Get all MCQ questions with optional filtering' })
    @ApiQuery({ name: 'difficulty', required: false, enum: QuestionDifficulty })
    @ApiQuery({ name: 'tags', required: false, description: 'Comma-separated tags' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getMCQs(
        @Query('difficulty') difficulty?: QuestionDifficulty,
        @Query('tags') tags?: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const filters: any = {};

        if (difficulty) filters.difficulty = difficulty;
        if (tags) filters.tags = tags.split(',').map(t => t.trim());
        if (page) filters.page = parseInt(page, 10);
        if (limit) filters.limit = parseInt(limit, 10);

        return this.adminService.getMCQs(filters);
    }

    @Delete('mcq/:id')
    @ApiOperation({ summary: 'Delete an MCQ question' })
    @ApiParam({ name: 'id', description: 'Question ID' })
    async deleteMCQ(@Param('id') id: string) {
        return this.adminService.deleteMCQ(id);
    }
}
