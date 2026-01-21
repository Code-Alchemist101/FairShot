"use client";

import { useState } from "react";
// Removed Image import as per user request to be logo-less

// Icons
const ShieldIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
  </svg>
);

const BrainIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
  </svg>
);

const features = [
  {
    icon: <CodeIcon />,
    title: "Real-World Engineering",
    description: "Full-stack environments with IDE access, terminal, and documentation. Test deployment skills, not just algorithms.",
  },
  {
    icon: <BrainIcon />,
    title: "AI-Native Environment",
    description: "Candidates use embedded AI tools. We track *how* they prompt and integrate solutions, revealing their problem-solving depth.",
  },
  {
    icon: <EyeIcon />,
    title: "Intelligent Proctoring",
    description: "WebGazer eye tracking & biometrics powered by Gemini. Flags anomalies without invading privacy or requiring software inst.",
  },
  {
    icon: <ShieldIcon />,
    title: "Risk Analysis",
    description: "Automated risk scoring based on tab switching, copy-paste velocity, and code patterns. Hire with confidence.",
  },
];

const IdeMockup = () => (
  <div className="relative w-full max-w-4xl mx-auto rounded-xl overflow-hidden border border-[var(--border-subtle)] shadow-2xl bg-[#0f172a] animate-float">
    {/* Window Controls */}
    <div className="h-8 bg-[#1e293b] flex items-center px-4 gap-2 border-b border-[var(--border-subtle)]">
      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
      <div className="ml-4 text-xs text-gray-400 font-mono">fairshot_assessment_v1.tsx</div>
    </div>

    <div className="flex h-[400px]">
      {/* Sidebar */}
      <div className="w-12 border-r border-[var(--border-subtle)] bg-[#0f172a]/50 hidden sm:flex flex-col items-center py-4 gap-4 text-gray-500">
        <CodeIcon />
        <div className="w-8 h-px bg-[var(--border-subtle)]" />
        <BrainIcon />
      </div>

      {/* Editor Area */}
      <div className="flex-1 p-6 font-mono text-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-2 opacity-50">
          <div className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs border border-green-500/20">Proctoring Active ●</div>
        </div>

        <div className="text-gray-400 mb-2">import <span className="text-purple-400">React</span> from <span className="text-green-400">'react'</span>;</div>
        <div className="text-gray-400 mb-4">import <span className="text-purple-400">{`{ AiAssistant }`}</span> from <span className="text-green-400">'@fairshot/tools'</span>;</div>

        <div className="text-blue-400">export default function <span className="text-yellow-400">Solution</span>() {`{`}</div>
        <div className="pl-4 text-gray-300">
          <span className="text-gray-500">// Candidate is typing...</span>
          <br />
          const [data, setData] = <span className="text-purple-400">useAiQuery</span>(<span className="text-green-400">"Optimize DB query"</span>);
          <br />
          <br />
          return (
          <div className="pl-4">
            {`<div>`}
            <br />
            &nbsp;&nbsp;{`<Dashboard data={data} />`}
            <br />
            {`</div>`}
          </div>
          )
        </div>
        <div className="text-blue-400">{`}`}</div>

        {/* Scan Line Effect */}
        <div className="scan-line" />
      </div>

      {/* AI Chat Panel */}
      <div className="w-64 border-l border-[var(--border-subtle)] bg-[#1e293b]/30 hidden md:flex flex-col">
        <div className="p-3 text-xs font-semibold text-gray-400 border-b border-[var(--border-subtle)] bg-[#1e293b]/50">FAIRSHOT AI ASSISTANT</div>
        <div className="flex-1 p-4 space-y-4">
          <div className="bg-[#0f172a] p-3 rounded-lg border border-[var(--border-subtle)]">
            <p className="text-xs text-gray-300">How can I optimize this React effect?</p>
          </div>
          <div className="bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
            <p className="text-xs text-indigo-300">Consider moving the data fetch outside the render loop...</p>
          </div>
        </div>
        <div className="p-3 border-t border-[var(--border-subtle)]">
          <div className="h-8 bg-[#0f172a] rounded border border-[var(--border-subtle)]" />
        </div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[var(--space-950)]/80 border-b border-[var(--border-subtle)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-gradient-brand">FairShot</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors">Platform</a>
            <a href="#engine" className="text-gray-400 hover:text-white transition-colors">Engine</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Enterprise</a>
          </div>
          <a href="#cta" className="btn-primary text-sm py-2 px-4 shadow-lg shadow-indigo-500/20">
            Request Demo
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-32 px-6 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 text-center max-w-5xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 backdrop-blur-sm relative group cursor-pointer">
            <a href="https://fairshot-web.vercel.app" className="absolute inset-0 z-10"></a>
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">Public Beta Live</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-tight">
            Hire Engineers, <br />
            <span className="text-gradient-brand">Not Memorizers</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            The first assessment platform that lets candidates use AI tools while analysing their
            problem-solving process, not just the code output.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://fairshot-web.vercel.app" className="btn-primary text-lg px-8 py-3">
              Start Hiring
            </a>
            <a href="#demo" className="btn-secondary text-lg px-8 py-3">
              View Sample Report
            </a>
          </div>
        </div>

        {/* Product Visual */}
        <div className="w-full max-w-5xl mx-auto relative z-10 px-4">
          <IdeMockup />
        </div>
      </section>

      {/* Intelligence Layer */}
      <section id="features" className="py-32 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                The <span className="text-gradient-brand">Blind Spot</span> in Hiring
              </h2>
              <p className="text-lg text-gray-400 leading-relaxed mb-6">
                Traditional tests ban the very tools engineers use daily. This forces candidates to memorize syntax instead of demonstrating architectural thinking.
              </p>
              <p className="text-lg text-gray-400 leading-relaxed">
                FairShot inverts this. We encourage AI usage but monitor the *intent*. Did they copy-paste blindy? Or did they orchestrate the AI to solve a complex edge case?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/10">
                <div className="text-2xl font-bold text-red-400 mb-2">40%</div>
                <div className="text-sm text-gray-400">False Positives in standard coding tests</div>
              </div>
              <div className="p-6 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="text-2xl font-bold text-indigo-400 mb-2">3x</div>
                <div className="text-sm text-gray-400">Faster technical screening velocity</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="card-glass p-6 group hover:bg-[#1e293b]/50">
                <div className="w-12 h-12 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold mb-2 text-gray-200">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Bar */}
      <section className="py-20 border-y border-[var(--border-subtle)] bg-[#0f172a]/30">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-gray-500 tracking-widest uppercase mb-10">Powered by Enterprise Infrastructure</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Text-based logos for simplicity/speed */}
            <span className="text-xl font-bold text-white">Next.js</span>
            <span className="text-xl font-bold text-white">NestJS</span>
            <span className="text-xl font-bold text-blue-400">PostgreSQL</span>
            <span className="text-xl font-bold text-red-400">Redis</span>
            <span className="text-xl font-bold text-orange-400">Judge0</span>
            <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Google Gemini</span>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="cta" className="py-32 relative text-center px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Build Your <span className="text-gradient-brand">Dream Team</span>
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Join the engineering leaders who are switching to skill-first verification.
          </p>

          {submitted ? (
            <div className="p-6 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 inline-block">
              We'll be in touch shortly.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" suppressHydrationWarning>
              <input
                type="email"
                placeholder="work@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-6 py-4 rounded-lg bg-[#1e293b] border border-[var(--border-subtle)] focus:border-indigo-500 outline-none text-white placeholder-gray-500"
                suppressHydrationWarning
              />
              <button type="submit" className="btn-primary whitespace-nowrap" suppressHydrationWarning>
                Get Early Access
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-12 border-t border-[var(--border-subtle)] text-center text-gray-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="font-bold text-gray-300">FairShot</span>
          <span>&copy; 2026 FairShot Inc.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
