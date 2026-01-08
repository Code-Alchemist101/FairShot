'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
    id: string;
    email: string;
    role: 'STUDENT' | 'COMPANY' | 'ADMIN';
    student?: any;
    company?: any;
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    return {
        user,
        loading,
        isAuthenticated,
        logout,
        checkAuth,
    };
}
