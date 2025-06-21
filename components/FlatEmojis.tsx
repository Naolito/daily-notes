import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface EmojiProps {
  size?: number;
  color?: string;
}

export const VeryHappyEmoji = ({ size = 60, color = '#4CAF50' }: EmojiProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8.5" cy="9.5" r="1.5" fill={color} />
    <Circle cx="15.5" cy="9.5" r="1.5" fill={color} />
    <Path 
      d="M8.5 13C8.5 13 9.5 16 12 16C14.5 16 15.5 13 15.5 13" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <Circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

export const HappyEmoji = ({ size = 60, color = '#8BC34A' }: EmojiProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8.5" cy="9.5" r="1.5" fill={color} />
    <Circle cx="15.5" cy="9.5" r="1.5" fill={color} />
    <Path 
      d="M8.88875 13.5414C8.90255 13.5663 9.09071 13.892 9.49991 14.2194C9.96038 14.5877 10.7431 15.0002 12.0002 15.0002C13.2573 15.0002 14.0401 14.5877 14.5005 14.2194C14.9097 13.892 15.0979 13.5663 15.1117 13.5414" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <Circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

export const NeutralEmoji = ({ size = 60, color = '#FFC107' }: EmojiProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8.5" cy="9.5" r="1.5" fill={color} />
    <Circle cx="15.5" cy="9.5" r="1.5" fill={color} />
    <Path 
      d="M8 14.5H16" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <Circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

export const SadEmoji = ({ size = 60, color = '#FF9800' }: EmojiProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8.5" cy="9.5" r="1.5" fill={color} />
    <Circle cx="15.5" cy="9.5" r="1.5" fill={color} />
    <Path 
      d="M8.88875 16.5C8.90255 16.4751 9.09071 16.108 9.49991 15.7806C9.96038 15.4123 10.7431 15 12.0002 15C13.2573 15 14.0401 15.4123 14.5005 15.7806C14.9097 16.108 15.0979 16.4751 15.1117 16.5" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <Circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);

export const VerySadEmoji = ({ size = 60, color = '#F44336' }: EmojiProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="8.5" cy="9.5" r="1.5" fill={color} />
    <Circle cx="15.5" cy="9.5" r="1.5" fill={color} />
    <Path 
      d="M8.5 17C8.5 17 9.5 14.5 12 14.5C14.5 14.5 15.5 17 15.5 17" 
      stroke={color} 
      strokeWidth="2" 
      strokeLinecap="round"
    />
    <Path 
      d="M9.5 6L7 7M16.5 6L14 7" 
      stroke={color} 
      strokeWidth="1.5" 
      strokeLinecap="round"
    />
    <Circle 
      cx="12" 
      cy="12" 
      r="10" 
      stroke={color} 
      strokeWidth="2"
      fill="none"
    />
  </Svg>
);