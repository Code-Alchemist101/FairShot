'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Shield, Sparkles } from 'lucide-react';

export default function Home() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

        <div className="container px-4 md:px-6 mx-auto">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center text-center space-y-8"
          >
            <motion.div variants={item}>
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Hiring Revolution
              </div>
            </motion.div>

            <motion.h1 variants={item} className="text-4xl font-extrabold tracking-tight lg:text-7xl max-w-4xl bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Hire for <span className="text-primary">Skills</span>, <br /> Not Just Resumes.
            </motion.h1>

            <motion.p variants={item} className="text-xl text-muted-foreground max-w-[42rem] leading-normal">
              FairShot uses advanced AI assessments and proctoring to validate actual capabilities.
              No bias, no fluff—just the best talent for the job.
            </motion.p>

            <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
              <Link href="/register?role=company">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full">
                  Start Hiring <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/register?role=student">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 h-14 rounded-full border-2">
                  Find a Job
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-secondary/30">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center text-center p-6 space-y-4 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">AI Assessments</h3>
              <p className="text-muted-foreground">
                Instantly generate tailored MCQs and coding challenges specific to your job requirements using Gemini AI.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center text-center p-6 space-y-4 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Secure Proctoring</h3>
              <p className="text-muted-foreground">
                Advanced anti-cheat system with gaze tracking, tab-switch detection, and environment monitoring.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex flex-col items-center text-center p-6 space-y-4 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">Skill Validation</h3>
              <p className="text-muted-foreground">
                Move beyond resumes. Candidates prove their skills through interactive challenges and real-time coding.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
