import React from 'react';
import { Platform } from 'react-native';

export default function WebFonts() {
  if (Platform.OS !== 'web') return null;

  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        @import url('https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Comic+Neue:wght@300;400;700&family=Permanent+Marker&family=Caveat:wght@400;600;700&display=swap');
        
        @font-face {
          font-family: 'LettersForLearners';
          src: url('/assets/fonts/LettersForLearners.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
        
        * {
          -webkit-font-smoothing: antialiased;
        }
      `
    }} />
  );
}