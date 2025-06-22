import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
} from 'react-native';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import MoodSelector from './MoodSelector';
import PaperTexture from './PaperTexture';
import { Note, Mood } from '../types';
import { NoteService } from '../services/noteService';
import { StorageService } from '../services/storage';
import { generateJuneMockData } from '../utils/generateMockData';
import { responsiveFontSize, responsivePadding, heightPercentage } from '../utils/responsive';
import { VerySadEmoji, SadEmoji, NeutralEmoji, HappyEmoji, VeryHappyEmoji } from '../components/FlatEmojis';


export default function NoteEditor() {
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const textInputRef = React.useRef<TextInput>(null);

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

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    const currentNote = await NoteService.getCurrentNote();
    if (currentNote) {
      currentNote.mood = mood;
      currentNote.updatedAt = new Date();
      await StorageService.saveNote(currentNote);
    } else {
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
      <PaperTexture />
      <View style={styles.contentContainer}>
        <Text style={styles.dateHeader}>{displayDate}</Text>
        
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
    backgroundColor: '#fff7cc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff7cc',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    flex: 1,
  },
  dateHeader: {
    fontSize: 32,
    fontWeight: '400',
    marginBottom: 25,
    color: '#2c2c2c',
    fontFamily: Platform.select({
      ios: 'Noteworthy-Bold',
      android: 'sans-serif',
      default: "'Patrick Hand', cursive"
    }),
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  touchableArea: {
    flex: 1,
  },
  textInput: {
    fontSize: 22,
    lineHeight: 28,
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