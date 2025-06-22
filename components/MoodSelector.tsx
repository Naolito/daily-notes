import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Mood } from '../types';
import { VerySadEmoji, SadEmoji, NeutralEmoji, HappyEmoji, VeryHappyEmoji } from './FlatEmojis';
import { responsiveFontSize, responsivePadding, widthScale } from '../utils/responsive';

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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How did you feel today?</Text>
      <View style={styles.moodContainer}>
        {moods.map((mood) => {
          const EmojiComponent = mood.component;
          return (
            <TouchableOpacity
              key={mood.value}
              style={[
                styles.moodButton,
                selectedMood === mood.value && styles.selectedMood
              ]}
              onPress={() => onMoodSelect(mood.value as Mood)}
            >
              <EmojiComponent size={selectedMood === mood.value ? Math.round(70 * widthScale) : Math.round(60 * widthScale)} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: responsivePadding(20),
    paddingBottom: responsivePadding(30),
  },
  title: {
    fontSize: responsiveFontSize(22), // Reduced from 24 for better scaling
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
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: responsivePadding(10),
  },
  moodButton: {
    padding: responsivePadding(5),
    transform: [{ scale: 1 }],
  },
  selectedMood: {
    transform: [{ scale: 1.15 }],
  },
});