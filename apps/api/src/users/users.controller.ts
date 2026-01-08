import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    async getProfile(@Request() req) {
        return this.usersService.findById(req.user.userId);
    }

    @Put('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update current user profile' })
    async updateProfile(@Request() req, @Body() updateData: any) {
        const user = await this.usersService.findById(req.user.userId);

        if (user.role === 'STUDENT') {
            return this.usersService.updateStudent(req.user.userId, updateData);
        } else if (user.role === 'COMPANY') {
            return this.usersService.updateCompany(req.user.userId, updateData);
        }

        return { message: 'Profile updated' };
    }
}
