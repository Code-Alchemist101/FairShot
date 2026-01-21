'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ThankYouPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="flex justify-center">
                    <div className="h-24 w-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-500" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Assessment Submitted!
                </h1>

                <p className="text-gray-600 dark:text-gray-400">
                    Thank you for completing the assessment. Your results have been recorded and will be reviewed by the hiring team shortly.
                </p>

                <div className="pt-4">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-8 py-2"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
