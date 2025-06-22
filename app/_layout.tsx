import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import WebFonts from '../components/WebFonts';
import { useCustomFonts } from '../hooks/useFonts';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';
import { NotificationService } from '../services/notificationService';

export default function RootLayout() {
  const fontsLoaded = useCustomFonts();

  useEffect(() => {
    if (fontsLoaded) {
      // Initialize notifications
      NotificationService.initialize();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <WebFonts />
      <ThemedStatusBar />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="search" 
          options={{ 
            title: 'Search Notes',
            presentation: 'modal'
          }} 
        />
      </Stack>
    </ThemeProvider>
  );
}

function ThemedStatusBar() {
  const { theme } = useTheme();
  return (
    <StatusBar 
      style={theme.themeType === 'dark' ? 'light' : 'dark'}
      backgroundColor={theme.backgroundColor}
    />
  );
}