import React, { useState, useEffect } from 'react';
import CustomSplashScreen from './SplashScreen';

interface AppWrapperProps {
  children: React.ReactNode;
}

export default function AppWrapper({ children }: AppWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleSplashFinish = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  return <>{children}</>;
}
