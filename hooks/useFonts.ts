import { useFonts } from 'expo-font';

export const useCustomFonts = () => {
  const [fontsLoaded] = useFonts({
    'LettersForLearners': require('../assets/fonts/LettersForLearners.ttf'),
  });

  return fontsLoaded;
};