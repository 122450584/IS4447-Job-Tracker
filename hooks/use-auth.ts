import { useCallback, useState } from 'react';

import {
  type AuthUser,
  deleteProfile,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '@/services/auth-service';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback(async (input: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const nextUser = await registerUser(input);
      setUser(nextUser);
      return nextUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const nextUser = await loginUser(input);
      setUser(nextUser);
      return nextUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    setError(null);
  }, []);

  const removeProfile = useCallback(() => {
    if (!user) {
      return;
    }

    deleteProfile(user.id);
    setUser(null);
    setError(null);
  }, [user]);

  return {
    error,
    isLoading,
    login,
    logout,
    register,
    removeProfile,
    user,
  };
}
