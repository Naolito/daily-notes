import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Pressable,
} from 'react-native';
import { format } from 'date-fns';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MoodSelector from './MoodSelector';
import PaperTexture from './PaperTexture';
import NotebookBackground from './NotebookBackground';
import SimpleDashedBorder from './SimpleDashedBorder';
import { Note, Mood } from '../types';
import { NoteService } from '../services/noteService';
import HybridStorageService from '../services/hybridStorage';
import { responsiveFontSize, responsivePadding, heightPercentage, scale } from '../utils/responsive';
import { VerySadEmoji, SadEmoji, NeutralEmoji, HappyEmoji, VeryHappyEmoji } from '../components/FlatEmojis';
import { Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';


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
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState<Note | null>(null);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateBoxHeight, setDateBoxHeight] = useState(0);
  const [lastText, setLastText] = useState('');
  const textInputRef = React.useRef<TextInput>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const contentRef = useRef(content);
  const selectedMoodRef = useRef(selectedMood);
  const imagesRef = useRef(images);
  
  // Animation values for mood appearance
  const moodFadeAnim = useRef(new Animated.Value(0)).current;
  const moodScaleAnim = useRef(new Animated.Value(0.5)).current;

  // Define saveNote before using it in effects
  const saveNote = useCallback(async (currentContent?: string) => {
    try {
      // Use passed content or fall back to state
      const contentToUse = currentContent ?? content;
      // Treat whitespace-only content as empty
      const trimmedContent = contentToUse.trim();
      const contentToSave = trimmedContent.length === 0 ? '' : contentToUse;
      
      const savedNote = await NoteService.saveCurrentNote(contentToSave, selectedMood, images);
      setNote(savedNote);
    } catch (error) {
      console.error('Error saving note:', error);
    }
  }, [selectedMood, images, content]);

  const debouncedSave = useCallback((contentToSave: string) => {
    // Clear any pending save
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Schedule a new save
    saveTimeoutRef.current = setTimeout(() => {
      saveNote(contentToSave);
    }, 500); // Save after 500ms of no typing
  }, [saveNote]);

  // Update refs whenever values change
  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  
  useEffect(() => {
    selectedMoodRef.current = selectedMood;
  }, [selectedMood]);
  
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    loadCurrentNote();
    
    // Cleanup function to save on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        // Execute the pending save immediately with the latest values from refs
        const latestContent = contentRef.current;
        const latestMood = selectedMoodRef.current;
        const latestImages = imagesRef.current;
        if (latestContent) {
          NoteService.saveCurrentNote(latestContent, latestMood, latestImages).catch(console.error);
        }
      }
    };
  }, []);
  
  useFocusEffect(
    React.useCallback(() => {
      loadCurrentNote();
      
      // Save when navigating away
      return () => {
        // Clear any pending saves and execute immediately
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        // Use refs to get latest values without causing re-renders
        const latestContent = contentRef.current;
        const latestMood = selectedMoodRef.current;
        const latestImages = imagesRef.current;
        if (latestContent !== undefined) {
          NoteService.saveCurrentNote(latestContent, latestMood, latestImages).catch(error => {
            console.error('Error saving on navigation:', error);
          });
        }
      };
    }, [])
  );

  const loadCurrentNote = async () => {
    try {
      // Always use today's date for the Today's Notes screen
      const today = new Date();
      setCurrentDate(today);
      await HybridStorageService.setCurrentDate(today);
      
      const currentNote = await NoteService.getCurrentNote();
      
      if (currentNote) {
        setNote(currentNote);
        // Treat whitespace-only content as empty when loading
        const loadedContent = currentNote.content?.trim() ? currentNote.content : '';
        setContent(loadedContent);
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

  const handleContentChange = (text: string) => {
    let processedText = text;
    
    // Check for "- " pattern anywhere in the text
    const lines = processedText.split('\n');
    let textChanged = false;
    
    for (let i = 0; i < lines.length; i++) {
      // Convert "- " at the beginning of any line to bullet
      if (lines[i].startsWith('- ')) {
        lines[i] = '• ' + lines[i].substring(2);
        textChanged = true;
      }
    }
    
    if (textChanged) {
      processedText = lines.join('\n');
    }
    
    // Handle enter key for bullet continuation
    if (text.length > lastText.length && text.slice(lastText.length) === '\n') {
      const newLines = processedText.split('\n');
      const previousLine = newLines[newLines.length - 2];
      
      // If previous line was a bullet point
      if (previousLine && previousLine.trim().startsWith('•')) {
        // If previous line only had the bullet, remove it and the newline
        if (previousLine.trim() === '•') {
          newLines.splice(newLines.length - 2, 2, '');
          processedText = newLines.join('\n');
        }
        // If previous line had content, add bullet to new line
        else {
          newLines[newLines.length - 1] = '• ';
          processedText = newLines.join('\n');
        }
      }
    }
    
    setLastText(processedText);
    setContent(processedText);
    debouncedSave(processedText);
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
      await HybridStorageService.saveNote(currentNote);
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
      <View style={[styles.loadingContainer, { backgroundColor: theme.backgroundColor }]}>
        <Text style={{ color: theme.primaryText }}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={StyleSheet.absoluteFillObject}>
        {theme.themeType === 'notebook' && <PaperTexture />}
      </View>
      <View style={[styles.contentContainer, { paddingTop: Math.max(insets.top, 40) + 20 }]}>
        <View 
          style={styles.dateWrapper}
          onLayout={(e) => {
            const { height } = e.nativeEvent.layout;
            if (height !== dateBoxHeight) {
              setDateBoxHeight(height);
            }
          }}
        >
          {dateBoxHeight > 0 && theme.useDottedBorders && (
            <SimpleDashedBorder 
              width={screenWidth - 64} 
              height={dateBoxHeight} 
              color={selectedMood ? moodColors[selectedMood] : theme.borderColor} 
            />
          )}
          <View style={[
            styles.dateBox,
            theme.cardStyle && !theme.useDottedBorders && {
              ...theme.cardStyle,
              shadowOffset: { width: 0, height: 2 },
              elevation: 4,
              borderColor: selectedMood ? moodColors[selectedMood] : theme.cardStyle.borderColor,
            }
          ]}>
            <View style={styles.dateRow}>
              <Text style={[
                styles.dateHeader, 
                { 
                  color: theme.primaryText,
                  fontFamily: theme.useHandwrittenFont 
                    ? Platform.select({
                        ios: 'Noteworthy-Bold',
                        android: 'LettersForLearners',
                        default: "'Patrick Hand', cursive"
                      })
                    : undefined,
                  fontSize: theme.useHandwrittenFont ? 32 : 24,
                }
              ]}>{displayDate}</Text>
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
        
        <View style={styles.textInputContainer}>
          {theme.showNotebookLines && (
            <NotebookBackground 
              startFromTop={true}
              textOffset={8}
              lineColor={theme.notebookLineColor}
              opacity={theme.notebookLineOpacity}
            />
          )}
          <TextInput
            ref={textInputRef}
            style={[
              styles.textInput, 
              { 
                color: theme.primaryText,
                fontFamily: theme.useHandwrittenFont ? 'LettersForLearners' : undefined,
                fontSize: theme.useHandwrittenFont ? 26 : 18,
                lineHeight: 26,
                paddingTop: 8, // Match the text offset
                paddingBottom: 150, // Extra bottom padding for scrolling
              }
            ]}
            multiline
            value={content}
            onChangeText={handleContentChange}
            textAlignVertical="top"
            scrollEnabled={true} // Enable TextInput native scroll
            autoCorrect={false}
            autoCapitalize="sentences"
            placeholder="Type here..."
            placeholderTextColor={`${theme.secondaryText}80`}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          />
        </View>
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
    backgroundColor: '#f5f0eb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f0eb',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 32, // More side margins
    paddingTop: 16, // Base padding, safe area insets added dynamically
    flex: 1,
  },
  dateWrapper: {
    position: 'relative',
    marginTop: 0,
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
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  moodInHeader: {
    marginTop: 2,
  },
  textInputContainer: {
    flex: 1,
    position: 'relative',
  },
  textInput: {
    fontSize: 26,
    lineHeight: 26, // Fixed line height to match notebook lines
    color: '#1a1a1a',
    backgroundColor: 'transparent',
    textAlignVertical: 'top',
    letterSpacing: -0.3,
    padding: 0,
    paddingTop: 8, // Default padding
    minHeight: 600, // Ensure enough space for content
    borderWidth: 0,
    borderColor: 'transparent',
  },
});