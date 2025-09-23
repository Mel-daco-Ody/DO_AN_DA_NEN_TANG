import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

interface AuthContextType {
  authState: AuthState;
  signIn: (user: User) => void;
  signOut: () => void;
  updateUser: (user: Partial<User>) => void;
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(defaultAuthState);

  const signIn = (user: User) => {
    setAuthState({
      isAuthenticated: true,
      user
    });
  };

  const signOut = () => {
    setAuthState({
      isAuthenticated: false,
      user: null
    });
  };

  const updateUser = (userUpdates: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userUpdates } : null
    }));
  };

  return (
    <AuthContext.Provider value={{
      authState,
      signIn,
      signOut,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
