import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import SimpleDashedBorder from './SimpleDashedBorder';
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function WelcomeInstructions() {
  const { theme } = useTheme();
  const [itemHeight, setItemHeight] = React.useState(0);
  const noteWidth = screenWidth - 32;
  
  return (
    <View 
      style={styles.noteWrapper}
      onLayout={(e) => {
        const { height } = e.nativeEvent.layout;
        if (height !== itemHeight) {
          setItemHeight(height);
        }
      }}
    >
      {itemHeight > 0 && theme.useDottedBorders && (
        <SimpleDashedBorder width={noteWidth} height={itemHeight} color="#2196F3" />
      )}
      <View style={[
        styles.instructionsContainer,
        theme.cardStyle && !theme.useDottedBorders && {
          ...theme.cardStyle,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4,
          marginBottom: 12,
          borderWidth: 2,
          borderColor: '#2196F3',
        }
      ]}>
        <Text style={[
          styles.instructionText,
          {
            color: theme.primaryText,
            fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
            fontSize: theme.useHandwrittenFont ? 26 : 16,
            lineHeight: theme.useHandwrittenFont ? 34 : 24,
            fontWeight: 'bold',
            marginBottom: 12
          }
        ]}>
          Welcome to Your Daily Journal!
        </Text>
        
        <Text style={[
          styles.instructionText,
          {
            color: theme.primaryText,
            fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
            fontSize: theme.useHandwrittenFont ? 24 : 15,
            lineHeight: theme.useHandwrittenFont ? 32 : 22
          }
        ]}>
          Record your thoughts, feelings, and memories every day.
        </Text>

        <Text style={[
          styles.instructionText,
          {
            color: theme.primaryText,
            fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
            fontSize: theme.useHandwrittenFont ? 24 : 15,
            lineHeight: theme.useHandwrittenFont ? 32 : 22,
            fontWeight: 'bold',
            marginTop: 12,
            marginBottom: 8
          }
        ]}>
          What to write about:
        </Text>

        <Text style={[
          styles.bulletPoint,
          {
            color: theme.primaryText,
            fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
            fontSize: theme.useHandwrittenFont ? 22 : 14,
            lineHeight: theme.useHandwrittenFont ? 28 : 20
          }
        ]}>
          • How you felt today
        </Text>
        <Text style={[
          styles.bulletPoint,
          {
            color: theme.primaryText,
            fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
            fontSize: theme.useHandwrittenFont ? 22 : 14,
            lineHeight: theme.useHandwrittenFont ? 28 : 20
          }
        ]}>
          • Ideas for the future
        </Text>
        <Text style={[
          styles.bulletPoint,
          {
            color: theme.primaryText,
            fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
            fontSize: theme.useHandwrittenFont ? 22 : 14,
            lineHeight: theme.useHandwrittenFont ? 28 : 20
          }
        ]}>
          • Lessons learned
        </Text>

        <Text style={[
          styles.instructionText,
          {
            color: theme.primaryText,
            fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
            fontSize: theme.useHandwrittenFont ? 24 : 15,
            lineHeight: theme.useHandwrittenFont ? 32 : 22,
            fontWeight: 'bold',
            marginTop: 16,
            marginBottom: 8
          }
        ]}>
          Using the search:
        </Text>

        <Text style={[
          styles.instructionText,
          {
            color: theme.primaryText,
            fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
            fontSize: theme.useHandwrittenFont ? 22 : 14,
            lineHeight: theme.useHandwrittenFont ? 28 : 20
          }
        ]}>
          Search for any word in your notes using the search bar below. For example: "happy", "birthday", "test", etc.
        </Text>

        <Text style={[
          styles.tipText,
          {
            color: theme.secondaryText,
            fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
            fontSize: theme.useHandwrittenFont ? 20 : 13,
            lineHeight: theme.useHandwrittenFont ? 26 : 18,
            marginTop: 16
          }
        ]}>
          Tip: Writing a little each day will help you remember special moments and see how you've grown over time.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  noteWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  instructionsContainer: {
    padding: 20,
  },
  instructionText: {
    marginBottom: 8,
  },
  bulletPoint: {
    marginLeft: 16,
    marginBottom: 4,
  },
  tipText: {
    fontStyle: 'italic',
    textAlign: 'center',
  },
});