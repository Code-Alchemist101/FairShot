import { Controller, Post, Body, Headers, RawBodyRequest, Req, UseGuards, Get, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
    constructor(private paymentsService: PaymentsService) { }

    @Post('create-session')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.COMPANY)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create Stripe checkout session for credit purchase' })
    @ApiResponse({ status: 201, description: 'Checkout session created successfully' })
    async createCheckoutSession(
        @GetUser('userId') userId: string,
        @Body() dto: CreateCheckoutDto,
    ) {
        return this.paymentsService.createCheckoutSession(userId, dto.packageId);
    }

    @Post('webhook')
    @ApiOperation({ summary: 'Stripe webhook endpoint' })
    @ApiResponse({ status: 200, description: 'Webhook processed successfully' })
    async handleWebhook(
        @Headers('stripe-signature') signature: string,
        @Req() request: RawBodyRequest<Request>,
    ) {
        return this.paymentsService.handleWebhook(signature, request.rawBody);
    }

    @Get('verify-session')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Manually verify a session (fallback for webhooks)' })
    async verifySession(
        @GetUser('userId') userId: string,
        @Query('sessionId') sessionId: string,
    ) {
        return this.paymentsService.verifySession(userId, sessionId);
    }
}
