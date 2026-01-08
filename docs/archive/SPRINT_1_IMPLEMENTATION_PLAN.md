# Sprint 1: "The Trust & Revenue Sprint" - Implementation Plan

**Duration**: 2 Weeks (40 hours)  
**Goal**: Enable Monetization and Trust Verification  
**Status**: Ready for Implementation

---

## Sprint Overview

### Objectives
1. ✅ Enable admin verification of companies
2. ✅ Implement Stripe payment integration for credit purchases
3. ✅ Add MCQ module to assessment system

### Success Metrics
- Companies can purchase credits via Stripe
- Admins can approve/reject company verification requests
- Students can take MCQ assessments alongside coding challenges
- Zero payment failures due to webhook issues

---

## Epic 1: Company Verification (Admin Panel)

**Estimated Effort**: 12 hours  
**Priority**: P0 (Blocking for company onboarding)

### Current State Analysis
```typescript
// Schema already defined
enum CompanyVerificationStatus {
  PENDING
  VERIFIED
  REJECTED
}

model Company {
  verificationStatus    CompanyVerificationStatus @default(PENDING)
  verificationDocUrl    String?
  rejectionReason       String?
  verifiedAt            DateTime?
}
```

**Problem**: No UI or API to manage verification workflow.

---

### Ticket 1.1: Admin Authentication & Layout

**Effort**: 3 hours  
**Files to Create/Modify**: 5 files

#### Backend Changes

##### 1. Create Admin Guard
**File**: `apps/api/src/auth/guards/admin.guard.ts`
```typescript
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
```

##### 2. Update Auth Module
**File**: `apps/api/src/auth/auth.module.ts`
```typescript
// Add AdminGuard to providers
providers: [AuthService, JwtStrategy, AdminGuard],
exports: [AuthService, AdminGuard],
```

#### Frontend Changes

##### 3. Create Admin Layout
**File**: `apps/web/app/admin/layout.tsx`
```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-800 border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
```

##### 4. Create Admin Dashboard Page
**File**: `apps/web/app/admin/page.tsx`
```typescript
'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Users, FileCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/companies">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-5 h-5" />
                Company Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Review and approve company verification requests
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/mcq">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="w-5 h-5" />
                MCQ Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage assessment question bank
              </p>
            </CardContent>
          </Card>
        </Link>

        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Coming soon...
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

##### 5. Update Middleware
**File**: `apps/web/middleware.ts`
```typescript
// Add admin route protection
if (pathname.startsWith('/admin')) {
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

**Testing Checklist**:
- [ ] Admin user can access `/admin`
- [ ] Non-admin users are redirected from `/admin`
- [ ] Admin layout renders correctly
- [ ] Navigation cards are clickable

---

### Ticket 1.2: Verification Queue

**Effort**: 4 hours  
**Files to Create/Modify**: 4 files

#### Backend Changes

##### 1. Create Admin Companies Controller
**File**: `apps/api/src/admin/admin.controller.ts`
```typescript
import { Controller, Get, Post, Param, Body, UseGuards, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CompanyVerificationStatus } from '@prisma/client';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('companies')
  @ApiOperation({ summary: 'Get companies by verification status' })
  @ApiQuery({ name: 'status', enum: CompanyVerificationStatus, required: false })
  async getCompanies(@Query('status') status?: CompanyVerificationStatus) {
    return this.adminService.getCompanies(status);
  }

  @Post('companies/:id/verify')
  @ApiOperation({ summary: 'Approve company verification' })
  async verifyCompany(@Param('id') id: string) {
    return this.adminService.verifyCompany(id);
  }

  @Post('companies/:id/reject')
  @ApiOperation({ summary: 'Reject company verification' })
  async rejectCompany(
    @Param('id') id: string,
    @Body() body: { reason: string }
  ) {
    return this.adminService.rejectCompany(id, body.reason);
  }
}
```

##### 2. Create Admin Service
**File**: `apps/api/src/admin/admin.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyVerificationStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getCompanies(status?: CompanyVerificationStatus) {
    return this.prisma.company.findMany({
      where: status ? { verificationStatus: status } : {},
      include: {
        user: {
          select: {
            email: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async verifyCompany(id: string) {
    return this.prisma.company.update({
      where: { id },
      data: {
        verificationStatus: CompanyVerificationStatus.VERIFIED,
        verifiedAt: new Date(),
        rejectionReason: null,
      },
    });
  }

  async rejectCompany(id: string, reason: string) {
    return this.prisma.company.update({
      where: { id },
      data: {
        verificationStatus: CompanyVerificationStatus.REJECTED,
        rejectionReason: reason,
        verifiedAt: null,
      },
    });
  }
}
```

##### 3. Create Admin Module
**File**: `apps/api/src/admin/admin.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService, PrismaService],
})
export class AdminModule {}
```

##### 4. Register Admin Module
**File**: `apps/api/src/app.module.ts`
```typescript
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    // ... existing modules
    AdminModule,
  ],
})
```

#### Frontend Changes

##### 5. Create Companies Verification Page
**File**: `apps/web/app/admin/companies/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

export default function CompaniesPage() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('PENDING');

  useEffect(() => {
    fetchCompanies(activeTab);
  }, [activeTab]);

  const fetchCompanies = async (status: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/companies?status=${status}`);
      setCompanies(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load companies',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id: string) => {
    try {
      await api.post(`/admin/companies/${id}/verify`);
      toast({
        title: 'Success',
        description: 'Company verified successfully',
      });
      fetchCompanies(activeTab);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify company',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await api.post(`/admin/companies/${id}/reject`, { reason });
      toast({
        title: 'Success',
        description: 'Company rejected',
      });
      fetchCompanies(activeTab);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject company',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Company Verification</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="VERIFIED">Verified</TabsTrigger>
          <TabsTrigger value="REJECTED">Rejected</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : companies.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No {activeTab.toLowerCase()} companies
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {companies.map((company: any) => (
                <Card key={company.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{company.companyName}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {company.user.email}
                        </p>
                      </div>
                      <Badge variant={
                        company.verificationStatus === 'VERIFIED' ? 'default' :
                        company.verificationStatus === 'REJECTED' ? 'destructive' :
                        'secondary'
                      }>
                        {company.verificationStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Website:</span>{' '}
                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {company.website}
                        </a>
                      </div>
                      <div>
                        <span className="font-medium">Industry:</span> {company.industry || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Size:</span> {company.companySize || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">Jobs Posted:</span> {company._count.jobs}
                      </div>
                    </div>

                    {company.verificationDocUrl && (
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(company.verificationDocUrl, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Verification Document
                        </Button>
                      </div>
                    )}

                    {company.rejectionReason && (
                      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                        <p className="text-sm font-medium text-red-900 dark:text-red-200">
                          Rejection Reason:
                        </p>
                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                          {company.rejectionReason}
                        </p>
                      </div>
                    )}

                    {company.verificationStatus === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVerify(company.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(company.id)}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Testing Checklist**:
- [ ] Pending companies list loads
- [ ] Approve button updates status to VERIFIED
- [ ] Reject button prompts for reason and updates status
- [ ] Tabs switch correctly between statuses
- [ ] Verification document link opens in new tab

---

### Ticket 1.3: Document Review (Enhancement)

**Effort**: 2 hours  
**Optional**: Can be done in Sprint 2

This ticket adds a modal for better document review instead of opening in new tab.

**File**: `apps/web/app/admin/companies/page.tsx` (enhancement)

Add Dialog component for document preview:
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Add state
const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

// Replace button with:
<Button
  variant="outline"
  size="sm"
  onClick={() => setSelectedDoc(company.verificationDocUrl)}
>
  <ExternalLink className="w-4 h-4 mr-2" />
  View Document
</Button>

// Add dialog at end of component
<Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
  <DialogContent className="max-w-4xl h-[80vh]">
    <DialogHeader>
      <DialogTitle>Verification Document</DialogTitle>
    </DialogHeader>
    <iframe src={selectedDoc || ''} className="w-full h-full" />
  </DialogContent>
</Dialog>
```

---

## Epic 2: Payments Infrastructure

**Estimated Effort**: 16 hours  
**Priority**: P0 (Blocking for revenue)

### Current State Analysis
- Schema has `Payment` model and `creditsBalance` field
- `stripe` dependency was removed in cleanup
- Credit deduction logic exists in `ApplicationsService`

---

### Ticket 2.1: Stripe Re-integration

**Effort**: 6 hours  
**Files to Create/Modify**: 6 files

#### Backend Changes

##### 1. Install Stripe
```bash
cd apps/api
npm install stripe @types/stripe
```

##### 2. Update Environment Variables
**File**: `apps/api/.env`
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PRO=price_...
```

##### 3. Create Payments Service
**File**: `apps/api/src/payments/payments.service.ts`
```typescript
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private stripe: Stripe;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.config.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2024-11-20.acacia',
    });
  }

  async createCheckoutSession(userId: string, priceId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true },
    });

    if (!user?.company) {
      throw new Error('Company not found');
    }

    const session = await this.stripe.checkout.sessions.create({
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.config.get('FRONTEND_URL')}/company/billing?success=true`,
      cancel_url: `${this.config.get('FRONTEND_URL')}/company/billing?canceled=true`,
      metadata: {
        companyId: user.company.id,
        userId: user.id,
      },
    });

    return { url: session.url };
  }

  async handleWebhook(signature: string, payload: Buffer) {
    const webhookSecret = this.config.get('STRIPE_WEBHOOK_SECRET');
    
    let event: Stripe.Event;
    
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        webhookSecret,
      );
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.fulfillOrder(session);
    }

    return { received: true };
  }

  private async fulfillOrder(session: Stripe.Checkout.Session) {
    const companyId = session.metadata.companyId;
    const amount = session.amount_total / 100; // Convert cents to dollars
    
    // Determine credits based on amount
    let creditsToAdd = 0;
    let description = '';
    
    if (amount === 99) {
      creditsToAdd = 50;
      description = 'Starter Pack - 50 credits';
    } else if (amount === 299) {
      creditsToAdd = 200;
      description = 'Pro Pack - 200 credits';
    }

    // Create payment record
    await this.prisma.payment.create({
      data: {
        companyId,
        amount,
        currency: 'USD',
        stripePaymentId: session.payment_intent as string,
        status: PaymentStatus.COMPLETED,
        description,
        creditsAdded: creditsToAdd,
        paidAt: new Date(),
      },
    });

    // Add credits to company
    await this.prisma.company.update({
      where: { id: companyId },
      data: {
        creditsBalance: {
          increment: creditsToAdd,
        },
      },
    });
  }

  async getPaymentHistory(companyId: string) {
    return this.prisma.payment.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

##### 4. Create Payments Controller
**File**: `apps/api/src/payments/payments.controller.ts`
```typescript
import { Controller, Post, Get, Body, Headers, RawBodyRequest, Req, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  async createCheckoutSession(
    @Request() req,
    @Body() body: { priceId: string }
  ) {
    return this.paymentsService.createCheckoutSession(req.user.userId, body.priceId);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Stripe webhook handler' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() request: RawBodyRequest<Request>,
  ) {
    return this.paymentsService.handleWebhook(signature, request.rawBody);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COMPANY)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment history' })
  async getPaymentHistory(@Request() req) {
    const user = await this.paymentsService['prisma'].user.findUnique({
      where: { id: req.user.userId },
      include: { company: true },
    });
    return this.paymentsService.getPaymentHistory(user.company.id);
  }
}
```

##### 5. Create Payments Module
**File**: `apps/api/src/payments/payments.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PrismaService],
})
export class PaymentsModule {}
```

##### 6. Register Payments Module
**File**: `apps/api/src/app.module.ts`
```typescript
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    // ... existing modules
    PaymentsModule,
  ],
})
```

##### 7. Configure Raw Body for Webhooks
**File**: `apps/api/src/main.ts`
```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for Stripe webhooks
  });

  // ... rest of configuration
}
```

**Testing Checklist**:
- [ ] Checkout session creation returns valid URL
- [ ] Webhook signature verification works
- [ ] Credits are added after successful payment
- [ ] Payment record is created
- [ ] Payment history endpoint returns data

---

### Ticket 2.2: Webhook Handler (Covered in 2.1)

This is integrated into Ticket 2.1 above.

---

### Ticket 2.3: Billing UI

**Effort**: 5 hours  
**Files to Create**: 1 file

#### Frontend Changes

##### Create Billing Page
**File**: `apps/web/app/company/billing/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Check, CreditCard, Clock } from 'lucide-react';

const PRICING_PLANS = [
  {
    name: 'Starter',
    price: 99,
    credits: 50,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER,
    features: [
      '50 assessment credits',
      'Basic analytics',
      'Email support',
      'Valid for 6 months',
    ],
  },
  {
    name: 'Pro',
    price: 299,
    credits: 200,
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    popular: true,
    features: [
      '200 assessment credits',
      'Advanced analytics',
      'Priority support',
      'Valid for 12 months',
      'Custom branding',
    ],
  },
];

export default function BillingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchBalance();
    fetchHistory();

    // Handle success/cancel redirects
    if (searchParams.get('success')) {
      toast({
        title: 'Payment Successful!',
        description: 'Your credits have been added to your account.',
      });
      router.replace('/company/billing');
    } else if (searchParams.get('canceled')) {
      toast({
        title: 'Payment Canceled',
        description: 'Your payment was canceled.',
        variant: 'destructive',
      });
      router.replace('/company/billing');
    }
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await api.get('/auth/me');
      setBalance(response.data.company.creditsBalance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/payments/history');
      setHistory(response.data);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const handlePurchase = async (priceId: string) => {
    setLoading(true);
    try {
      const response = await api.post('/payments/create-checkout-session', {
        priceId,
      });
      window.location.href = response.data.url;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create checkout session',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Billing & Credits</h1>
          <p className="text-muted-foreground mt-2">
            Purchase assessment credits to hire top talent
          </p>
        </div>

        {/* Current Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Available assessment credits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {balance} <span className="text-xl text-muted-foreground">credits</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Each credit allows one candidate to take an assessment
            </p>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Purchase Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRICING_PLANS.map((plan) => (
              <Card key={plan.name} className={plan.popular ? 'border-primary border-2' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{plan.name}</CardTitle>
                      <CardDescription>{plan.credits} credits</CardDescription>
                    </div>
                    {plan.popular && (
                      <Badge>Most Popular</Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground ml-2">one-time</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    onClick={() => handlePurchase(plan.priceId)}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Purchase {plan.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment History */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Payment History</h2>
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No payment history yet
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {history.map((payment: any) => (
                    <div key={payment.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{payment.description}</p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {new Date(payment.paidAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${payment.amount}</p>
                        <Badge variant="outline" className="mt-1">
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
```

##### Add Environment Variables
**File**: `apps/web/.env.local`
```env
NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_ID_PRO=price_...
```

**Testing Checklist**:
- [ ] Current balance displays correctly
- [ ] Pricing cards render with features
- [ ] Purchase button redirects to Stripe Checkout
- [ ] Success redirect shows toast and updates balance
- [ ] Payment history displays transactions

---

## Epic 3: MCQ Module

**Estimated Effort**: 12 hours  
**Priority**: P1 (Feature enhancement)

### Ticket 3.1: Question Bank Management

**Effort**: 4 hours  
**Files to Create/Modify**: 4 files

#### Backend Changes

##### 1. Create MCQ DTO
**File**: `apps/api/src/admin/dto/mcq.dto.ts`
```typescript
import { IsString, IsNotEmpty, IsArray, IsInt, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MCQDifficulty } from '@prisma/client';

export class CreateMCQDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  options: string[];

  @ApiProperty()
  @IsInt()
  correctAnswer: number;

  @ApiProperty({ required: false })
  @IsString()
  explanation?: string;

  @ApiProperty({ enum: MCQDifficulty })
  @IsEnum(MCQDifficulty)
  difficulty: MCQDifficulty;

  @ApiProperty({ type: [String] })
  @IsArray()
  tags: string[];
}
```

##### 2. Add MCQ Methods to Admin Service
**File**: `apps/api/src/admin/admin.service.ts`
```typescript
async createMCQ(dto: CreateMCQDto) {
  return this.prisma.mCQQuestion.create({
    data: {
      question: dto.question,
      options: dto.options,
      correctAnswer: dto.correctAnswer,
      explanation: dto.explanation,
      difficulty: dto.difficulty,
      tags: dto.tags,
    },
  });
}

async getMCQs(difficulty?: MCQDifficulty) {
  return this.prisma.mCQQuestion.findMany({
    where: difficulty ? { difficulty } : {},
    orderBy: { createdAt: 'desc' },
  });
}

async deleteMCQ(id: string) {
  return this.prisma.mCQQuestion.delete({
    where: { id },
  });
}
```

##### 3. Add MCQ Endpoints to Admin Controller
**File**: `apps/api/src/admin/admin.controller.ts`
```typescript
@Post('mcq')
@ApiOperation({ summary: 'Create MCQ question' })
async createMCQ(@Body() dto: CreateMCQDto) {
  return this.adminService.createMCQ(dto);
}

@Get('mcq')
@ApiOperation({ summary: 'Get MCQ questions' })
@ApiQuery({ name: 'difficulty', enum: MCQDifficulty, required: false })
async getMCQs(@Query('difficulty') difficulty?: MCQDifficulty) {
  return this.adminService.getMCQs(difficulty);
}

@Delete('mcq/:id')
@ApiOperation({ summary: 'Delete MCQ question' })
async deleteMCQ(@Param('id') id: string) {
  return this.adminService.deleteMCQ(id);
}
```

#### Frontend Changes

##### 4. Create MCQ Management Page
**File**: `apps/web/app/admin/mcq/page.tsx`
```typescript
'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Plus, Trash2 } from 'lucide-react';

export default function MCQPage() {
  const { toast } = useToast();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'MEDIUM',
    tags: '',
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/admin/mcq');
      setQuestions(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load questions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/mcq', {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()),
      });
      toast({
        title: 'Success',
        description: 'Question created successfully',
      });
      setShowForm(false);
      setFormData({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: 0,
        explanation: '',
        difficulty: 'MEDIUM',
        tags: '',
      });
      fetchQuestions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create question',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    
    try {
      await api.delete(`/admin/mcq/${id}`);
      toast({
        title: 'Success',
        description: 'Question deleted',
      });
      fetchQuestions();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete question',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">MCQ Question Bank</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Question</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Question</Label>
                <Textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              {formData.options.map((option, index) => (
                <div key={index}>
                  <Label>Option {index + 1}</Label>
                  <Input
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    required
                  />
                </div>
              ))}

              <div>
                <Label>Correct Answer (0-3)</Label>
                <Input
                  type="number"
                  min="0"
                  max="3"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div>
                <Label>Explanation (Optional)</Label>
                <Textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                />
              </div>

              <div>
                <Label>Difficulty</Label>
                <Select
                  value={formData.difficulty}
                  onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="JavaScript, Arrays, Algorithms"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit">Create Question</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4">
          {questions.map((q: any) => (
            <Card key={q.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-base">{q.question}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(q.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {q.options.map((opt: string, idx: number) => (
                  <div
                    key={idx}
                    className={`p-2 rounded ${idx === q.correctAnswer ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
                  >
                    {idx + 1}. {opt}
                    {idx === q.correctAnswer && ' ✓'}
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {q.difficulty}
                  </span>
                  {q.tags.map((tag: string) => (
                    <span key={tag} className="text-xs bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Testing Checklist**:
- [ ] Question creation form works
- [ ] Questions list displays correctly
- [ ] Delete functionality works
- [ ] Difficulty and tags are saved
- [ ] Correct answer is highlighted

---

### Ticket 3.2: Assessment Integration

**Effort**: 4 hours  
**Files to Modify**: 2 files

#### Backend Changes

##### 1. Update Assessments Service
**File**: `apps/api/src/assessments/assessments.service.ts`

Add method to fetch random MCQs:
```typescript
async startSession(userId: string, applicationId: string) {
  // ... existing code to create session

  // Fetch MCQ questions if enabled in job config
  const job = application.job;
  const config = job.assessmentConfig as any;
  
  if (config.modules?.includes('MCQ')) {
    const mcqCount = config.mcqCount || 5;
    const difficulty = config.mcqDifficulty || 'MEDIUM';
    
    const questions = await this.prisma.mCQQuestion.findMany({
      where: { difficulty },
      take: mcqCount,
      orderBy: { createdAt: 'desc' },
    });

    // Store question IDs in session for later validation
    await this.prisma.assessmentSession.update({
      where: { id: session.id },
      data: {
        // Add a JSON field to store MCQ question IDs
        calibrationData: {
          mcqQuestionIds: questions.map(q => q.id),
        },
      },
    });
  }

  return session;
}
```

Add MCQ submission handler:
```typescript
async submitMCQResponse(
  userId: string,
  sessionId: string,
  questionId: string,
  selectedAnswer: number,
) {
  const session = await this.getSession(userId, sessionId);
  
  const question = await this.prisma.mCQQuestion.findUnique({
    where: { id: questionId },
  });

  const isCorrect = question.correctAnswer === selectedAnswer;
  const timeSpent = 60; // Track this from frontend

  return this.prisma.mCQResponse.create({
    data: {
      sessionId,
      questionId,
      selectedAnswer,
      isCorrect,
      timeSpentSeconds: timeSpent,
    },
  });
}
```

##### 2. Update Assessments Controller
**File**: `apps/api/src/assessments/assessments.controller.ts`

Add MCQ endpoints:
```typescript
@Get('session/:sessionId/mcq')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@ApiBearerAuth()
@ApiOperation({ summary: 'Get MCQ questions for session' })
async getMCQQuestions(@Request() req, @Param('sessionId') sessionId: string) {
  const session = await this.assessmentsService.getSession(req.user.userId, sessionId);
  const questionIds = (session.calibrationData as any)?.mcqQuestionIds || [];
  
  return this.assessmentsService['prisma'].mCQQuestion.findMany({
    where: { id: { in: questionIds } },
    select: {
      id: true,
      question: true,
      options: true,
      difficulty: true,
      // Don't send correctAnswer or explanation
    },
  });
}

@Post('mcq/submit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.STUDENT)
@ApiBearerAuth()
@ApiOperation({ summary: 'Submit MCQ response' })
async submitMCQ(
  @Request() req,
  @Body() body: { sessionId: string; questionId: string; selectedAnswer: number }
) {
  return this.assessmentsService.submitMCQResponse(
    req.user.userId,
    body.sessionId,
    body.questionId,
    body.selectedAnswer,
  );
}
```

**Testing Checklist**:
- [ ] MCQ questions are fetched when session starts
- [ ] Question IDs are stored in session
- [ ] MCQ submission creates response record
- [ ] Correct/incorrect is calculated properly

---

### Ticket 3.3: Student Interface

**Effort**: 4 hours  
**Files to Modify**: 1 file

#### Frontend Changes

##### Update Assessment Page
**File**: `apps/web/app/assessment/[sessionId]/page.tsx`

Add MCQ tab and state:
```typescript
const [mcqQuestions, setMcqQuestions] = useState([]);
const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
const [activeTab, setActiveTab] = useState('coding');

useEffect(() => {
  const fetchMCQ = async () => {
    try {
      const response = await api.get(`/assessments/session/${sessionId}/mcq`);
      setMcqQuestions(response.data);
    } catch (error) {
      console.error('Failed to fetch MCQ:', error);
    }
  };

  if (sessionId) {
    fetchMCQ();
  }
}, [sessionId]);

const handleMCQSubmit = async (questionId: string, answer: number) => {
  try {
    await api.post('/assessments/mcq/submit', {
      sessionId,
      questionId,
      selectedAnswer: answer,
    });
    setMcqAnswers({ ...mcqAnswers, [questionId]: answer });
  } catch (error) {
    console.error('Failed to submit MCQ:', error);
  }
};
```

Add Tabs UI:
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// In the return statement, wrap the existing layout:
<Tabs value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="coding">Coding</TabsTrigger>
    {mcqQuestions.length > 0 && (
      <TabsTrigger value="mcq">
        Quiz ({Object.keys(mcqAnswers).length}/{mcqQuestions.length})
      </TabsTrigger>
    )}
  </TabsList>

  <TabsContent value="coding">
    {/* Existing code editor layout */}
  </TabsContent>

  <TabsContent value="mcq">
    <div className="space-y-6 p-6">
      {mcqQuestions.map((q: any, index: number) => (
        <Card key={q.id}>
          <CardHeader>
            <CardTitle className="text-base">
              Question {index + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="font-medium">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((option: string, optIndex: number) => (
                <div
                  key={optIndex}
                  className={`p-3 rounded border cursor-pointer transition-colors ${
                    mcqAnswers[q.id] === optIndex
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => handleMCQSubmit(q.id, optIndex)}
                >
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${q.id}`}
                      checked={mcqAnswers[q.id] === optIndex}
                      onChange={() => {}}
                      className="w-4 h-4"
                    />
                    <span>{option}</span>
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </TabsContent>
</Tabs>
```

**Testing Checklist**:
- [ ] MCQ tab appears when questions exist
- [ ] Questions render correctly
- [ ] Radio button selection works
- [ ] Answers are submitted to backend
- [ ] Progress counter updates

---

## Sprint Execution Plan

### Week 1 (20 hours)
**Days 1-2**: Epic 1 - Company Verification
- Ticket 1.1: Admin auth & layout (3h)
- Ticket 1.2: Verification queue (4h)
- Ticket 1.3: Document review (2h)
- **Testing & Bug Fixes**: 3h

**Days 3-5**: Epic 2 - Payments (Part 1)
- Ticket 2.1: Stripe re-integration (6h)
- **Testing & Bug Fixes**: 2h

### Week 2 (20 hours)
**Days 6-7**: Epic 2 - Payments (Part 2)
- Ticket 2.3: Billing UI (5h)
- **Webhook Testing**: 3h

**Days 8-10**: Epic 3 - MCQ Module
- Ticket 3.1: Question bank (4h)
- Ticket 3.2: Assessment integration (4h)
- Ticket 3.3: Student interface (4h)

---

## Definition of Done

### For Each Ticket
- [ ] Code implemented and committed
- [ ] Unit tests written (if applicable)
- [ ] Manual testing completed
- [ ] No console errors
- [ ] Responsive design verified
- [ ] Code reviewed

### For Each Epic
- [ ] All tickets completed
- [ ] Integration testing passed
- [ ] Documentation updated
- [ ] Demo-ready

### For Sprint
- [ ] All epics completed
- [ ] End-to-end testing passed
- [ ] Sprint demo delivered
- [ ] Retrospective conducted

---

## Risk Mitigation

### High-Risk Items
1. **Stripe Webhook Security**: Ensure signature verification is bulletproof
2. **Payment Failures**: Add comprehensive error handling
3. **MCQ Question Quality**: Start with small question bank

### Contingency Plans
- If Stripe integration takes longer, defer MCQ module to Sprint 2
- If admin panel is delayed, allow manual DB verification temporarily
- If MCQ UI is complex, start with basic radio buttons

---

## Success Criteria

### Business Metrics
- ✅ Companies can purchase credits
- ✅ Admin can verify companies within 24 hours
- ✅ Students can take MCQ assessments
- ✅ Zero payment processing errors

### Technical Metrics
- ✅ All API endpoints return < 500ms
- ✅ Webhook processing < 2s
- ✅ Zero security vulnerabilities
- ✅ 100% uptime during sprint

---

## Next Steps After Sprint 1

### Sprint 2 Candidates
1. Email notification system
2. Advanced analytics dashboard
3. Enhanced proctoring features
4. Mobile responsiveness improvements
5. Performance optimization

---

**Ready to Start?** 🚀

This plan is comprehensive and actionable. Each ticket has clear deliverables, code examples, and testing checklists. You can start implementation immediately or request clarification on any specific ticket.
