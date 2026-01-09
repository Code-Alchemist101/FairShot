'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

const studentSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    fullName: z.string().min(2, 'Full name is required'),
    phone: z.string().optional(),
});

const companySchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    companyName: z.string().min(2, 'Company name is required'),
    website: z.string().url('Invalid website URL'),
});

type StudentFormData = z.infer<typeof studentSchema>;
type CompanyFormData = z.infer<typeof companySchema>;

export default function RegisterPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { setAuth } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('student');

    const studentForm = useForm<StudentFormData>({
        resolver: zodResolver(studentSchema),
    });

    const companyForm = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema),
    });

    const onStudentSubmit = async (data: StudentFormData) => {
        setIsLoading(true);

        try {
            const response = await api.post('/auth/register', {
                ...data,
                role: 'STUDENT',
            });

            const { user, accessToken } = response.data;
            setAuth(user, accessToken);

            toast({
                title: 'Registration successful',
                description: 'Welcome to FairShot!',
            });

            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: 'Registration failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const onCompanySubmit = async (data: CompanyFormData) => {
        setIsLoading(true);

        try {
            const response = await api.post('/auth/register', {
                ...data,
                role: 'COMPANY',
            });

            const { user, accessToken } = response.data;
            setAuth(user, accessToken);

            toast({
                title: 'Registration successful',
                description: 'Your company account is pending verification.',
            });

            router.push('/dashboard');
        } catch (error: any) {
            toast({
                title: 'Registration failed',
                description: error.response?.data?.message || 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                        <CardDescription>
                            Choose your account type and get started with FairShot
                        </CardDescription>
                    </CardHeader>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <div className="px-6 mb-2">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="student">Student</TabsTrigger>
                                <TabsTrigger value="company">Company</TabsTrigger>
                            </TabsList>
                        </div>

                        {/* Student Registration */}
                        <TabsContent value="student">
                            <form onSubmit={studentForm.handleSubmit(onStudentSubmit)}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="student-fullName">Full Name</Label>
                                        <Input
                                            id="student-fullName"
                                            placeholder="John Doe"
                                            {...studentForm.register('fullName')}
                                            disabled={isLoading}
                                        />
                                        {studentForm.formState.errors.fullName && (
                                            <p className="text-sm text-red-500">
                                                {studentForm.formState.errors.fullName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="student-email">Email</Label>
                                        <Input
                                            id="student-email"
                                            type="email"
                                            placeholder="student@example.com"
                                            {...studentForm.register('email')}
                                            disabled={isLoading}
                                        />
                                        {studentForm.formState.errors.email && (
                                            <p className="text-sm text-red-500">
                                                {studentForm.formState.errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="student-phone">Phone (Optional)</Label>
                                        <Input
                                            id="student-phone"
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            {...studentForm.register('phone')}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="student-password">Password</Label>
                                        <Input
                                            id="student-password"
                                            type="password"
                                            placeholder="••••••••"
                                            {...studentForm.register('password')}
                                            disabled={isLoading}
                                        />
                                        {studentForm.formState.errors.password && (
                                            <p className="text-sm text-red-500">
                                                {studentForm.formState.errors.password.message}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="flex flex-col space-y-4">
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Creating account...' : 'Create student account'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </TabsContent>

                        {/* Company Registration */}
                        <TabsContent value="company">
                            <form onSubmit={companyForm.handleSubmit(onCompanySubmit)}>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="company-companyName">Company Name</Label>
                                        <Input
                                            id="company-companyName"
                                            placeholder="Acme Inc."
                                            {...companyForm.register('companyName')}
                                            disabled={isLoading}
                                        />
                                        {companyForm.formState.errors.companyName && (
                                            <p className="text-sm text-red-500">
                                                {companyForm.formState.errors.companyName.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company-website">Website</Label>
                                        <Input
                                            id="company-website"
                                            type="url"
                                            placeholder="https://acme.com"
                                            {...companyForm.register('website')}
                                            disabled={isLoading}
                                        />
                                        {companyForm.formState.errors.website && (
                                            <p className="text-sm text-red-500">
                                                {companyForm.formState.errors.website.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company-email">Email</Label>
                                        <Input
                                            id="company-email"
                                            type="email"
                                            placeholder="hr@acme.com"
                                            {...companyForm.register('email')}
                                            disabled={isLoading}
                                        />
                                        {companyForm.formState.errors.email && (
                                            <p className="text-sm text-red-500">
                                                {companyForm.formState.errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company-password">Password</Label>
                                        <Input
                                            id="company-password"
                                            type="password"
                                            placeholder="••••••••"
                                            {...companyForm.register('password')}
                                            disabled={isLoading}
                                        />
                                        {companyForm.formState.errors.password && (
                                            <p className="text-sm text-red-500">
                                                {companyForm.formState.errors.password.message}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>

                                <CardFooter className="flex flex-col space-y-4">
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading ? 'Creating account...' : 'Create company account'}
                                    </Button>
                                </CardFooter>
                            </form>
                        </TabsContent>
                    </Tabs>

                    <div className="text-sm text-center text-muted-foreground pb-6">
                        Already have an account?{' '}
                        <Link href="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
