import { Stack } from 'expo-router';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import WebFonts from '../components/WebFonts';
import { useCustomFonts } from '../hooks/useFonts';

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
    <>
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
    </>
  );
}