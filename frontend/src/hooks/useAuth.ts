import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthHook extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const useAuth = (): AuthHook => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const refreshToken = useCallback(async () => {
    try {
      const response = await authApi.refresh();
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setState((prev) => ({
        ...prev,
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to refresh token',
      }));
      localStorage.removeItem('token');
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      refreshToken();
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, [refreshToken]);

  const login = async (username: string, password: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const response = await authApi.login(username, password);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Invalid username or password',
      }));
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  return {
    ...state,
    login,
    logout,
    refreshToken,
  };
};

export default useAuth; 