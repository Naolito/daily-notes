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
import NotebookBackground from './NotebookBackground';
import PaperTexture from './PaperTexture';
import { Note, Mood } from '../types';
import { NoteService } from '../services/noteService';
import { StorageService } from '../services/storage';
import { generateJuneMockData } from '../utils/generateMockData';
import { responsiveFontSize, responsivePadding, heightPercentage } from '../utils/responsive';

const mockContent = `Today was a good day...
I went to the park and saw the ducks swimming in the pond.
The weather was perfect - sunny but not too hot.

Had lunch with Sarah at that new café downtown.
We talked about our plans for the summer vacation.
Maybe we'll go to the beach or visit the mountains.

I need to remember to call mom tomorrow.
It's her birthday! Got to buy some flowers.

Work was busy but productive.
Finished the project on time.
The team was really happy with the results.

Evening walk was refreshing.
Saw a beautiful sunset - orange and pink clouds.

Feeling grateful today. Life is good.`;

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
      <NotebookBackground />
      <PaperTexture />
      <TouchableOpacity 
        style={styles.touchableArea} 
        activeOpacity={1}
        onPress={focusTextInput}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.dateHeader}>{displayDate}</Text>
        
        <TextInput
          ref={textInputRef}
          style={styles.textInput}
          multiline
          value={content}
          onChangeText={handleContentChange}
          textAlignVertical="top"
        />
      </ScrollView>
      </TouchableOpacity>
      
      <MoodSelector 
        selectedMood={selectedMood}
        onMoodSelect={handleMoodSelect}
      />
      
      {/* Botón temporal para generar datos mock */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          backgroundColor: '#FF6B6B',
          padding: 10,
          borderRadius: 5,
          opacity: 0.8,
        }}
        onPress={async () => {
          await generateJuneMockData();
          alert('Mock data generated for June!');
        }}
      >
        <Text style={{ color: 'white', fontSize: 12 }}>Generate June Data</Text>
      </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: responsivePadding(20),
    paddingTop: responsivePadding(40),
    paddingBottom: heightPercentage(25), // 25% of screen height instead of fixed 200
    flexGrow: 1,
  },
  dateHeader: {
    fontSize: responsiveFontSize(28), // Reduced from 32 for better scaling
    fontWeight: '400',
    marginBottom: responsivePadding(25),
    color: '#2c2c2c',
    fontFamily: Platform.select({
      ios: 'Noteworthy-Bold',
      android: 'sans-serif',
      default: "'Patrick Hand', cursive"
    }),
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  textInput: {
    fontSize: responsiveFontSize(20), // Reduced from 22 for better scaling
    lineHeight: responsiveFontSize(26), // Adjusted line height
    color: '#1a1a1a',
    flex: 1,
    minHeight: heightPercentage(60), // 60% of screen height instead of fixed 500
    backgroundColor: 'transparent',
    marginBottom: responsivePadding(16),
    fontFamily: 'LettersForLearners',
    textAlignVertical: 'top',
    letterSpacing: -0.3,
    paddingTop: 0,
    paddingBottom: responsivePadding(20),
  },
  touchableArea: {
    flex: 1,
  },
});