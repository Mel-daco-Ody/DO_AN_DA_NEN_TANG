import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  background: string;
  surface: string;
  primary: string;
  secondary: string;
  text: string;
  textSecondary: string;
  border: string;
  card: string;
  header: string;
  tabBar: string;
  success: string;
  warning: string;
  error: string;
}

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

const lightTheme: Theme = {
  isDark: false,
  colors: {
    background: '#f8f9fa',
    surface: '#ffffff',
    primary: '#e50914',
    secondary: '#6c757d',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    card: '#ffffff',
    header: '#ffffff',
    tabBar: '#ffffff',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
  },
};

const darkTheme: Theme = {
  isDark: true,
  colors: {
    background: '#0d1117',
    surface: '#161b22',
    primary: '#e50914',
    secondary: '#8b949e',
    text: '#f0f6fc',
    textSecondary: '#8b949e',
    border: '#30363d',
    card: '#161b22',
    header: '#161b22',
    tabBar: '#161b22',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode (current app state)

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.log('Error loading theme preference:', error);
    }
  };

  const saveThemePreference = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem('theme_preference', isDark ? 'dark' : 'light');
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    saveThemePreference(newTheme);
  };

  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
