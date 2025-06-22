import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { Mood } from '../types';
import { VerySadEmoji, SadEmoji, NeutralEmoji, HappyEmoji, VeryHappyEmoji } from './FlatEmojis';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { responsiveFontSize } from '../utils/responsive';

interface MoodSelectorProps {
  selectedMood?: Mood;
  onMoodSelect: (mood: Mood) => void;
}

const moods = [
  { value: 1, component: VerySadEmoji },
  { value: 2, component: SadEmoji },
  { value: 3, component: NeutralEmoji },
  { value: 4, component: HappyEmoji },
  { value: 5, component: VeryHappyEmoji },
] as const;

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const emojiSize = screenWidth < 380 ? 50 : 60;
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [animatingMood, setAnimatingMood] = useState<Mood | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Reset animations when selectedMood changes to undefined
  React.useEffect(() => {
    if (!selectedMood) {
      fadeAnim.setValue(1);
      scaleAnim.setValue(1);
      setAnimatingMood(null);
      setIsAnimating(false);
    }
  }, [selectedMood]);
  
  // Hide selector if mood is already selected and not animating
  if (selectedMood && !isAnimating) {
    return null;
  }
  
  const handleMoodPress = (mood: Mood) => {
    setAnimatingMood(mood);
    setIsAnimating(true);
    
    // Start animations
    Animated.parallel([
      // Fade out all elements
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      // Scale up selected mood while fading
      Animated.timing(scaleAnim, {
        toValue: 1.5,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimating(false);
      onMoodSelect(mood as Mood);
    });
  };
  
  // Show centered when no mood selected
  if (!selectedMood && !isAnimating) {
    return (
      <>
        {Platform.OS === 'web' ? (
          <View style={[styles.blurOverlay, { backgroundColor: 'rgba(0,0,0,0.3)' }]} />
        ) : (
          <BlurView 
            intensity={20} 
            style={styles.blurOverlay} 
            tint={theme.themeType === 'dark' ? 'dark' : 'light'} 
          />
        )}
        <View style={styles.centeredContainer}>
          <Text style={[
            styles.title, 
            { 
              color: theme.primaryText,
              fontFamily: theme.useHandwrittenFont ? Platform.select({
                ios: 'Noteworthy-Light',
                android: 'sans-serif',
                default: "'Permanent Marker', cursive"
              }) : undefined,
              transform: [],
              fontWeight: theme.useHandwrittenFont ? '300' : '400',
            }
          ]}>
            How are you feeling today?
          </Text>
          <View style={styles.moodContainer}>
            {moods.map((mood) => {
              const EmojiComponent = mood.component;
              return (
                <TouchableOpacity
                  key={mood.value}
                  style={styles.moodButton}
                  onPress={() => handleMoodPress(mood.value as Mood)}
                >
                  <EmojiComponent size={emojiSize} />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </>
    );
  }
  
  // Original bottom position when mood is selected
  if (selectedMood || isAnimating) {
    return (
      <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <Animated.Text style={[
          styles.title, 
          { 
            opacity: fadeAnim, 
            color: theme.primaryText,
            fontFamily: theme.useHandwrittenFont ? Platform.select({
              ios: 'Noteworthy-Light',
              android: 'sans-serif',
              default: "'Permanent Marker', cursive"
            }) : undefined,
            transform: theme.useHandwrittenFont ? [{ rotate: '-1.5deg' }] : [],
            fontWeight: theme.useHandwrittenFont ? '300' : '400',
          }
        ]}>
          How did you feel today?
        </Animated.Text>
        <View style={styles.moodContainer}>
          {moods.map((mood, index) => {
            const EmojiComponent = mood.component;
            const isSelected = animatingMood === mood.value;
            
            return (
              <Animated.View
                key={mood.value}
                style={[
                  styles.moodButtonWrapper,
                  {
                    opacity: fadeAnim,
                    transform: isSelected ? [{ scale: scaleAnim }] : [],
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.moodButton}
                  onPress={() => handleMoodPress(mood.value as Mood)}
                  disabled={isAnimating}
                >
                  <EmojiComponent size={emojiSize} />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </View>
    );
  }
  
  return null;
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: responsiveFontSize(screenWidth < 380 ? 20 : 22),
    textAlign: 'center',
    marginBottom: 0,
    letterSpacing: -0.5,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
  },
  moodButtonWrapper: {
    position: 'relative',
  },
  moodButton: {
    padding: 5,
  },
  // Centered styles
  blurOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
  },
  centeredContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 999,
  },
});