import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AuthUser } from '../../shared-data/types';
import { movieAppApi } from '../services/mock-api';

// Debug: Log AuthContext API instance
console.log('🔐 AuthContext API instance:', movieAppApi);

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  requiresMfa: boolean;
  mfaTicket: string | null;
}

interface AuthContextType {
  authState: AuthState;
  signIn: (userName: string, password: string) => Promise<{ success: boolean; error?: string; requiresMfa?: boolean; mfaTicket?: string }>;
  verifyMfa: (mfaTicket: string, code: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  updateSubscription: (plan: 'starter' | 'premium' | 'cinematic') => Promise<void>;
  refreshAuthToken: () => Promise<boolean>;
}

const defaultAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  refreshToken: null,
  requiresMfa: false,
  mfaTicket: null,
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

  const signIn = async (userName: string, password: string) => {
    try {
      const response = await movieAppApi.login(userName, password);
      
      if (response.errorCode === 200 && response.data) {
        if (response.data.requiresMfa) {
          // MFA required
          setAuthState(prev => ({
            ...prev,
            requiresMfa: true,
            mfaTicket: response.data?.mfaTicket || null,
          }));
          return { 
            success: false, 
            requiresMfa: true, 
            mfaTicket: response.data?.mfaTicket 
          };
        } else {
          // Login successful
          console.log('🔐 AuthContext: Login successful, setting auth state');
          console.log('🔐 AuthContext: Response data:', response.data);
          console.log('🔐 AuthContext: User from response:', response.data.user);
          
          setAuthState({
            isAuthenticated: true,
            user: response.data.user, // Fix: Use response.data.user instead of response.data
            token: response.data.token,
            refreshToken: response.data.refreshToken,
            requiresMfa: false,
            mfaTicket: null,
          });
          return { success: true };
        }
      } else {
        return { 
          success: false, 
          error: response.errorMessage || 'Login failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const verifyMfa = async (mfaTicket: string, code: string) => {
    try {
      const response = await movieAppApi.verifyMfa(mfaTicket, code);
      
      if (response.errorCode === 200 && response.data) {
        console.log('🔐 AuthContext: MFA verification successful');
        console.log('🔐 AuthContext: MFA response data:', response.data);
        console.log('🔐 AuthContext: MFA user from response:', response.data.user);
        
        setAuthState({
          isAuthenticated: true,
          user: response.data.user, // Fix: Use response.data.user instead of response.data
          token: response.data.token,
          refreshToken: response.data.refreshToken,
          requiresMfa: false,
          mfaTicket: null,
        });
        return { success: true };
      } else {
        return { 
          success: false, 
          error: response.errorMessage || 'MFA verification failed' 
        };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'MFA verification failed' 
      };
    }
  };

  const signOut = async () => {
    try {
      const { movieAppApi } = await import('../services/mock-api');
      await movieAppApi.logout();
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      setAuthState(defaultAuthState);
    }
  };

  const updateUser = (userUpdates: Partial<AuthUser>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...userUpdates } : null
    }));
  };

  const updateSubscription = async (plan: 'starter' | 'premium' | 'cinematic') => {
    if (!authState.user) return;

    const now = new Date();
    const endDate = new Date();
    
    // Calculate end date based on plan
    if (plan === 'premium') {
      endDate.setMonth(endDate.getMonth() + 1); // 1 month
    } else if (plan === 'cinematic') {
      endDate.setMonth(endDate.getMonth() + 2); // 2 months
    } else {
      endDate.setFullYear(endDate.getFullYear() + 1); // 1 year for starter (free)
    }

    const subscription = {
      plan,
      status: 'active' as const,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      autoRenew: plan !== 'starter',
    };

    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { 
        ...prev.user, 
        subscription 
      } : null
    }));
  };

  const refreshAuthToken = async () => {
    try {
      const response = await movieAppApi.refreshToken();
      
      if (response.errorCode === 200 && response.data) {
        setAuthState(prev => ({
          ...prev,
          token: response.data?.token || prev.token,
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.warn('Token refresh failed:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      authState,
      signIn,
      verifyMfa,
      signOut,
      updateUser,
      updateSubscription,
      refreshAuthToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
