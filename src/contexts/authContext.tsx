import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
    userId: string;
    name: string;
    email: string;
    department?: string;
    companyName?: string;
    isAdmin?: boolean;
    oid?: string;
    groups?: string[];
    loginWith?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: () => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    // Check if user is already logged in on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/user', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.user) {
                        console.log('User authenticated:', data.user);
                        setUser(data.user);
                        setError(null);
                    } else {
                        setUser(null);
                    }
                } else if (response.status === 401) {
                    setUser(null);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error checking auth:', error);
                setUser(null);
                // setError('Failed to verify authentication');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = () => {
        try {
            window.location.href = '/api/login/azure';
        } catch (err) {
            console.error('Login error:', err);
            setError('Failed to initiate login');
        }
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                setUser(null);
                setError(null);
                navigate('/');
            } else {
                setError('Failed to logout');
            }
        } catch (error) {
            console.error('Error logging out:', error);
            setError('Logout failed');
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            login,
            logout,
            isAuthenticated: !!user,
            error
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}