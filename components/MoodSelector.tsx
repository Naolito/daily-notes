import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Mood } from '../types';

interface MoodSelectorProps {
  selectedMood?: Mood;
  onMoodSelect: (mood: Mood) => void;
}

const moods = [
  { value: 1, emoji: '😢', color: '#FF6B6B' },
  { value: 2, emoji: '😕', color: '#FFA06B' },
  { value: 3, emoji: '😐', color: '#FFD93D' },
  { value: 4, emoji: '🙂', color: '#6BCF7F' },
  { value: 5, emoji: '😊', color: '#4ECDC4' },
] as const;

export default function MoodSelector({ selectedMood, onMoodSelect }: MoodSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>How did you feel today?</Text>
      <View style={styles.moodContainer}>
        {moods.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.moodButton,
              selectedMood === mood.value && { backgroundColor: mood.color + '30' }
            ]}
            onPress={() => onMoodSelect(mood.value as Mood)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
    color: '#333',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodButton: {
    padding: 12,
    borderRadius: 50,
  },
  moodEmoji: {
    fontSize: 32,
  },
});