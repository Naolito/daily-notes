import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import MoodSelector from './MoodSelector';
import PaperTexture from './PaperTexture';
import NotebookBackground from './NotebookBackground';
import SimpleDashedBorder from './SimpleDashedBorder';
import { Note, Mood } from '../types';
import { NoteService } from '../services/noteService';
import { StorageService } from '../services/storage';
import { generateJuneMockData } from '../utils/generateMockData';
import { responsiveFontSize, responsivePadding, heightPercentage } from '../utils/responsive';
import { VerySadEmoji, SadEmoji, NeutralEmoji, HappyEmoji, VeryHappyEmoji } from '../components/FlatEmojis';
import { Dimensions } from 'react-native';


const { width: screenWidth } = Dimensions.get('window');

const moodEmojis = {
  1: VerySadEmoji,
  2: SadEmoji,
  3: NeutralEmoji,
  4: HappyEmoji,
  5: VeryHappyEmoji,
};

const moodColors = {
  1: '#F44336',
  2: '#FF9800',
  3: '#FFC107',
  4: '#8BC34A',
  5: '#4CAF50',
};

export default function NoteEditor() {
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateBoxHeight, setDateBoxHeight] = useState(0);
  const textInputRef = React.useRef<TextInput>(null);
  
  // Animation values for mood appearance
  const moodFadeAnim = useRef(new Animated.Value(0)).current;
  const moodScaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    loadCurrentNote();
  }, []);
  
  useFocusEffect(
    React.useCallback(() => {
      loadCurrentNote();
    }, [])
  );

  const loadCurrentNote = async () => {
    try {
      const currentDateFromStorage = await StorageService.getCurrentDate();
      setCurrentDate(currentDateFromStorage);
      
      const currentNote = await NoteService.getCurrentNote();
      console.log('Current note:', currentNote); // Debug
      
      if (currentNote) {
        setNote(currentNote);
        setContent(currentNote.content || '');
        setSelectedMood(currentNote.mood);
        setImages(currentNote.images);
        // If mood exists, set animation values to show it
        if (currentNote.mood) {
          moodFadeAnim.setValue(1);
          moodScaleAnim.setValue(1);
        }
      } else {
        // No note exists for this date
        setNote(null);
        setContent('');
        setSelectedMood(undefined);
        setImages([]);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setContent('');
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async () => {
    try {
      const savedNote = await NoteService.saveCurrentNote(content, selectedMood, images);
      setNote(savedNote);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleContentChange = (text: string) => {
    setContent(text);
    saveNote();
  };

  const handleMoodSelect = async (mood: Mood | undefined) => {
    if (mood && !selectedMood) {
      // Animate mood appearance
      setSelectedMood(mood);
      Animated.parallel([
        Animated.timing(moodFadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(moodScaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!mood) {
      // Animate mood disappearance
      Animated.parallel([
        Animated.timing(moodFadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(moodScaleAnim, {
          toValue: 0.5,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setSelectedMood(mood);
      });
    }
    
    const currentNote = await NoteService.getCurrentNote();
    if (currentNote) {
      currentNote.mood = mood;
      currentNote.updatedAt = new Date();
      await StorageService.saveNote(currentNote);
    } else if (mood) {
      await NoteService.saveCurrentNote('', mood);
    }
  };

  const focusTextInput = () => {
    textInputRef.current?.focus();
  };


  const displayDate = format(currentDate, 'EEEE, MMMM d');

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={StyleSheet.absoluteFillObject}>
        <PaperTexture />
        <NotebookBackground startFromTop={true} />
      </View>
      <View style={styles.contentContainer}>
        <View 
          style={styles.dateWrapper}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            if (height !== dateBoxHeight) {
              setDateBoxHeight(height);
            }
          }}
        >
          {dateBoxHeight > 0 && (
            <SimpleDashedBorder 
              width={screenWidth - 32} 
              height={dateBoxHeight} 
              color={selectedMood ? moodColors[selectedMood] : '#333'} 
            />
          )}
          <View style={styles.dateBox}>
            <View style={styles.dateRow}>
              <Text style={styles.dateHeader}>{displayDate}</Text>
              {selectedMood && (
                <Animated.View 
                  style={[
                    styles.moodInHeader,
                    {
                      opacity: moodFadeAnim,
                      transform: [{ scale: moodScaleAnim }],
                    }
                  ]}
                >
                  <TouchableOpacity onPress={() => handleMoodSelect(undefined)}>
                    {React.createElement(moodEmojis[selectedMood], { size: 32 })}
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.touchableArea} 
          activeOpacity={1}
          onPress={focusTextInput}
        >
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            multiline
            value={content}
            onChangeText={handleContentChange}
            textAlignVertical="top"
            scrollEnabled
          />
        </TouchableOpacity>
      </View>
      
      <MoodSelector 
        selectedMood={selectedMood}
        onMoodSelect={handleMoodSelect}
      />
      
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf0e6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#faf0e6',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  dateWrapper: {
    position: 'relative',
    marginBottom: 20,
  },
  dateBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dateHeader: {
    fontSize: 32,
    fontWeight: '400',
    color: '#2c2c2c',
    fontFamily: Platform.select({
      ios: 'Noteworthy-Bold',
      android: 'sans-serif',
      default: "'Patrick Hand', cursive"
    }),
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  moodInHeader: {
    marginTop: 2,
  },
  touchableArea: {
    flex: 1,
  },
  textInput: {
    fontSize: 26, // Intermediate between 22 and 33
    lineHeight: 30, // Match line spacing
    color: '#1a1a1a',
    backgroundColor: 'transparent',
    fontFamily: 'LettersForLearners',
    textAlignVertical: 'top',
    letterSpacing: -0.3,
    padding: 0,
    flex: 1,
    borderWidth: 0,
    borderColor: 'transparent',
    outlineStyle: 'none',
  },
});