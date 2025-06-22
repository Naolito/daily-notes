import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { responsivePadding } from '../utils/responsive';

const LINE_HEIGHT = responsivePadding(26);

interface NotebookLinesProps {
  lineColor?: string;
  opacity?: number;
  startY?: number;
}

export default function NotebookLines({ 
  lineColor = '#4169E1',
  opacity = 0.075,
  startY = 0
}: NotebookLinesProps) {
  const { height: screenHeight } = Dimensions.get('window');
  
  const lines = useMemo(() => {
    const numberOfLines = Math.ceil((screenHeight * 2) / LINE_HEIGHT);
    return Array.from({ length: numberOfLines }).map((_, index) => {
      // Small random variations for hand-drawn effect
      const translateY = (Math.random() - 0.5) * 0.3;
      const scaleX = 0.998 + Math.random() * 0.004;
      const rotate = (Math.random() - 0.5) * 0.1;
      
      // Position lines to align with text baseline
      // The line should appear under the text, not through it
      const position = startY + (index * LINE_HEIGHT) + LINE_HEIGHT;
      
      return {
        key: index,
        translateY,
        scaleX,
        rotate,
        position
      };
    });
  }, [screenHeight, startY]);
  
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {lines.map(({ key, translateY, scaleX, rotate, position }) => (
        <View
          key={key}
          style={[
            styles.line,
            { 
              top: position + translateY,
              opacity: opacity,
              backgroundColor: lineColor,
              transform: [
                { scaleX },
                { rotate: `${rotate}deg` }
              ]
            }
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  line: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
  },
});