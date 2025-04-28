import React, { createContext, useContext, useState } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  colors: {
    primary: Record<string, string>;
    secondary: Record<string, string>;
    gray: Record<string, string>;
    purple: Record<string, string>;
    blue: Record<string, string>;
    green: Record<string, string>;
    black: string;
    white: string;
  };
}

// Define default colors
const defaultColors = {
  primary: {
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
  },
  secondary: {
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
  },
  gray: {
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
  },
  purple: {
    500: '#8b5cf6',
  },
  blue: {
    500: '#3b82f6',
  },
  green: {
    500: '#22c55e',
  },
  black: '#000000',
  white: '#ffffff',
};

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: true,
  colors: defaultColors,
});

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const value = {
    isDarkMode,
    colors: defaultColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};