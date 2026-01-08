import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { PackageId } from './dto/create-checkout.dto';

@Injectable()
export class PaymentsService {
    private readonly logger = new Logger(PaymentsService.name);
    private stripe: Stripe;

    // Package definitions
    private readonly PACKAGES = {
        [PackageId.STARTER]: {
            price: 5000, // $50 in cents
            credits: 10,
            name: 'Starter Package',
            description: '10 assessment credits',
        },
        [PackageId.PRO]: {
            price: 20000, // $200 in cents
            credits: 50,
            name: 'Pro Package',
            description: '50 assessment credits',
        },
    };

    constructor(private prisma: PrismaService) {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-11-17.clover',
        });
    }

    async createCheckoutSession(userId: string, packageId: PackageId) {
        // Get company
        const company = await this.prisma.company.findUnique({
            where: { userId },
        });

        if (!company) {
            throw new BadRequestException('Company not found');
        }

        // Get package details
        const packageDetails = this.PACKAGES[packageId];
        if (!packageDetails) {
            throw new BadRequestException('Invalid package ID');
        }

        // Create Stripe checkout session
        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: packageDetails.name,
                            description: packageDetails.description,
                        },
                        unit_amount: packageDetails.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/company/billing/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/company/billing/cancel`,
            metadata: {
                userId,
                companyId: company.id,
                packageId,
                credits: packageDetails.credits.toString(),
            },
        });

        this.logger.log(`Created checkout session ${session.id} for company ${company.id}`);

        return { url: session.url };
    }

    async verifySession(userId: string, sessionId: string) {
        try {
            const session = await this.stripe.checkout.sessions.retrieve(sessionId);

            if (!session) {
                throw new BadRequestException('Session not found');
            }

            if (session.payment_status !== 'paid') {
                return { status: 'pending', message: 'Payment not completed yet' };
            }

            if (session.metadata.userId !== userId) {
                throw new BadRequestException('Unauthorized verification attempt');
            }

            // Trigger completion logic
            await this.handleCheckoutSessionCompleted(session);

            return { status: 'success', credits: parseInt(session.metadata.credits) };
        } catch (error) {
            this.logger.error(`Verification failed: ${error.message}`);
            throw new BadRequestException('Verification failed');
        }
    }

    async handleWebhook(signature: string, payload: Buffer) {
        let event: Stripe.Event;

        try {
            event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                process.env.STRIPE_WEBHOOK_SECRET,
            );
        } catch (err) {
            this.logger.error(`Webhook signature verification failed: ${err.message}`);
            throw new BadRequestException(`Webhook Error: ${err.message}`);
        }

        this.logger.log(`Processing webhook event: ${event.type}`);

        // Handle the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            await this.handleCheckoutSessionCompleted(session);
        }

        return { received: true };
    }

    async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
        const { companyId, credits, packageId } = session.metadata;

        this.logger.log(`Processing completed checkout for company ${companyId}`);

        // Check if payment already processed
        const existingPayment = await this.prisma.payment.findUnique({
            where: { stripePaymentId: session.id },
        });

        if (existingPayment) {
            this.logger.warn(`Payment ${session.id} already processed, skipping`);
            return;
        }

        // Get package details for description
        const packageDetails = this.PACKAGES[packageId as PackageId];

        // Create payment record and update credits in a transaction
        await this.prisma.$transaction(async (tx) => {
            // Create payment record
            await tx.payment.create({
                data: {
                    companyId,
                    amount: session.amount_total / 100, // Convert from cents to dollars
                    currency: session.currency.toUpperCase(),
                    stripePaymentId: session.id,
                    status: 'COMPLETED',
                    description: packageDetails.description,
                    creditsAdded: parseInt(credits),
                    paidAt: new Date(),
                },
            });

            // Update company credits
            await tx.company.update({
                where: { id: companyId },
                data: {
                    creditsBalance: {
                        increment: parseInt(credits),
                    },
                },
            });

            this.logger.log(
                `Added ${credits} credits to company ${companyId}, payment ${session.id} recorded`,
            );
        });
    }
    async getHistory(userId: string) {
        const company = await this.prisma.company.findUnique({
            where: { userId },
        });

        if (!company) {
            throw new BadRequestException('Company not found');
        }

        return this.prisma.payment.findMany({
            where: { companyId: company.id },
            orderBy: { createdAt: 'desc' },
        });
    }
}
