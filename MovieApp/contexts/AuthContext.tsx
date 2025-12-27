import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthUser } from '../shared-data';
import { movieAppApi } from '../services/mock-api';
import { filmzoneApi } from '../services/filmzone-api';

// Debug: Log AuthContext API instance
console.log('AuthContext API instance:', movieAppApi);

const AUTH_STORAGE_KEY = '@auth_state';
const REMEMBER_ME_KEY = '@remember_me';

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
  signIn: (userName: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string; requiresMfa?: boolean; mfaTicket?: string | null }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string; requiresMfa?: boolean; mfaTicket?: string | null }>;
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
  const [isLoading, setIsLoading] = useState(true);
  // store pending login response when MFA is required
  const [pendingLogin, setPendingLogin] = useState<any | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Load auth state from storage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Check if remember me was enabled
        const rememberMeValue = await AsyncStorage.getItem(REMEMBER_ME_KEY);
        const shouldRemember = rememberMeValue === 'true';
        setRememberMe(shouldRemember);
        
        // Only load auth state if remember me was enabled
        if (shouldRemember) {
          const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
          if (stored) {
            const parsedState = JSON.parse(stored);
            console.log('AuthContext: Loading auth state from storage:', {
              isAuthenticated: parsedState.isAuthenticated,
              hasUser: !!parsedState.user,
              userId: parsedState.user?.userID,
              hasToken: !!parsedState.token,
            });
            
            // Validate that we have required data
            if (parsedState.isAuthenticated && parsedState.token && parsedState.user?.userID) {
              // Restore token to API client
              movieAppApi.setToken(parsedState.token);
              filmzoneApi.setToken(parsedState.token);
              setAuthState(parsedState);
              console.log('AuthContext: Auth state restored from storage');
            } else {
              console.warn('AuthContext: Invalid auth state in storage, clearing...');
              await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
              await AsyncStorage.removeItem(REMEMBER_ME_KEY);
              setAuthState(defaultAuthState);
            }
          }
        } else {
          // If remember me is not enabled, clear any stored auth state
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          await AsyncStorage.removeItem(REMEMBER_ME_KEY);
        }
      } catch (error) {
        console.warn('AuthContext: Failed to load auth state:', error);
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      } finally {
        setIsLoading(false);
      }
    };
    loadAuthState();
  }, []);

  // Save auth state to storage whenever it changes (only if rememberMe is true)
  // Note: Direct saves in signIn/signInWithGoogle/verifyMfa handle the initial save/clear
  // This useEffect only handles updates to existing auth state (e.g., user profile updates)
  useEffect(() => {
    const saveAuthState = async () => {
      if (!isLoading) {
        try {
          if (authState.isAuthenticated && rememberMe) {
            // Only save if rememberMe is true (updates to existing saved state)
            await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
            await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
          } else if (!authState.isAuthenticated) {
            // Only clear when explicitly logged out
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
            await AsyncStorage.removeItem(REMEMBER_ME_KEY);
          }
          // If rememberMe is false but authenticated, don't do anything here
          // (the signIn function already handled clearing the storage)
        } catch (error) {
          console.warn('Failed to save auth state:', error);
        }
      }
    };
    saveAuthState();
  }, [authState, isLoading, rememberMe]);

  // Helper function to map UserDTO to AuthUser
  const mapUserDTOToAuthUser = (userDTO: any): AuthUser | null => {
    if (!userDTO || !userDTO.userID) {
      return null;
    }
    
    return {
      userID: userDTO.userID,
      userName: userDTO.userName || '',
      firstName: userDTO.firstName,
      lastName: userDTO.lastName,
      name: userDTO.name || userDTO.userName || '',
      email: userDTO.email || '',
      role: (userDTO.role as any) || 'User',
      status: (userDTO.status as any) || 'Active',
      avatar: userDTO.avatar || userDTO.profilePicture,
      profilePicture: userDTO.profilePicture || userDTO.avatar,
      phone: userDTO.phoneNumber,
      phoneNumber: userDTO.phoneNumber,
      dateOfBirth: userDTO.dateOfBirth,
      gender: userDTO.gender,
      address: userDTO.address,
      city: userDTO.city,
      country: userDTO.country,
      postalCode: userDTO.postalCode,
      language: userDTO.language,
      timezone: userDTO.timezone || userDTO.timeZone,
      timeZone: userDTO.timezone || userDTO.timeZone,
      preferences: userDTO.preferences,
      isEmailVerified: userDTO.isEmailVerified || false,
      isPhoneVerified: userDTO.isPhoneVerified,
      twoFactorEnabled: userDTO.twoFactorEnabled,
      subscription: userDTO.subscription ? {
        plan: (userDTO.subscription.plan as any) || 'starter',
        status: (userDTO.subscription.status as any) || 'inactive',
        startDate: userDTO.subscription.startDate,
        endDate: userDTO.subscription.endDate,
        autoRenew: userDTO.subscription.autoRenew,
      } : undefined,
      createdAt: userDTO.createdAt || new Date().toISOString(),
      updatedAt: userDTO.updatedAt,
      lastLogin: userDTO.lastLoginAt,
      lastActiveAt: userDTO.lastLoginAt,
    };
  };

  const signIn = async (userName: string, password: string, rememberMeParam: boolean = false) => {
    try {
      console.log('AuthContext: Starting login for:', userName);
      const response = await movieAppApi.login(userName, password);
      
      console.log('AuthContext: Login response:', JSON.stringify(response, null, 2));
      
      if (response.errorCode === 200 && response.data) {
        const loginData = response.data;
        console.log('AuthContext: Login data:', JSON.stringify(loginData, null, 2));
        
        // Handle different response formats from API
        // API thật trả về: { accessToken, refreshToken, accessTokenExpiresAt, refreshTokenExpiresAt }
        // API mock trả về: { token, refreshToken, user, sessionId, deviceId, ... }
        const token = (loginData as any).accessToken || (loginData as any).token;
        const refreshToken = loginData.refreshToken;
        
        if (!token) {
          console.error('AuthContext: No token in login response');
          return {
            success: false,
            error: 'Login response missing token'
          };
        }
        
        // Set token in API client immediately
        movieAppApi.setToken(token);
        filmzoneApi.setToken(token);
        console.log('AuthContext: Token set in API client');
        
        // Check for MFA requirement (only if user object exists in response)
        const userFromResponse = (loginData as any).user;
        const userTwoFactor = userFromResponse?.twoFactorEnabled;
        
        if (userTwoFactor) {
          // Start TOTP MFA flow via backend
          try {
            const startMfaRes = await filmzoneApi.startTotpMfa();
            const ok =
              (startMfaRes as any).success === true ||
              (startMfaRes.errorCode >= 200 && startMfaRes.errorCode < 300);

            if (!ok || !startMfaRes.data) {
              console.error('AuthContext: Failed to start TOTP MFA:', startMfaRes.errorMessage);
              return {
                success: false,
                error: startMfaRes.errorMessage || 'Failed to start MFA. Please try again.',
              };
            }

            const mfaTicket =
              typeof startMfaRes.data === 'string'
                ? startMfaRes.data
                : (startMfaRes.data as any).ticket ||
                  (startMfaRes.data as any).mfaTicket ||
                  (startMfaRes.data as any).sessionId ||
                  null;

            // Store pending login to be completed by verifyMfa
            // Also store rememberMe preference for when MFA is verified
            setPendingLogin({ ...loginData, mfaTicket, rememberMe: rememberMeParam });
            setRememberMe(rememberMeParam);
            setAuthState(prev => ({
              ...prev,
              requiresMfa: true,
              mfaTicket: mfaTicket,
            }));

            return {
              success: false,
              requiresMfa: true,
              mfaTicket,
            };
          } catch (err) {
            console.error('AuthContext: Exception while starting TOTP MFA:', err);
            return {
              success: false,
              error: 'Failed to start MFA. Please check your connection and try again.',
            };
          }
        }
        
        // Login successful - always get user info from API since real API doesn't return user in login response
        console.log('AuthContext: Login successful, fetching user data...');
        
        let userData: AuthUser | null = null;
        
        // Try to get user from API
        try {
          console.log('AuthContext: Fetching current user from API...');
          const userResponse = await movieAppApi.getCurrentUser();
          console.log('AuthContext: getCurrentUser response:', JSON.stringify(userResponse, null, 2));
          
          if (userResponse.errorCode === 200 && userResponse.data) {
            userData = mapUserDTOToAuthUser(userResponse.data);
            console.log('AuthContext: Mapped user from getCurrentUser:', userData);
          } else {
            console.warn('AuthContext: getCurrentUser returned error:', userResponse.errorMessage);
          }
        } catch (error) {
          console.warn('AuthContext: Failed to get current user from API:', error);
        }
        
        // Fallback: try to use user from login response if getCurrentUser failed
        if (!userData && userFromResponse) {
          console.log('AuthContext: Falling back to user from login response');
          userData = mapUserDTOToAuthUser(userFromResponse);
          console.log('AuthContext: Mapped user from login response:', userData);
        }

        if (!userData) {
          console.error('AuthContext: ERROR - No user data available after login!');
          console.error('AuthContext: Login data:', JSON.stringify(loginData, null, 2));
          return {
            success: false,
            error: 'Login successful but user data not available. Please try again.'
          };
        }

        // Set remember me preference
        setRememberMe(rememberMeParam);
        
        const newAuthState = {
          isAuthenticated: true,
          user: userData,
          token: token,
          refreshToken: refreshToken,
          requiresMfa: false,
          mfaTicket: null,
        };
        
        console.log('AuthContext: Setting auth state:', {
          isAuthenticated: newAuthState.isAuthenticated,
          hasUser: !!newAuthState.user,
          userId: newAuthState.user?.userID,
          userName: newAuthState.user?.userName,
          rememberMe: rememberMeParam,
        });
        
        setAuthState(newAuthState);
        
        // Save auth state directly based on rememberMe preference
        if (rememberMeParam) {
          await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
          await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
        } else {
          await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
          await AsyncStorage.removeItem(REMEMBER_ME_KEY);
        }
        
        return { success: true };
      } else {
        console.error('AuthContext: Login failed:', response.errorMessage);
        return { 
          success: false, 
          error: response.errorMessage || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('AuthContext: Login exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('AuthContext: Starting Google login');
      console.log('AuthContext: filmzoneApi object:', filmzoneApi);
      console.log('AuthContext: loginWithGoogle method exists:', typeof filmzoneApi.loginWithGoogle);
      const response = await filmzoneApi.loginWithGoogle();
      
      console.log('AuthContext: Google login response:', JSON.stringify(response, null, 2));
      
      if (response.errorCode === 200 && response.data) {
        const loginData = response.data;
        console.log('AuthContext: Google login data:', JSON.stringify(loginData, null, 2));
        
        // Handle different response formats from API
        const token = (loginData as any).accessToken || (loginData as any).token;
        const refreshToken = loginData.refreshToken;
        
        if (!token) {
          console.error('AuthContext: No token in Google login response');
          return {
            success: false,
            error: 'Google login response missing token'
          };
        }
        
        // Set token in API client immediately
        movieAppApi.setToken(token);
        filmzoneApi.setToken(token);
        console.log('AuthContext: Token set in API client');
        
        // Check for MFA requirement (only if user object exists in response)
        const userFromResponse = (loginData as any).user;
        const userTwoFactor = userFromResponse?.twoFactorEnabled;
        
        if (userTwoFactor) {
          // Start TOTP MFA flow via backend
          try {
            const startMfaRes = await filmzoneApi.startTotpMfa();
            const ok =
              (startMfaRes as any).success === true ||
              (startMfaRes.errorCode >= 200 && startMfaRes.errorCode < 300);

            if (!ok || !startMfaRes.data) {
              console.error('AuthContext: Failed to start TOTP MFA:', startMfaRes.errorMessage);
              return {
                success: false,
                error: startMfaRes.errorMessage || 'Failed to start MFA. Please try again.',
              };
            }

            const mfaTicket =
              typeof startMfaRes.data === 'string'
                ? startMfaRes.data
                : (startMfaRes.data as any).ticket ||
                  (startMfaRes.data as any).mfaTicket ||
                  (startMfaRes.data as any).sessionId ||
                  null;

            // Store pending login to be completed by verifyMfa
            // For Google sign-in, default rememberMe to false (can be changed later if needed)
            setPendingLogin({ ...loginData, mfaTicket, rememberMe: false });
            setRememberMe(false);
            setAuthState(prev => ({
              ...prev,
              requiresMfa: true,
              mfaTicket: mfaTicket,
            }));

            return {
              success: false,
              requiresMfa: true,
              mfaTicket,
            };
          } catch (err) {
            console.error('AuthContext: Exception while starting TOTP MFA:', err);
            return {
              success: false,
              error: 'Failed to start MFA. Please check your connection and try again.',
            };
          }
        }
        
        // Login successful - always get user info from API since real API doesn't return user in login response
        console.log('AuthContext: Google login successful, fetching user data...');
        
        let userData: AuthUser | null = null;
        
        // Try to get user from API
        try {
          console.log('AuthContext: Fetching current user from API...');
          const userResponse = await movieAppApi.getCurrentUser();
          console.log('AuthContext: getCurrentUser response:', JSON.stringify(userResponse, null, 2));
          
          if (userResponse.errorCode === 200 && userResponse.data) {
            userData = mapUserDTOToAuthUser(userResponse.data);
            console.log('AuthContext: Mapped user from getCurrentUser:', userData);
          } else {
            console.warn('AuthContext: getCurrentUser returned error:', userResponse.errorMessage);
          }
        } catch (error) {
          console.warn('AuthContext: Failed to get current user from API:', error);
        }
        
        // Fallback: try to use user from login response if getCurrentUser failed
        if (!userData && userFromResponse) {
          console.log('AuthContext: Falling back to user from Google login response');
          userData = mapUserDTOToAuthUser(userFromResponse);
          console.log('AuthContext: Mapped user from Google login response:', userData);
        }

        if (!userData) {
          console.error('AuthContext: ERROR - No user data available after Google login!');
          console.error('AuthContext: Login data:', JSON.stringify(loginData, null, 2));
          return {
            success: false,
            error: 'Google login successful but user data not available. Please try again.'
          };
        }

        // Google sign-in defaults to rememberMe = false
        const googleRememberMe = false;
        setRememberMe(googleRememberMe);
        
        const newAuthState = {
          isAuthenticated: true,
          user: userData,
          token: token,
          refreshToken: refreshToken,
          requiresMfa: false,
          mfaTicket: null,
        };
        
        console.log('AuthContext: Setting auth state:', {
          isAuthenticated: newAuthState.isAuthenticated,
          hasUser: !!newAuthState.user,
          userId: newAuthState.user?.userID,
          userName: newAuthState.user?.userName,
        });
        
        setAuthState(newAuthState);
        
        // Google sign-in doesn't save credentials (rememberMe = false)
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
        
        return { success: true };
      } else {
        console.error('AuthContext: Google login failed:', response.errorMessage);
        return { 
          success: false, 
          error: response.errorMessage || 'Google login failed' 
        };
      }
    } catch (error) {
      console.error('AuthContext: Google login exception:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Google login failed' 
      };
    }
  };

  const verifyMfa = async (mfaTicket: string, code: string) => {
    try {
      if (!pendingLogin) {
        return { success: false, error: 'No pending MFA login found' };
      }

      // Verify TOTP code with backend
      const verifyRes = await filmzoneApi.verifyTotpMfa({
        ticket: mfaTicket,
        code: code.trim(),
      });

      const ok =
        (verifyRes as any).success === true ||
        (verifyRes.errorCode >= 200 && verifyRes.errorCode < 300);

      if (!ok) {
        return {
          success: false,
          error: verifyRes.errorMessage || 'Invalid verification code',
        };
      }

      const loginData = pendingLogin;

      // Ensure token is set on API clients
      if (loginData.token) {
        movieAppApi.setToken(loginData.token);
        filmzoneApi.setToken(loginData.token);
      }

      // Map user data
      let userData: AuthUser | null = null;
      if (loginData.user) {
        userData = mapUserDTOToAuthUser(loginData.user);
      }

      // Try to get full user info from API
      if (!userData) {
        try {
          const userResponse = await movieAppApi.getCurrentUser();
          if (userResponse.errorCode === 200 && userResponse.data) {
            userData = mapUserDTOToAuthUser(userResponse.data);
          }
        } catch (error) {
          console.warn('Failed to get current user:', error);
        }
      }

      if (!userData) {
        return { success: false, error: 'Unable to retrieve user data' };
      }

      // Restore rememberMe preference from pending login
      const rememberMeFromPending = (pendingLogin as any)?.rememberMe ?? false;
      setRememberMe(rememberMeFromPending);

      const newAuthState = {
        isAuthenticated: true,
        user: userData,
        token: loginData.token,
        refreshToken: loginData.refreshToken,
        requiresMfa: false,
        mfaTicket: null,
      };

      setAuthState(newAuthState);
      
      // Save auth state directly based on rememberMe preference from pending login
      if (rememberMeFromPending) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
        await AsyncStorage.setItem(REMEMBER_ME_KEY, 'true');
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      }
      
      setPendingLogin(null);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'MFA verification failed',
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
      // Clear token from API client
      movieAppApi.setToken(null);
      filmzoneApi.setToken(null);
      // Clear auth state and storage
      setAuthState(defaultAuthState);
      setRememberMe(false);
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(REMEMBER_ME_KEY);
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
    // Mock implementation: movieAppApi does not expose a refreshToken method
    console.warn('refreshAuthToken: refreshToken API not implemented in mock API');
    return false;
  };

  return (
    <AuthContext.Provider value={{
      authState,
      signIn,
      signInWithGoogle,
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
