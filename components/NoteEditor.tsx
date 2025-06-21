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
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MoodSelector from './MoodSelector';
import NotebookBackground from './NotebookBackground';
import PaperTexture from './PaperTexture';
import { Note, Mood } from '../types';
import { NoteService } from '../services/noteService';

export default function NoteEditor() {
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const textInputRef = React.useRef<TextInput>(null);

  useEffect(() => {
    loadTodayNote();
  }, []);

  const loadTodayNote = async () => {
    try {
      const todayNote = await NoteService.getTodayNote();
      if (todayNote) {
        setNote(todayNote);
        setContent(todayNote.content);
        setSelectedMood(todayNote.mood);
        setImages(todayNote.images);
      }
    } catch (error) {
      console.error('Error loading note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveNote = async () => {
    try {
      const savedNote = await NoteService.saveTodayNote(content, selectedMood, images);
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
    await NoteService.updateTodayMood(mood);
  };

  const focusTextInput = () => {
    textInputRef.current?.focus();
  };


  const today = format(new Date(), 'EEEE, MMMM d');

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
      <Link href="/search" asChild>
        <TouchableOpacity style={styles.searchButtonTop}>
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </Link>
      <TouchableOpacity 
        style={styles.touchableArea} 
        activeOpacity={1}
        onPress={focusTextInput}
      >
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.dateHeader}>{today}</Text>
        
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
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 200,
    flexGrow: 1,
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
  textInput: {
    fontSize: 22,
    lineHeight: 28,
    color: '#1a1a1a',
    flex: 1,
    minHeight: 500,
    backgroundColor: 'transparent',
    marginBottom: 16,
    fontFamily: Platform.select({
      ios: 'Noteworthy-Light',
      android: 'sans-serif',
      default: "'Comic Neue', cursive"
    }),
    textAlignVertical: 'top',
    letterSpacing: -0.3,
    fontWeight: '300',
    paddingTop: 0,
    paddingBottom: 20,
  },
  touchableArea: {
    flex: 1,
  },
  searchButtonTop: {
    position: 'absolute',
    top: 10,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
});