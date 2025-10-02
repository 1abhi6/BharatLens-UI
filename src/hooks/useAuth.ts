import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setIsAuthenticated(!!token);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login...');
      const response = await api.login(email, password);
      console.log('Login response:', response);
      localStorage.setItem('access_token', response.access_token);
      setIsAuthenticated(true);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate('/chat');
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      toast({
        title: "Login failed",
        description: error.response?.data?.detail || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, full_name: string) => {
    try {
      await api.register(email, password, full_name);
      toast({
        title: "Registration successful",
        description: "Please login with your credentials",
      });
      navigate('/login');
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.detail || "Could not create account",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
    navigate('/login');
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };
};
