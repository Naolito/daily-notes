import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeType = 'notebook' | 'paper' | 'dark' | 'pink';

interface Theme {
  // Theme type
  themeType: ThemeType;
  
  // Background colors
  backgroundColor: string;
  surfaceColor: string;
  headerBackground: string;
  
  // Text colors
  primaryText: string;
  secondaryText: string;
  
  // Border and line colors
  borderColor: string;
  lineColor: string;
  dividerColor: string;
  
  // Component specific
  searchBarBackground: string;
  searchBarText: string;
  tabBarBackground: string;
  tabBarBorder: string;
  
  // Mood selector background
  moodSelectorBackground: string;
  
  // Settings button
  settingsButtonBackground: string;
  
  // Notebook lines
  showNotebookLines: boolean;
  notebookLineColor: string;
  notebookLineOpacity: number;
  
  // Font settings
  useHandwrittenFont: boolean;
  
  // Style preferences
  useDottedBorders: boolean;
  cardStyle?: {
    backgroundColor: string;
    shadowColor: string;
    shadowOpacity: number;
    shadowRadius: number;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
  };
}

const themes: Record<ThemeType, Theme> = {
  notebook: {
    themeType: 'notebook',
    backgroundColor: '#f5f0eb',
    surfaceColor: '#f5f0eb',
    headerBackground: '#f5f0eb',
    primaryText: '#1a1a1a',
    secondaryText: '#4a4a4a',
    borderColor: '#333',
    lineColor: '#4169E1',
    dividerColor: '#e0e0e0',
    searchBarBackground: 'rgb(220, 214, 214)',
    searchBarText: '#333',
    tabBarBackground: '#f5f0eb',
    tabBarBorder: '#e8dfd6',
    moodSelectorBackground: '#f8f5f0',
    settingsButtonBackground: 'rgb(220, 214, 214)',
    showNotebookLines: true,
    notebookLineColor: '#4169E1',
    notebookLineOpacity: 0.15,
    useHandwrittenFont: true,
    useDottedBorders: false,
    cardStyle: {
      backgroundColor: 'transparent',
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#d4c5b9',
    },
  },
  paper: {
    themeType: 'paper',
    backgroundColor: '#f8f9fa',
    surfaceColor: '#ffffff',
    headerBackground: '#ffffff',
    primaryText: '#212529',
    secondaryText: '#6c757d',
    borderColor: '#dee2e6',
    lineColor: '#000000',
    dividerColor: '#e9ecef',
    searchBarBackground: '#ffffff',
    searchBarText: '#212529',
    tabBarBackground: '#ffffff',
    tabBarBorder: '#e9ecef',
    moodSelectorBackground: '#f8f9fa',
    settingsButtonBackground: '#ffffff',
    showNotebookLines: false,
    notebookLineColor: '#000000',
    notebookLineOpacity: 0,
    useHandwrittenFont: false,
    useDottedBorders: false,
    cardStyle: {
      backgroundColor: '#ffffff',
      shadowColor: '#000000',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      borderRadius: 16,
      borderWidth: 0,
      borderColor: 'transparent',
    },
  },
  dark: {
    themeType: 'dark',
    backgroundColor: '#2b2c30',
    surfaceColor: '#36373c',
    headerBackground: '#36373c',
    primaryText: '#f5f6f7',
    secondaryText: '#b8bbc0',
    borderColor: '#4a4c52',
    lineColor: '#f5f6f7',
    dividerColor: '#4a4c52',
    searchBarBackground: '#36373c',
    searchBarText: '#f5f6f7',
    tabBarBackground: '#303135',
    tabBarBorder: '#4a4c52',
    moodSelectorBackground: '#26272a',
    settingsButtonBackground: '#3e3f44',
    showNotebookLines: false,
    notebookLineColor: '#f5f6f7',
    notebookLineOpacity: 0,
    useHandwrittenFont: false,
    useDottedBorders: false,
    cardStyle: {
      backgroundColor: '#36373c',
      shadowColor: '#000000',
      shadowOpacity: 0.25,
      shadowRadius: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#4a4c5220',
    },
  },
  pink: {
    themeType: 'pink',
    backgroundColor: '#fce4ec',
    surfaceColor: '#fce4ec',
    headerBackground: '#fce4ec',
    primaryText: '#4a1c40',
    secondaryText: '#6d4c5f',
    borderColor: '#c48b9f',
    lineColor: '#f8bbd0',
    dividerColor: '#f8bbd0',
    searchBarBackground: '#f8bbd0',
    searchBarText: '#4a1c40',
    tabBarBackground: '#fce4ec',
    tabBarBorder: '#f8bbd0',
    moodSelectorBackground: '#fff0f5',
    settingsButtonBackground: '#f8bbd0',
    showNotebookLines: true,
    notebookLineColor: '#f8bbd0',
    notebookLineOpacity: 0.25,
    useHandwrittenFont: true,
    useDottedBorders: false,
    cardStyle: {
      backgroundColor: 'transparent',
      shadowColor: 'transparent',
      shadowOpacity: 0,
      shadowRadius: 0,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#c48b9f',
    },
  },
};

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setTheme: (type: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = '@selected_theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeType, setThemeType] = useState<ThemeType>('notebook');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme && themes[savedTheme as ThemeType]) {
        setThemeType(savedTheme as ThemeType);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (type: ThemeType) => {
    try {
      await AsyncStorage.setItem(THEME_KEY, type);
      setThemeType(type);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[themeType], themeType, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}