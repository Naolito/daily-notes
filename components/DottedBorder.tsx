import React from 'react';
import Svg, { Circle } from 'react-native-svg';
import { View } from 'react-native';

interface DottedBorderProps {
  width: number;
  height: number;
  color?: string;
}

export default function DottedBorder({ width, height, color = '#333' }: DottedBorderProps) {
  const dotRadius = 1.5;
  const spacing = 6;
  const radius = 8;
  
  const dots = [];
  
  // Calculate total perimeter
  const straightTop = width - 2 * radius;
  const straightBottom = width - 2 * radius;
  const straightLeft = height - 2 * radius;
  const straightRight = height - 2 * radius;
  const cornerLength = (Math.PI / 2) * radius; // Quarter circle
  const totalPerimeter = straightTop + straightBottom + straightLeft + straightRight + 4 * cornerLength;
  
  // Calculate total number of dots
  const totalDots = Math.floor(totalPerimeter / spacing);
  
  // Place dots evenly around the perimeter
  for (let i = 0; i < totalDots; i++) {
    const distance = (i * totalPerimeter) / totalDots;
    let x, y;
    
    // Top edge
    if (distance < straightTop) {
      x = radius + distance;
      y = dotRadius;
    }
    // Top-right corner
    else if (distance < straightTop + cornerLength) {
      const angle = ((distance - straightTop) / cornerLength) * (Math.PI / 2);
      x = width - radius + radius * Math.sin(angle);
      y = radius - radius * Math.cos(angle);
    }
    // Right edge
    else if (distance < straightTop + cornerLength + straightRight) {
      x = width - dotRadius;
      y = radius + (distance - straightTop - cornerLength);
    }
    // Bottom-right corner
    else if (distance < straightTop + 2 * cornerLength + straightRight) {
      const angle = ((distance - straightTop - cornerLength - straightRight) / cornerLength) * (Math.PI / 2);
      x = width - radius + radius * Math.cos(angle);
      y = height - radius + radius * Math.sin(angle);
    }
    // Bottom edge
    else if (distance < straightTop + 2 * cornerLength + straightRight + straightBottom) {
      x = width - radius - (distance - straightTop - 2 * cornerLength - straightRight);
      y = height - dotRadius;
    }
    // Bottom-left corner
    else if (distance < straightTop + 3 * cornerLength + straightRight + straightBottom) {
      const angle = ((distance - straightTop - 2 * cornerLength - straightRight - straightBottom) / cornerLength) * (Math.PI / 2);
      x = radius - radius * Math.sin(angle);
      y = height - radius + radius * Math.cos(angle);
    }
    // Left edge
    else if (distance < straightTop + 3 * cornerLength + straightRight + straightBottom + straightLeft) {
      x = dotRadius;
      y = height - radius - (distance - straightTop - 3 * cornerLength - straightRight - straightBottom);
    }
    // Top-left corner
    else {
      const angle = ((distance - straightTop - 3 * cornerLength - straightRight - straightBottom - straightLeft) / cornerLength) * (Math.PI / 2);
      x = radius - radius * Math.cos(angle);
      y = radius - radius * Math.sin(angle);
    }
    
    dots.push(
      <Circle
        key={`dot-${i}`}
        cx={x}
        cy={y}
        r={dotRadius}
        fill={color}
      />
    );
  }
  
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={width} height={height}>
        {dots}
      </Svg>
    </View>
  );
}