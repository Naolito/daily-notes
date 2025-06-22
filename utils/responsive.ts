import { Dimensions, PixelRatio } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 11)
const baseWidth = 375;
const baseHeight = 812;

// Scale factors
export const widthScale = screenWidth / baseWidth;
export const heightScale = screenHeight / baseHeight;
export const scale = Math.min(widthScale, heightScale);

// Responsive functions
export const responsiveWidth = (width: number) => width * widthScale;
export const responsiveHeight = (height: number) => height * heightScale;
export const responsiveFontSize = (fontSize: number) => {
  const newSize = fontSize * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Responsive padding/margin
export const responsivePadding = (padding: number) => Math.round(padding * scale);

// Get percentage of screen dimensions
export const widthPercentage = (percentage: number) => (screenWidth * percentage) / 100;
export const heightPercentage = (percentage: number) => (screenHeight * percentage) / 100;

// Export screen dimensions
export { screenWidth, screenHeight };