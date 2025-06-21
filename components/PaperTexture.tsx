import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function PaperTexture() {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Múltiples capas de textura muy sutiles */}
      <View style={[styles.texture, styles.texture1]} />
      <View style={[styles.texture, styles.texture2]} />
      <View style={[styles.texture, styles.texture3]} />
      <View style={[styles.texture, styles.texture4]} />
      <View style={[styles.texture, styles.texture5]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  texture: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  texture1: {
    top: '15%',
    left: '10%',
    width: '30%',
    height: '25%',
    borderRadius: 200,
    transform: [{ rotate: '25deg' }, { scaleX: 2 }],
    opacity: 0.15,
  },
  texture2: {
    top: '40%',
    right: '5%',
    width: '40%',
    height: '30%',
    borderRadius: 300,
    transform: [{ rotate: '-15deg' }, { scaleY: 1.5 }],
    opacity: 0.1,
  },
  texture3: {
    bottom: '20%',
    left: '20%',
    width: '35%',
    height: '20%',
    borderRadius: 250,
    transform: [{ rotate: '45deg' }],
    opacity: 0.12,
  },
  texture4: {
    top: '5%',
    right: '25%',
    width: '25%',
    height: '15%',
    borderRadius: 150,
    transform: [{ rotate: '-30deg' }, { scaleX: 1.8 }],
    opacity: 0.08,
  },
  texture5: {
    bottom: '35%',
    right: '15%',
    width: '45%',
    height: '35%',
    borderRadius: 400,
    transform: [{ rotate: '60deg' }, { scaleY: 0.6 }],
    opacity: 0.1,
  },
});