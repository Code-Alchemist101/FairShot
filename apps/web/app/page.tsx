import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to FairShot
        </h1>
        <p className="text-xl text-muted-foreground max-w-md mx-auto">
          The revolutionary hiring platform that prioritizes skills over resumes.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button size="lg">Login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg">Register</Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
