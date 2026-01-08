'use client';

import { useAuth } from '@/lib/auth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, LayoutDashboard, Building, FileCheck, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Give zustand time to hydrate from localStorage
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    // Fetch stats for pending count
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/stats');
                setPendingCount(response.data.pendingCompanies);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            }
        };

        if (user && user.role === 'ADMIN') {
            fetchStats();
            // Refresh stats every 30 seconds
            const interval = setInterval(fetchStats, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        // Only check auth after loading is done
        if (isLoading) return;

        // Redirect to login if no user
        if (!user) {
            router.push('/login');
            return;
        }

        // Redirect to home if user is not admin
        if (user.role !== 'ADMIN') {
            router.push('/');
        }
    }, [user, isLoading, router]);

    // Show loading while zustand hydrates
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    // If no user after loading, show loading while redirecting
    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
        );
    }

    // If user is not admin, don't render anything (redirect will happen in useEffect)
    if (user.role !== 'ADMIN') {
        return null;
    }

    const navItems = [
        { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { href: '/admin/companies', icon: Building, label: 'Verification Queue' },
        { href: '/admin/mcq', icon: FileCheck, label: 'Question Bank' },
    ];

    return (
        <div className="min-h-screen bg-slate-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">F</span>
                        </div>
                        <div>
                            <h1 className="text-white font-bold text-lg">FairShot</h1>
                            <p className="text-cyan-400 text-xs font-medium">Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link key={item.href} href={item.href}>
                                <div
                                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className="w-5 h-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {item.href === '/admin/companies' && pendingCount > 0 && (
                                        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                                            {pendingCount}
                                        </Badge>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                    {user.email.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{user.email}</p>
                                <p className="text-cyan-400 text-xs">Administrator</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                logout();
                                window.location.href = '/login';
                            }}
                            className="text-slate-400 hover:text-white hover:bg-slate-800"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="bg-slate-950 border-b border-slate-800 px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-white text-xl font-bold">Control Tower</h2>
                            <p className="text-slate-400 text-sm">Manage your platform with precision</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                <span className="text-green-400 text-xs font-medium">● System Online</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-auto p-8 bg-slate-900">
                    {children}
                </div>
            </main>
        </div>
    );
}
