import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { View } from 'react-native';

interface SimpleDashedBorderProps {
  width: number;
  height: number;
  color?: string;
}

export default function SimpleDashedBorder({ width, height, color = '#333' }: SimpleDashedBorderProps) {
  const strokeWidth = 2;
  const radius = 8;
  const dashLength = 6;
  const dashGap = 4;
  
  // Create a rounded rectangle path
  const path = `
    M ${radius} ${strokeWidth/2}
    L ${width - radius} ${strokeWidth/2}
    Q ${width - strokeWidth/2} ${strokeWidth/2} ${width - strokeWidth/2} ${radius}
    L ${width - strokeWidth/2} ${height - radius}
    Q ${width - strokeWidth/2} ${height - strokeWidth/2} ${width - radius} ${height - strokeWidth/2}
    L ${radius} ${height - strokeWidth/2}
    Q ${strokeWidth/2} ${height - strokeWidth/2} ${strokeWidth/2} ${height - radius}
    L ${strokeWidth/2} ${radius}
    Q ${strokeWidth/2} ${strokeWidth/2} ${radius} ${strokeWidth/2}
  `;
  
  return (
    <View style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
      <Svg width={width} height={height}>
        <Path
          d={path}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={[dashLength, dashGap]}
          fill="none"
        />
      </Svg>
    </View>
  );
}