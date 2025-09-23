import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

export interface SubscriptionState {
  currentPlan: SubscriptionPlan | null;
  isActive: boolean;
  expiryDate: string | null;
  autoRenew: boolean;
}

interface SubscriptionContextType {
  subscription: SubscriptionState;
  updateSubscription: (plan: SubscriptionPlan) => void;
  cancelSubscription: () => void;
  toggleAutoRenew: () => void;
  refreshSubscription: () => void;
}

const defaultSubscription: SubscriptionState = {
  currentPlan: {
    id: 'starter',
    name: 'Starter',
    price: 0,
    duration: 'monthly',
    features: ['7 days trial', '720p Resolution', 'Limited Availability', 'Desktop Only'],
    isPopular: false
  },
  isActive: true,
  expiryDate: '2024-12-31',
  autoRenew: true
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

interface SubscriptionProviderProps {
  children: ReactNode;
}

export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionState>(defaultSubscription);

  const updateSubscription = (plan: SubscriptionPlan) => {
    setSubscription(prev => ({
      ...prev,
      currentPlan: plan,
      isActive: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
      autoRenew: true
    }));
  };

  const cancelSubscription = () => {
    setSubscription(defaultSubscription);
  };

  const toggleAutoRenew = () => {
    setSubscription(prev => ({
      ...prev,
      autoRenew: !prev.autoRenew
    }));
  };

  const refreshSubscription = () => {
    // Force a re-render by updating the subscription state
    setSubscription(prev => ({ ...prev }));
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      updateSubscription,
      cancelSubscription,
      toggleAutoRenew,
      refreshSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
