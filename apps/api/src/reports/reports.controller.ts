import { Controller, Get, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get skill report by ID' })
    async getReport(@Request() req, @Param('id') id: string) {
        const report = await this.reportsService.getReport(id);

        if (req.user.role === 'COMPANY') {
            const hasAccess = await this.reportsService.verifyCompanyAccess(report, req.user.userId);
            if (!hasAccess) {
                throw new NotFoundException('Report not found');
            }
        } else {
            // Default to student check
            if (report.student.userId !== req.user.userId) {
                throw new NotFoundException('Report not found');
            }
        }

        return report;
    }

    @Get('application/:applicationId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get skill report by Application ID' })
    async getReportByApplication(@Request() req, @Param('applicationId') applicationId: string) {
        const report = await this.reportsService.getReportByApplication(applicationId);

        if (req.user.role === 'COMPANY') {
            const hasAccess = await this.reportsService.verifyCompanyAccess(report, req.user.userId);
            if (!hasAccess) {
                throw new NotFoundException('Report not found');
            }
        } else {
            if (report.student.userId !== req.user.userId) {
                throw new NotFoundException('Report not found');
            }
        }

        return report;
    }
}
