import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthState } from '../types';
import { authApi, LoginParams, RegisterParams } from '../api/auth.api';

interface AuthContextType extends AuthState {
  login: (params: LoginParams) => Promise<User>;
  register: (params: RegisterParams) => Promise<User>;
  logout: () => void;
  setActAsRole: (role: UserRole | null) => void;
  effectiveRole: UserRole | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('foodlink_jwt_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actAsRole, setActAsRoleState] = useState<UserRole | null>(() => {
    return (localStorage.getItem('foodlink_act_as_role') as UserRole) || null;
  });

  // Verify active session on load
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('foodlink_jwt_token');
      if (savedToken) {
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (params: LoginParams): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.login(params);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('foodlink_jwt_token', res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (params: RegisterParams): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await authApi.register(params);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('foodlink_jwt_token', res.token);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActAsRoleState(null);
    localStorage.removeItem('foodlink_jwt_token');
    localStorage.removeItem('foodlink_act_as_role');
  };

  const setActAsRole = (role: UserRole | null) => {
    if (user?.role !== 'ADMIN') return; // Only Admin can switch preview mode
    setActAsRoleState(role);
    if (role) {
      localStorage.setItem('foodlink_act_as_role', role);
    } else {
      localStorage.removeItem('foodlink_act_as_role');
    }
  };

  // Compute effective role for UI routing/preview
  const effectiveRole = user?.role === 'ADMIN' && actAsRole ? actAsRole : user?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        actAsRole,
        effectiveRole,
        login,
        register,
        logout,
        setActAsRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
