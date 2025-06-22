import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { Mood } from '../types';
import { VerySadEmoji, SadEmoji, NeutralEmoji, HappyEmoji, VeryHappyEmoji } from './FlatEmojis';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');
  const emojiSize = screenWidth < 380 ? 50 : 60;
  
  // Hide selector if mood is already selected
  if (selectedMood) {
    return null;
  }
  
  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <Text style={styles.title}>How did you feel today?</Text>
      <View style={styles.moodContainer}>
        {moods.map((mood) => {
          const EmojiComponent = mood.component;
          return (
            <TouchableOpacity
              key={mood.value}
              style={styles.moodButton}
              onPress={() => onMoodSelect(mood.value as Mood)}
            >
              <EmojiComponent size={emojiSize} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
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
    fontSize: screenWidth < 380 ? 20 : 22,
    textAlign: 'center',
    marginBottom: 0,
    color: '#2c2c2c',
    fontFamily: Platform.select({
      ios: 'Noteworthy-Light',
      android: 'sans-serif',
      default: "'Permanent Marker', cursive"
    }),
    transform: [{ rotate: '-1.5deg' }],
    letterSpacing: -0.5,
    fontWeight: '300',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    width: '100%',
  },
  moodButton: {
    padding: 5,
  },
});