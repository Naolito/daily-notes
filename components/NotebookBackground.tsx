import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';

const { height } = Dimensions.get('window');
const LINE_HEIGHT = 28;

export default function NotebookBackground() {
  const numberOfLines = Math.ceil(height / LINE_HEIGHT);
  
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Líneas horizontales */}
      {Array.from({ length: numberOfLines }).map((_, index) => {
        const opacity = 0.08 + Math.random() * 0.04;
        const translateY = (Math.random() - 0.5) * 1;
        const scaleX = 0.998 + Math.random() * 0.004;
        
        return (
          <View
            key={index}
            style={[
              styles.line,
              { 
                top: index * LINE_HEIGHT + 80 + translateY,
                opacity: opacity,
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
    backgroundColor: '#4169E1',
  },
});