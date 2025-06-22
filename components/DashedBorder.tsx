import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { widthScale } from '../utils/responsive';

interface DashedBorderProps {
  width: number;
  height: number;
  color?: string;
  strokeWidth?: number;
  dashLength?: number;
  dashGap?: number;
}

export default function DashedBorder({ 
  width, 
  height, 
  color = '#333', 
  strokeWidth = 2,
  dashLength = 8,
  dashGap = 4
}: DashedBorderProps) {
  // Scale stroke and dash properties
  const scaledStrokeWidth = strokeWidth * widthScale;
  const scaledDashLength = dashLength * widthScale;
  const scaledDashGap = dashGap * widthScale;
  const scaledRadius = 8 * widthScale;
  
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width={width} height={height}>
        <Rect
          x={scaledStrokeWidth / 2}
          y={scaledStrokeWidth / 2}
          width={width - scaledStrokeWidth}
          height={height - scaledStrokeWidth}
          fill="none"
          stroke={color}
          strokeWidth={scaledStrokeWidth}
          strokeDasharray={`${scaledDashLength} ${scaledDashGap}`}
          rx={scaledRadius}
          ry={scaledRadius}
        />
      </Svg>
    </View>
  );
}