import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import {
  loginStaff,
  AuthUser,
} from '../services/api';

// =========================
// CONTEXT TYPE
// =========================

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<AuthUser>;

  logout: () => void;
}

// =========================
// CREATE CONTEXT
// =========================

const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

// =========================
// PROVIDER PROPS
// =========================

interface AuthProviderProps {
  children: ReactNode;
}

// =========================
// AUTH PROVIDER
// =========================

export const AuthProvider: React.FC<
  AuthProviderProps
> = ({ children }) => {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [token, setToken] =
    useState<string | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  // =========================
  // RESTORE AUTH SESSION
  // =========================

  useEffect(() => {
    const storedToken =
      localStorage.getItem('serine_auth_token');

    const storedUser =
      localStorage.getItem('serine_auth_user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          'Failed to restore authentication session:',
          error
        );

        localStorage.removeItem(
          'serine_auth_token'
        );

        localStorage.removeItem(
          'serine_auth_user'
        );
      }
    }

    setIsLoading(false);
  }, []);

  // =========================
  // LOGIN
  // =========================

  const login = async (
  email: string,
  password: string
) => {
  const result = await loginStaff(
    email,
    password
  );

    // Save to React state
    setToken(result.token);
    setUser(result.user);

    // Persist session
    localStorage.setItem(
      'serine_auth_token',
      result.token
    );

    localStorage.setItem(
      'serine_auth_user',
      JSON.stringify(result.user)
    );
    return result.user;
  };



  // =========================
  // LOGOUT
  // =========================

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem(
      'serine_auth_token'
    );

    localStorage.removeItem(
      'serine_auth_user'
    );
  };

  // =========================
  // PROVIDER
  // =========================

  return (
    <AuthContext.Provider
      value={{
        user,
        token,

        isAuthenticated: !!token && !!user,

        isLoading,

        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// =========================
// CUSTOM HOOK
// =========================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used inside an AuthProvider'
    );
  }

  return context;
};