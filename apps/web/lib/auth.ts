'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    role: 'STUDENT' | 'COMPANY' | 'ADMIN';
    student?: any;
    company?: any;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => {
                set({
                    user,
                    token,
                    isAuthenticated: true,
                });

                // Save token to localStorage for API calls
                localStorage.setItem('token', token);

                // Sync to cookie for middleware (lightweight version)
                const cookieState = {
                    state: {
                        isAuthenticated: true,
                        user: { role: user.role }
                    }
                };
                document.cookie = `fairshot-auth=${JSON.stringify(cookieState)}; path=/; max-age=86400; SameSite=Lax`;
            },
            logout: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                });

                // Clear token from localStorage
                localStorage.removeItem('token');

                // Clear cookie
                document.cookie = `fairshot-auth=; path=/; max-age=0`;
            },
        }),
        {
            name: 'fairshot-auth',
        }
    )
);
