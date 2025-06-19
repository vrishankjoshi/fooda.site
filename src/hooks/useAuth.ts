import { useState, useEffect } from 'react';

export interface User {
  name: string;
  email: string;
  createdAt?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on component mount
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('foodcheck_user');
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        localStorage.removeItem('foodcheck_user');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('foodcheck_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('foodcheck_user');
    // Also clear any other user-specific data
    localStorage.removeItem('foodcheck_ratings');
    localStorage.removeItem('foodcheck_last_rating_time');
    localStorage.removeItem('foodcheck_user_engagement');
  };

  const isAuthenticated = !!user;

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout
  };
};