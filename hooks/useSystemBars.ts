import { useEffect } from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useTheme } from '../contexts/ThemeContext';

export function useSystemBars() {
  const { theme } = useTheme();

  useEffect(() => {
    // Configure status bar
    if (Platform.OS === 'ios') {
      // iOS status bar style
      StatusBar.setStatusBarStyle(
        theme.themeType === 'dark' ? 'light' : 'dark',
        true
      );
    }

    // Configure navigation bar (Android only)
    if (Platform.OS === 'android') {
      // Set navigation bar color to match theme
      NavigationBar.setBackgroundColorAsync(theme.tabBarBackground);
      
      // Set button color based on theme
      if (theme.themeType === 'dark') {
        NavigationBar.setButtonStyleAsync('light');
      } else {
        NavigationBar.setButtonStyleAsync('dark');
      }

      // Status bar for Android
      StatusBar.setStatusBarStyle(
        theme.themeType === 'dark' ? 'light' : 'dark',
        true
      );
      StatusBar.setStatusBarBackgroundColor(theme.backgroundColor, true);
    }
  }, [theme]);

  return null;
}