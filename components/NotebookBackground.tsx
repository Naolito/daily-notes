import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const LINE_HEIGHT = 26; // Fixed line height, not responsive

interface NotebookBackgroundProps {
  height?: number;
  startFromTop?: boolean;
  lineColor?: string;
  opacity?: number;
  textOffset?: number;
}

export default function NotebookBackground({ 
  height, 
  startFromTop = false,
  lineColor = '#4169E1',
  opacity = 0.075,
  textOffset = 0
}: NotebookBackgroundProps) {
  const screenHeight = Dimensions.get('window').height;
  const actualHeight = height || screenHeight * 1.5; // Extra height for very tall devices
  const numberOfLines = Math.ceil(actualHeight / LINE_HEIGHT);
  
  return (
    <View style={[StyleSheet.absoluteFillObject, { height: actualHeight }]} pointerEvents="none">
      {/* Líneas horizontales */}
      {Array.from({ length: numberOfLines }).map((_, index) => {
        const translateY = (Math.random() - 0.5) * 0.5; // Reduced randomness
        const scaleX = 0.998 + Math.random() * 0.004;
        
        // Calculate the base position for the line
        // For text alignment, first line should be at the baseline of first line of text
        const firstLineOffset = startFromTop ? 
          textOffset + 26 - 4 : // Text baseline position
          80;
        const linePosition = firstLineOffset + (index * LINE_HEIGHT);
        
        return (
          <View
            key={index}
            style={[
              styles.line,
              { 
                top: linePosition + translateY,
                opacity: opacity,
                backgroundColor: lineColor,
                transform: [
                  { scaleX: scaleX },
                  { rotate: `${(Math.random() - 0.5) * 0.15}deg` }
                ]
              }
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
  },
});