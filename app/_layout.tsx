import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import WebFonts from '../components/WebFonts';
import { useCustomFonts } from '../hooks/useFonts';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AuthProvider } from '../contexts/AuthContext';
import { Platform } from 'react-native';
import ErrorBoundary from '../components/ErrorBoundary';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const fontsLoaded = useCustomFonts();


  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <WebFonts />
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
      </AuthProvider>
    </ErrorBoundary>
  );
}