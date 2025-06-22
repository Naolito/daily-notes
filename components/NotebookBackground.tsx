import React from 'react';
import { View, StyleSheet } from 'react-native';
import { screenHeight, responsivePadding } from '../utils/responsive';

const LINE_HEIGHT = responsivePadding(26); // Tighter line spacing

interface NotebookBackgroundProps {
  height?: number;
  startFromTop?: boolean;
  lineColor?: string;
  opacity?: number;
}

export default function NotebookBackground({ 
  height = screenHeight, 
  startFromTop = false,
  lineColor = '#4169E1',
  opacity = 0.075
}: NotebookBackgroundProps) {
  const numberOfLines = Math.ceil(height / LINE_HEIGHT);
  
  return (
    <View style={[StyleSheet.absoluteFillObject, { height }]} pointerEvents="none">
      {/* Líneas horizontales */}
      {Array.from({ length: numberOfLines }).map((_, index) => {
        const translateY = (Math.random() - 0.5) * 1;
        const scaleX = 0.998 + Math.random() * 0.004;
        
        return (
          <View
            key={index}
            style={[
              styles.line,
              { 
                top: index * LINE_HEIGHT + (startFromTop ? 0 : responsivePadding(80)) + translateY,
                opacity: opacity,
                backgroundColor: lineColor,
                transform: [
                  { scaleX: scaleX },
                  { rotate: `${(Math.random() - 0.5) * 0.2}deg` }
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