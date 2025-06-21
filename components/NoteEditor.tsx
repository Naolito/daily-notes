import React, { useState, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Text,
} from 'react-native';
import { format } from 'date-fns';
import MoodSelector from './MoodSelector';
import ImagePicker from './ImagePicker';
import { Note, Mood } from '../types';
import { NoteService } from '../services/noteService';

export default function NoteEditor() {
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleAddImage = async (uri: string) => {
    setImages([...images, uri]);
    await NoteService.addImageToTodayNote(uri);
  };

  const handleRemoveImage = async (uri: string) => {
    setImages(images.filter(img => img !== uri));
    await NoteService.removeImageFromTodayNote(uri);
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
      <ScrollView style={styles.scrollView}>
        <Text style={styles.dateHeader}>{today}</Text>
        
        <MoodSelector 
          selectedMood={selectedMood}
          onMoodSelect={handleMoodSelect}
        />
        
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="What's on your mind today?"
          placeholderTextColor="#999"
          value={content}
          onChangeText={handleContentChange}
          textAlignVertical="top"
        />
        
        <ImagePicker
          images={images}
          onAddImage={handleAddImage}
          onRemoveImage={handleRemoveImage}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  dateHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    minHeight: 200,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 16,
  },
});