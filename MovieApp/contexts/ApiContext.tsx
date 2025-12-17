import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import filmzoneApi from '../services/filmzone-api';

// Types for API context
interface ApiState {
  loading: boolean;
  error: string | null;
  isOnline: boolean;
}

interface ApiContextType {
  state: ApiState;
  actions: {
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setOnlineStatus: (isOnline: boolean) => void;
    clearError: () => void;
  };
  api: typeof filmzoneApi;
}

// Actions
type ApiAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_ONLINE_STATUS'; payload: boolean }
  | { type: 'CLEAR_ERROR' };

// Initial state
const initialState: ApiState = {
  loading: false,
  error: null,
  isOnline: true,
};

// Reducer
function apiReducer(state: ApiState, action: ApiAction): ApiState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_ONLINE_STATUS':
      return { ...state, isOnline: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// Create context
const ApiContext = createContext<ApiContextType | undefined>(undefined);

// Provider component
interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  const [state, dispatch] = useReducer(apiReducer, initialState);

  const actions = {
    setLoading: (loading: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error: string | null) => 
      dispatch({ type: 'SET_ERROR', payload: error }),
    setOnlineStatus: (isOnline: boolean) => 
      dispatch({ type: 'SET_ONLINE_STATUS', payload: isOnline }),
    clearError: () => 
      dispatch({ type: 'CLEAR_ERROR' }),
  };

  const value: ApiContextType = {
    state,
    actions,
    api: filmzoneApi,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
}

// Hook to use API context
export function useApi() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
}

// Hook for API calls with automatic error handling
export function useApiCall() {
  const { actions, api } = useApi();

  const callApi = async <T,>(
    apiFunction: () => Promise<T>,
    options?: {
      showLoading?: boolean;
      showError?: boolean;
    }
  ): Promise<T | null> => {
    const { showLoading = true, showError = true } = options || {};

    try {
      if (showLoading) {
        actions.setLoading(true);
      }
      actions.clearError();

      const result = await apiFunction();
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      if (showError) {
        actions.setError(errorMessage);
      }
      
      console.error('API call failed:', error);
      return null;
    } finally {
      if (showLoading) {
        actions.setLoading(false);
      }
    }
  };

  return { callApi, api };
}

